const pool = require('../config/db');
// Importación robusta para evitar errores si la librería varía de versión
const { stringify } = require('csv-stringify');

// Función auxiliar para sanitizar y validar fechas (YYYY-MM-DD)
const validateDate = (dateString) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        throw new Error('Formato de fecha inválido. Se espera YYYY-MM-DD.');
    }
    return dateString;
};

// ===========================================
// Reporte 1: KPIs Financieros (Ventas, Pedidos, Ganancia)
// ===========================================
exports.getSalesSummary = async (req, res) => {
    try {
        let { fechaInicio, fechaFin } = req.query;

        if (!fechaInicio || !fechaFin) {
            return res.status(400).json({ error: 'Fechas requeridas' });
        }

        const start = `${fechaInicio} 00:00:00`;
        const end = `${fechaFin} 23:59:59`;
        const params = [start, end];

        // 1. KPI: Ventas Totales y Cantidad de Pedidos
        const sqlFinancials = `
            SELECT 
                COALESCE(SUM(total_neto), 0) as totalVentas,
                COUNT(id) as totalPedidos
            FROM venta 
            WHERE operado_en >= ? AND operado_en <= ?
            AND estado = 'PAGADA'
        `;

        const [rowsFinancials] = await pool.query(sqlFinancials, params);
        const stats = rowsFinancials[0] || { totalVentas: 0, totalPedidos: 0 };

        const ticketPromedio = stats.totalPedidos > 0 
            ? stats.totalVentas / stats.totalPedidos 
            : 0;

        // 2. KPI: Ganancia 
        let ganancia = 0;
        try {
            const sqlGanancia = `
                SELECT 
                    COALESCE(SUM(
                        (vd.precio_unitario - 
                            CASE 
                                WHEN vd.costo_unitario >= vd.precio_unitario OR vd.costo_unitario IS NULL 
                                THEN (vd.precio_unitario * 0.70) 
                                ELSE vd.costo_unitario 
                            END
                        ) * vd.cantidad
                    ), 0) as gananciaBruta
                FROM venta_detalle vd
                JOIN venta v ON vd.venta_id = v.id
                WHERE v.operado_en >= ? AND v.operado_en <= ?
                AND v.estado = 'PAGADA'
            `;
            const [rowsGanancia] = await pool.query(sqlGanancia, params);
            ganancia = rowsGanancia[0]?.gananciaBruta || 0;
        } catch (errGanancia) {
            console.warn("Advertencia: No se pudo calcular ganancia. Se enviará 0.", errGanancia.message);
            ganancia = 0;
        }

        res.json({
            ventas: Number(stats.totalVentas).toFixed(2),
            pedidos: Number(stats.totalPedidos),
            ticketPromedio: Number(ticketPromedio).toFixed(2),
            ganancia: Number(ganancia).toFixed(2)
        });

    } catch (error) {
        console.error('Error CRÍTICO en getSalesSummary:', error);
        res.status(500).json({ message: 'Error al calcular KPIs' });
    }
};

