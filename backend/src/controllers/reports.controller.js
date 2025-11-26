const pool = require('../config/db');
// 1. Importar la librería para convertir a CSV
const { stringify } = require('csv-stringify');

// Función auxiliar para sanitizar y validar fechas (YYYY-MM-DD)
const validateDate = (dateString) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        throw new Error('Formato de fecha inválido. Se espera YYYY-MM-DD.');
    }
    return dateString;
};


// En reports.controller.js

exports.getSalesSummary = async (req, res) => {
    try {
        let { fechaInicio, fechaFin } = req.query;

        if (!fechaInicio || !fechaFin) {
            return res.status(400).json({ error: 'Fechas requeridas' });
        }

        const params = [fechaInicio, fechaFin];

        // 1. KPI: Ventas Totales y Cantidad de Pedidos
        // CORRECCIÓN: Se usa DATE() para comparar solo la fecha de la columna DATETIME 'operado_en'
        const sqlFinancials = `
            SELECT 
                COALESCE(SUM(total_neto), 0) as totalVentas,
                COUNT(id) as totalPedidos
            FROM venta 
            WHERE DATE(operado_en) >= ? AND DATE(operado_en) <= ?
        `;

        const [rowsFinancials] = await pool.query(sqlFinancials, params);
        const stats = rowsFinancials[0] || { totalVentas: 0, totalPedidos: 0 };

        // Cálculo seguro del Ticket Promedio (evitar división por cero)
        const ticketPromedio = stats.totalPedidos > 0 
            ? stats.totalVentas / stats.totalPedidos 
            : 0;

        // 2. KPI: Ganancia 
        let ganancia = 0;
        try {
            
            // CORRECCIÓN: Se usa DATE() para comparar solo la fecha de la columna DATETIME 'operado_en'
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
                WHERE DATE(v.operado_en) >= ? AND DATE(v.operado_en) <= ?
            `;
            const [rowsGanancia] = await pool.query(sqlGanancia, params);
            ganancia = rowsGanancia[0]?.gananciaBruta || 0;
        } catch (errGanancia) {
            console.warn("Advertencia: No se pudo calcular ganancia (posible falta de columna costo). Se enviará 0.");
            ganancia = 0; // Fallback seguro
        }

        // Respuesta JSON estructurada
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
// Obtener el Top 10 de Productos Vendidos por Rango de Fechas (con filtro por Categoría)
// ===========================================
exports.getTopProducts = async (req, res) => {
    try {
        // AÑADIDO: Capturamos categoriaId
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

        // 1. Base de la consulta y parámetros de fecha
        let query = `
            SELECT 
            p.sku,
            p.nombre AS producto_nombre,
            SUM(vd.cantidad) AS cantidad_vendida,
            SUM(vd.importe_neto) AS importe_total,
            SUM(vd.importe_neto - (vd.cantidad * vd.costo_unitario)) AS ganancia_bruta 
            FROM venta_detalle vd
            JOIN venta v ON v.id = vd.venta_id
            JOIN producto p ON p.id = vd.producto_id
            WHERE DATE(v.operado_en) >= ? AND DATE(v.operado_en) <= ? AND v.estado = 'PAGADA'
        `;
        const params = [fechaInicio, fechaFin];

        // 2. LÓGICA DE FILTRADO POR CATEGORÍA
        if (categoriaId) {
            // Aseguramos que sea un número válido antes de añadirlo
            const id = Number(categoriaId);
            if (!isNaN(id) && id > 0) {
                query += ` AND p.categoria_id = ?`;
                params.push(id);
            }
        }
        
        // 3. Cláusulas de agrupación, ordenación y límite
        query += `
            GROUP BY p.id, p.sku, p.nombre
            ORDER BY cantidad_vendida DESC
            LIMIT 10;
        `;

        const [rows] = await pool.query(query, params);
        
        // Formatear los datos y asegurar los decimales
        const topProducts = rows.map(r => ({
            sku: r.sku,
            nombre: r.producto_nombre,
            cantidadVendida: Number(r.cantidad_vendida),
            importeTotal: Number(r.importe_total).toFixed(2),
            gananciaBruta: Number(r.ganancia_bruta).toFixed(2) // Incluir ganancia para el CSV
        }));

        // 4. Lógica Condicional de CSV
        if (format && format.toLowerCase() === 'csv') {
            stringify(topProducts, { header: true, delimiter: ';' }, (err, output) => {
                if (err) throw err;
                
                // Configurar cabeceras para descarga de archivo
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename="reporte_top10_${fechaInicio}_a_${fechaFin}${categoriaId ? `_cat${categoriaId}` : ''}.csv"`);
                return res.status(200).send(output);
            });
        } else {
            // Respuesta JSON por defecto
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
// KPI Stock Crítico + Valoración de Inventario
// ===========================================
exports.getLowStockReport = async (req, res) => {
    try {
        // threshold = umbral de stock crítico (por defecto 5 unidades)
        let { threshold, sucursalId } = req.query;

        const umbral = Number(threshold) > 0 ? Number(threshold) : 5;

        // Parámetros para la consulta
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
                p.categoria_id       AS categoriaId,   -- 👈 NUEVO
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
            categoriaId: r.categoriaId ? Number(r.categoriaId) : null, // 👈 NUEVO
            stockActual: Number(r.stockActual),
            stockMinimo: r.stockMinimo !== null ? Number(r.stockMinimo) : null,
            costoUnitario: r.costoPromedio !== null ? Number(r.costoPromedio) : null,
            precioVenta: Number(r.precioVenta),
            valorInventario: Number(r.valorInventario),
        }));

        // KPI: número de productos críticos y valoración total
        const totalValor = productos.reduce(
            (acc, p) => acc + p.valorInventario,
            0
        );

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
// ===================== NUEVO: Productos Sin Movimiento ("Hueso") =====================
// GET /api/admin/reportes/sin-movimiento?dias=90&categoriaId=...&sucursalId=...
exports.getNoMovementProducts = async (req, res) => {
    try {
        // dias = número de días sin venta para considerar "sin movimiento"
        let { dias, categoriaId, sucursalId } = req.query;
        const diasNum = Number(dias) > 0 ? Number(dias) : 90; // default 90 días

        const params = [];
        let whereClause = ''; // para filtros no agregados en HAVING

        // Filtrar por categoría si se proporciona
        if (categoriaId) {
            const id = Number(categoriaId);
            if (!isNaN(id) && id > 0) {
                whereClause += ` AND p.categoria_id = ? `;
                params.push(id);
            }
        }

        // Filtrar por sucursal (usamos inventario_actual.sucursal_id)
        let sucursalClause = '';
        if (sucursalId) {
            const s = Number(sucursalId);
            if (!isNaN(s) && s > 0) {
                sucursalClause = ` AND ia.sucursal_id = ? `;
                // we'll push later for consistency
            }
        }

        // Nota: usamos LEFT JOIN con venta/venta_detalle para obtener la última fecha de venta por producto.
        // Luego usamos HAVING para seleccionar productos con MAX(operado_en) IS NULL (nunca vendidos)
        // o con DATEDIFF >= diasNum
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
                MAX(DATE(v.operado_en)) AS lastSoldDate,
                DATEDIFF(CURDATE(), MAX(DATE(v.operado_en))) AS diasSinVenta
            FROM producto p
            LEFT JOIN venta_detalle vd ON vd.producto_id = p.id
            LEFT JOIN venta v ON v.id = vd.venta_id AND v.estado = 'PAGADA'
            LEFT JOIN inventario_actual ia ON ia.producto_id = p.id
            WHERE 1=1
            ${whereClause}
            ${sucursalId ? ' AND ia.sucursal_id = ? ' : ''}
            GROUP BY p.id, p.sku, p.nombre, p.categoria_id, ia.cantidad_actual, p.stock_minimo, ia.costo_promedio, p.precio_venta
            HAVING (MAX(DATE(v.operado_en)) IS NULL) OR (DATEDIFF(CURDATE(), MAX(DATE(v.operado_en))) >= ?)
            ORDER BY diasSinVenta DESC, p.nombre ASC
        `;

        // push sucursalId param if needed
        if (sucursalId) {
            params.push(Number(sucursalId));
        }
        // finally push dias threshold
        params.push(diasNum);

        const [rows] = await pool.query(sql, params);

        // Mapear resultados con seguridad
        const productos = rows.map(r => ({
            id: r.id,
            sku: r.sku,
            nombre: r.nombre,
            categoriaId: r.categoriaId ? Number(r.categoriaId) : null,
            stockActual: Number(r.stockActual),
            stockMinimo: r.stockMinimo !== null ? Number(r.stockMinimo) : null,
            costoUnitario: r.costoPromedio !== null ? Number(r.costoPromedio) : null,
            precioVenta: Number(r.precioVenta),
            valorInventario: Number(r.valorInventario),
            lastSoldDate: r.lastSoldDate ? r.lastSoldDate : null,
            diasSinVenta: r.lastSoldDate ? Number(r.diasSinVenta) : null, // null => nunca vendido
        }));

        // KPI: conteo de productos sin movimiento
        const totalSinMovimiento = productos.length;

        res.json({
            dias: diasNum,
            totalSinMovimiento,
            productos
        });

    } catch (e) {
        console.error('❌ Error en getNoMovementProducts:', e.message);
        res.status(500).json({ error: 'report_no_movement_failed' });
    }
};