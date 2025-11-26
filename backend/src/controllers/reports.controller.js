const pool = require('../config/db');
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

        // OPTIMIZACIÓN SQL (SARGABLE): 
        // Agregamos horas para comparar directamente contra DATETIME sin usar DATE()
        // Esto permite que la base de datos use el índice 'idx_venta_estado_fecha'
        const start = `${fechaInicio} 00:00:00`;
        const end = `${fechaFin} 23:59:59`;
        const params = [start, end];

        // 1. KPI: Ventas Totales y Cantidad de Pedidos
        // CORRECCIÓN: Quitamos DATE() y usamos BETWEEN o >= <= directo
        const sqlFinancials = `
            SELECT 
                COALESCE(SUM(total_neto), 0) as totalVentas,
                COUNT(id) as totalPedidos
            FROM venta 
            WHERE operado_en >= ? AND operado_en <= ?
            AND estado = 'PAGADA' -- Aseguramos contar solo las pagadas
        `;

        const [rowsFinancials] = await pool.query(sqlFinancials, params);
        const stats = rowsFinancials[0] || { totalVentas: 0, totalPedidos: 0 };

        // Cálculo seguro del Ticket Promedio
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
            console.warn("Advertencia: No se pudo calcular ganancia. Se enviará 0.");
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

        // OPTIMIZACIÓN: Definir rango completo
        const start = `${fechaInicio} 00:00:00`;
        const end = `${fechaFin} 23:59:59`;
        const params = [start, end];

        // Consulta Optimizada
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
            WHERE v.operado_en >= ? AND v.operado_en <= ? 
            AND v.estado = 'PAGADA'
        `;

        // Filtro dinámico por Categoría
        if (categoriaId) {
            const id = Number(categoriaId);
            if (!isNaN(id) && id > 0) {
                // Usamos el índice de categoría en producto
                query += ` AND p.categoria_id = ?`;
                params.push(id);
            }
        }
        
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

        // NOTA: DATEDIFF funciona bien aquí porque es post-agregación o sobre un conjunto menor,
        // pero hemos optimizado el JOIN principal para asegurar que use índices en Venta.
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