// ===========================================
// Reporte 2: Top Productos Vendidos (Optimizado)
// ===========================================
exports.getTopProducts = async (req, res) => {
    try {
        let { fechaInicio, fechaFin, format, categoriaId } = req.query; 

        if (!fechaInicio || !fechaFin) {
            return res.status(400).json({ error: 'Fechas de inicio y fin son requeridas.' });
        }

        try {
            fechaInicio = validateDate(fechaInicio);
            fechaFin = validateDate(fechaFin);
        } catch (e) {
            return res.status(400).json({ error: e.message });
        }

        const start = `${fechaInicio} 00:00:00`;
        const end = `${fechaFin} 23:59:59`;
        const params = [start, end];

        let query = `
            SELECT 
                p.sku,
                p.nombre AS producto_nombre,
                SUM(vd.cantidad) AS cantidad_vendida,
                SUM(vd.importe_neto) AS importe_total,
                SUM(vd.importe_neto - (vd.cantidad * COALESCE(vd.costo_unitario, 0))) AS ganancia_bruta 
            FROM venta_detalle vd
            JOIN venta v ON v.id = vd.venta_id
            JOIN producto p ON p.id = vd.producto_id
            WHERE v.operado_en >= ? AND v.operado_en <= ? 
            AND v.estado = 'PAGADA'
        `;

        if (categoriaId) {
            const id = Number(categoriaId);
            if (!isNaN(id) && id > 0) {
                query += ` AND p.categoria_id = ?`;
                params.push(id);
            }
        }
        
        // Agrupación robusta para evitar only_full_group_by
        query += `
            GROUP BY p.id, p.sku, p.nombre
            ORDER BY cantidad_vendida DESC
            LIMIT 10;
        `;

        const [rows] = await pool.query(query, params);
        
        const topProducts = rows.map(r => ({
            sku: r.sku,
            nombre: r.producto_nombre,
            cantidadVendida: Number(r.cantidad_vendida),
            importeTotal: Number(r.importe_total).toFixed(2),
            gananciaBruta: Number(r.ganancia_bruta).toFixed(2)
        }));

        if (format && format.toLowerCase() === 'csv') {
            stringify(topProducts, { header: true, delimiter: ';' }, (err, output) => {
                if (err) throw err;
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename="reporte_top10_${fechaInicio}_a_${fechaFin}.csv"`);
                return res.status(200).send(output);
            });
        } else {
            res.json(topProducts.map(r => ({
                sku: r.sku,
                nombre: r.nombre,
                cantidadVendida: r.cantidadVendida,
                importeTotal: r.importeTotal,
            })));
        }

    } catch (e) {
        console.error('❌ Error en getTopProducts:', e.message);
        res.status(500).json({ error: 'report_top_products_failed' });
    }
};

// ===========================================
// Reporte 3: Stock Crítico
// ===========================================
exports.getLowStockReport = async (req, res) => {
    try {
        let { threshold, sucursalId } = req.query;
        const umbral = Number(threshold) > 0 ? Number(threshold) : 5;
        const params = [umbral];
        
        let sucursalClause = '';
        if (sucursalId) {
            sucursalClause = ' AND ia.sucursal_id = ? ';
            params.push(Number(sucursalId));
        }

        const sql = `
            SELECT
                p.sku,
                p.nombre,
                p.categoria_id       AS categoriaId,
                ia.cantidad_actual   AS stockActual,
                p.stock_minimo       AS stockMinimo,
                ia.costo_promedio    AS costoPromedio,
                p.precio_venta       AS precioVenta,
                (ia.cantidad_actual * COALESCE(ia.costo_promedio, p.precio_venta)) AS valorInventario
            FROM inventario_actual ia
            JOIN producto p ON ia.producto_id = p.id
            WHERE ia.cantidad_actual < ?
            ${sucursalClause}
            ORDER BY ia.cantidad_actual ASC, p.nombre ASC
        `;

        const [rows] = await pool.query(sql, params);

        const productos = rows.map(r => ({
            sku: r.sku,
            nombre: r.nombre,
            categoriaId: r.categoriaId ? Number(r.categoriaId) : null,
            stockActual: Number(r.stockActual),
            stockMinimo: r.stockMinimo !== null ? Number(r.stockMinimo) : null,
            costoUnitario: r.costoPromedio !== null ? Number(r.costoPromedio) : null,
            precioVenta: Number(r.precioVenta),
            valorInventario: Number(r.valorInventario),
        }));

        const totalValor = productos.reduce((acc, p) => acc + p.valorInventario, 0);

        res.json({
            threshold: umbral,
            totalUnidades: productos.length,
            totalValor: Number(totalValor.toFixed(2)),
            productos,
        });

    } catch (e) {
        console.error('❌ Error en getLowStockReport:', e.message);
        res.status(500).json({ error: 'report_low_stock_failed' });
    }
};

// ===========================================
// Reporte 4: Productos Sin Movimiento (Hueso)
// ===========================================
exports.getNoMovementProducts = async (req, res) => {
    try {
        let { dias, categoriaId, sucursalId } = req.query;
        const diasNum = Number(dias) > 0 ? Number(dias) : 90;

        const params = [];
        let whereClause = '';

        if (categoriaId) {
            const id = Number(categoriaId);
            if (!isNaN(id) && id > 0) {
                whereClause += ` AND p.categoria_id = ? `;
                params.push(id);
            }
        }

        // Consulta que agrupa correctamente todos los campos para evitar errores de SQL Mode
        const sql = `
            SELECT
                p.id,
                p.sku,
                p.nombre,
                p.categoria_id AS categoriaId,
                COALESCE(ia.cantidad_actual, 0) AS stockActual,
                p.stock_minimo AS stockMinimo,
                ia.costo_promedio AS costoPromedio,
                p.precio_venta AS precioVenta,
                (COALESCE(ia.cantidad_actual, 0) * COALESCE(ia.costo_promedio, p.precio_venta)) AS valorInventario,
                MAX(v.operado_en) AS lastSoldDate,
                DATEDIFF(CURDATE(), MAX(v.operado_en)) AS diasSinVenta
            FROM producto p
            LEFT JOIN venta_detalle vd ON vd.producto_id = p.id
            LEFT JOIN venta v ON v.id = vd.venta_id AND v.estado = 'PAGADA'
            LEFT JOIN inventario_actual ia ON ia.producto_id = p.id
            WHERE 1=1
            ${whereClause}
            ${sucursalId ? ' AND ia.sucursal_id = ? ' : ''}
            GROUP BY p.id, p.sku, p.nombre, p.categoria_id, ia.cantidad_actual, p.stock_minimo, ia.costo_promedio, p.precio_venta
            HAVING (MAX(v.operado_en) IS NULL) OR (DATEDIFF(CURDATE(), MAX(v.operado_en)) >= ?)
            ORDER BY diasSinVenta DESC, p.nombre ASC
        `;

        if (sucursalId) params.push(Number(sucursalId));
        params.push(diasNum);

        const [rows] = await pool.query(sql, params);

        const productos = rows.map(r => ({
            id: r.id,
            sku: r.sku,
            nombre: r.nombre,
            categoriaId: r.categoriaId ? Number(r.categoriaId) : null,
            stockActual: Number(r.stockActual),
            stockMinimo: r.stockMinimo,
            lastSoldDate: r.lastSoldDate ? r.lastSoldDate : null,
            diasSinVenta: r.lastSoldDate ? Number(r.diasSinVenta) : null,
        }));

        res.json({
            dias: diasNum,
            totalSinMovimiento: productos.length,
            productos
        });

    } catch (e) {
        console.error('❌ Error en getNoMovementProducts:', e.message);
        res.status(500).json({ error: 'report_no_movement_failed' });
    }
};

// ===========================================
// REPORTE UNIFICADO (EXPORTACIÓN GENERAL)
// ===========================================
exports.getGeneralReportExport = async (req, res) => {
    try {
        let { fechaInicio, fechaFin, categoriaId, threshold, diasSinVenta } = req.query;

        // 1. Validaciones y Configuración
        if (!fechaInicio || !fechaFin) {
            return res.status(400).json({ error: 'Fechas requeridas' });
        }
        const start = `${fechaInicio} 00:00:00`;
        const end = `${fechaFin} 23:59:59`;
        
        // Umbrales por defecto si no vienen en la query
        const umbralStock = Number(threshold) > 0 ? Number(threshold) : 5;
        const diasHueso = Number(diasSinVenta) > 0 ? Number(diasSinVenta) : 90;

        // ============================
        // FASE DE RECOLECCIÓN DE DATOS
        // ============================

        // --- A. KPIS FINANCIEROS Y CONTEO ---
        const sqlFinancials = `
            SELECT 
                COALESCE(SUM(total_neto), 0) as totalVentas,
                COUNT(id) as totalPedidos
            FROM venta 
            WHERE operado_en >= ? AND operado_en <= ? AND estado = 'PAGADA'
        `;
        const [rowsFin] = await pool.query(sqlFinancials, [start, end]);
        const kpis = rowsFin[0] || { totalVentas: 0, totalPedidos: 0 };
        const ticketPromedio = kpis.totalPedidos > 0 ? kpis.totalVentas / kpis.totalPedidos : 0;
        
        const sqlGanancia = `
             SELECT COALESCE(SUM((vd.precio_unitario - COALESCE(vd.costo_unitario, vd.precio_unitario*0.7)) * vd.cantidad), 0) as ganancia
             FROM venta_detalle vd JOIN venta v ON vd.venta_id = v.id
             WHERE v.operado_en >= ? AND v.operado_en <= ? AND v.estado = 'PAGADA'
        `;
        const [rowsGan] = await pool.query(sqlGanancia, [start, end]);
        const ganancia = rowsGan[0] ? rowsGan[0].ganancia : 0;

        // --- B. VENTAS POR CATEGORÍA (Nuevo) ---
        const sqlCats = `
            SELECT c.nombre, SUM(vd.importe_neto) as total, COUNT(DISTINCT v.id) as pedidos
            FROM venta_detalle vd
            JOIN venta v ON v.id = vd.venta_id
            JOIN producto p ON p.id = vd.producto_id
            JOIN categoria c ON c.id = p.categoria_id
            WHERE v.operado_en >= ? AND v.operado_en <= ? AND v.estado = 'PAGADA'
            GROUP BY c.id, c.nombre
            ORDER BY total DESC
        `;
        const [rowsCats] = await pool.query(sqlCats, [start, end]);

        // --- C. EVOLUCIÓN DIARIA (Nuevo para "Comparativa") ---
        const sqlDaily = `
            SELECT DATE(operado_en) as dia, SUM(total_neto) as total, COUNT(id) as pedidos
            FROM venta
            WHERE operado_en >= ? AND operado_en <= ? AND estado = 'PAGADA'
            GROUP BY DATE(operado_en)
            ORDER BY dia ASC
        `;
        const [rowsDaily] = await pool.query(sqlDaily, [start, end]);

        // --- D. TOP PRODUCTOS ---
        let sqlTop = `
            SELECT p.sku, p.nombre, SUM(vd.cantidad) as cant, SUM(vd.importe_neto) as total
            FROM venta_detalle vd
            JOIN venta v ON v.id = vd.venta_id
            JOIN producto p ON p.id = vd.producto_id
            WHERE v.operado_en >= ? AND v.operado_en <= ? AND v.estado = 'PAGADA'
        `;
        const paramsTop = [start, end];
        if (categoriaId) {
            sqlTop += ` AND p.categoria_id = ?`;
            paramsTop.push(categoriaId);
        }
        sqlTop += ` GROUP BY p.id, p.sku, p.nombre ORDER BY cant DESC LIMIT 20`; 
        const [rowsTop] = await pool.query(sqlTop, paramsTop);
        const top5 = rowsTop.slice(0, 5); // Para el resumen ejecutivo

        // --- E. STOCK CRÍTICO & VALORACIÓN ---
        const sqlCritico = `
            SELECT p.sku, p.nombre, SUM(ia.cantidad_actual) as stock_total, p.stock_minimo,
                   SUM(ia.cantidad_actual * COALESCE(ia.costo_promedio, p.precio_venta*0.7)) as valor_estimado
            FROM inventario_actual ia 
            JOIN producto p ON ia.producto_id = p.id
            GROUP BY p.id, p.sku, p.nombre, p.stock_minimo
        `;
        // Traemos todo para calcular valoración total, luego filtramos crítico
        const [rowsInventario] = await pool.query(sqlCritico);
        
        // Procesamiento en memoria para valoración y crítico
        let valoracionTotal = 0;
        let conteoCritico = 0;
        const listaCriticos = [];

        rowsInventario.forEach(r => {
            valoracionTotal += Number(r.valor_estimado || 0);
            if (r.stock_total < umbralStock) {
                conteoCritico++;
                listaCriticos.push(r);
            }
        });

        // --- F. PRODUCTOS SIN MOVIMIENTO (HUESO) ---
        const sqlHueso = `
            SELECT p.sku, p.nombre, 
                   COALESCE(SUM(ia.cantidad_actual), 0) as stock_total, 
                   DATEDIFF(CURDATE(), MAX(v.operado_en)) as dias
            FROM producto p
            LEFT JOIN venta_detalle vd ON vd.producto_id = p.id
            LEFT JOIN venta v ON v.id = vd.venta_id AND v.estado = 'PAGADA'
            LEFT JOIN inventario_actual ia ON ia.producto_id = p.id
            GROUP BY p.id, p.sku, p.nombre
            HAVING (MAX(v.operado_en) IS NULL) OR (DATEDIFF(CURDATE(), MAX(v.operado_en)) >= ?)
            ORDER BY dias DESC
        `;
        const [rowsHueso] = await pool.query(sqlHueso, [diasHueso]);


        // ===========================================
        // CONSTRUCCIÓN DEL CSV "ESTILIZADO"
        // ===========================================
        const reporteData = [];

        // 1. ENCABEZADO CORPORATIVO
        reporteData.push(['REPORTE GERENCIAL INTEGRAL - LIBRERÍA OLIMPIA']);
        reporteData.push(['Fecha de Generación:', new Date().toLocaleString()]);
        reporteData.push(['Periodo Analizado:', `${fechaInicio} al ${fechaFin}`]);
        reporteData.push([]); 

        // 2. TABLERO DE CONTROL EJECUTIVO (Los 10 KPIs Clave)
        reporteData.push(['=== RESUMEN EJECUTIVO (10 KPIs CLAVE) ===', '', '', '']);
        reporteData.push(['INDICADOR ESTRATÉGICO', 'VALOR ACTUAL', 'NOTAS / DETALLES']);
        
        // KPI 1-3: Financieros
        reporteData.push(['1. Ventas Totales Netas', `${Number(kpis.totalVentas).toFixed(2)} Bs`, 'Ingresos reales (solo pagados)']);
        reporteData.push(['2. Ganancia Bruta Estimada', `${Number(ganancia).toFixed(2)} Bs`, 'Utilidad antes de op.']);
        reporteData.push(['3. Ticket Promedio', `${Number(ticketPromedio).toFixed(2)} Bs`, 'Gasto promedio por cliente']);
        
        // KPI 4: Crecimiento (Ver detalle abajo)
        reporteData.push(['4. Crecimiento de Ventas', 'Ver Gráfico Diario', 'Sección: Evolución de Ventas']);
        
        // KPI 5-6: Inventario
        reporteData.push(['5. Nivel de Stock Crítico', `${conteoCritico} productos`, `Items con < ${umbralStock} unid.`]);
        reporteData.push(['6. Valoración del Inventario', `${valoracionTotal.toFixed(2)} Bs`, 'Dinero inmovilizado en almacén']);
        
        // KPI 7: Top 5 (Solo nombres)
        const top5Names = top5.map(p => p.nombre).join(' | ');
        reporteData.push(['7. Top 5 Más Vendidos', top5.length > 0 ? 'Listado Abajo' : 'Sin datos', top5Names.substring(0, 100)]);
        
        // KPI 8-10: Operativos
        reporteData.push(['8. Productos "Hueso"', `${rowsHueso.length} productos`, `Sin ventas hace > ${diasHueso} días`]);
        reporteData.push(['9. Ventas por Categoría', `${rowsCats.length} categorías`, 'Desglose en sección inferior']);
        reporteData.push(['10. Conteo de Pedidos', `${kpis.totalPedidos} transacciones`, 'Volumen total del periodo']);
        
        reporteData.push([]); 
        reporteData.push([]); 

        // 3. SECCIÓN: EVOLUCIÓN DIARIA (KPI 4 Detallado)
        reporteData.push(['--- DETALLE: EVOLUCIÓN DIARIA DE VENTAS (KPI 4) ---']);
        reporteData.push(['Fecha', 'Ventas del Día (Bs)', 'Pedidos', 'Tendencia']);
        rowsDaily.forEach(d => {
            const dateStr = d.dia instanceof Date ? d.dia.toISOString().split('T')[0] : d.dia;
            reporteData.push([dateStr, Number(d.total).toFixed(2), d.pedidos, '-']);
        });
        reporteData.push([]);

        // 4. SECCIÓN: RENDIMIENTO POR CATEGORÍA (KPI 9 Detallado)
        reporteData.push(['--- DETALLE: VENTAS POR CATEGORÍA (KPI 9) ---']);
        reporteData.push(['Categoría', 'Ventas Totales (Bs)', '% del Total', 'Pedidos Involucrados']);
        rowsCats.forEach(c => {
            const pct = kpis.totalVentas > 0 ? (c.total / kpis.totalVentas) * 100 : 0;
            reporteData.push([c.nombre, Number(c.total).toFixed(2), `${pct.toFixed(1)}%`, c.pedidos]);
        });
        reporteData.push([]);

        // 5. SECCIÓN: TOP PRODUCTOS (KPI 7 Detallado)
        reporteData.push(['--- DETALLE: RANKING DE PRODUCTOS (KPI 7) ---']);
        if(categoriaId) reporteData.push([`Filtro Categoría ID: ${categoriaId}`]);
        reporteData.push(['Ranking', 'SKU', 'Producto', 'Unidades Vendidas', 'Ingresos (Bs)']);
        rowsTop.forEach((p, index) => {
            reporteData.push([index + 1, p.sku, p.nombre, p.cant, Number(p.total).toFixed(2)]);
        });
        reporteData.push([]);

        // 6. SECCIÓN: ALERTAS OPERATIVAS (KPI 5 y 8)
        reporteData.push([`--- ALERTA: STOCK CRÍTICO (< ${umbralStock} un.) ---`]);
        reporteData.push(['SKU', 'Producto', 'Stock Total', 'Mínimo Requerido']);
        listaCriticos.forEach(p => {
            reporteData.push([p.sku, p.nombre, p.stock_total, p.stock_minimo || '-']);
        });
        if(listaCriticos.length === 0) reporteData.push(['¡Excelente! No hay productos en nivel crítico.']);
        reporteData.push([]);

        reporteData.push([`--- ALERTA: PRODUCTOS SIN MOVIMIENTO (> ${diasHueso} días) ---`]);
        reporteData.push(['SKU', 'Producto', 'Stock Inmovilizado', 'Días sin Venta']);
        rowsHueso.forEach(p => {
            reporteData.push([p.sku, p.nombre, p.stock_total, p.dias || 'Nunca vendido']);
        });

        // GENERAR CSV CON BOM (\uFEFF)
        stringify(reporteData, { delimiter: ';' }, (err, output) => {
            if (err) {
                console.error('Error al stringify CSV:', err);
                return res.status(500).json({ error: 'Error al construir el archivo CSV' });
            }
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="Reporte_Gerencial_${fechaInicio}.csv"`);
            
            // BOM para Excel
            return res.status(200).send('\uFEFF' + output);
        });

    } catch (e) {
        console.error('❌ Error FATAL en getGeneralReportExport:', e); 
        res.status(500).json({ error: 'Error interno al generar reporte: ' + e.message });
    }
};