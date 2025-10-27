const pool = require('../config/db');

// Función auxiliar para sanitizar y validar fechas (YYYY-MM-DD)
const validateDate = (dateString) => {
    // Implementación simple de validación/formato, ajusta según necesidad
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        throw new Error('Formato de fecha inválido. Se espera YYYY-MM-DD.');
    }
    return dateString;
};

// ===========================================
// Obtener Ventas Totales y Pedidos por Rango de Fechas
// Endpoint: GET /api/admin/reportes/ventas-por-dia
// ===========================================
exports.getSalesSummary = async (req, res) => {
    try {
        let { fechaInicio, fechaFin } = req.query;

        // Validar y sanear fechas (asumiendo YYYY-MM-DD)
        if (!fechaInicio || !fechaFin) {
            return res.status(400).json({ error: 'Fechas de inicio y fin son requeridas.' });
        }

        try {
            fechaInicio = validateDate(fechaInicio);
            fechaFin = validateDate(fechaFin);
        } catch (e) {
            return res.status(400).json({ error: e.message });
        }
        
        const params = [fechaInicio, fechaFin];

        // Consulta 1: Ventas Totales y Pedidos Recibidos
        const [summaryRows] = await pool.query(
            `
            SELECT 
                COALESCE(SUM(v.total_neto), 0) AS ventas_totales,
                COALESCE(COUNT(DISTINCT p.id), 0) AS pedidos_recibidos
            FROM venta v
            LEFT JOIN pedido p ON p.id = v.pedido_id
            WHERE DATE(v.operado_en) >= ? AND DATE(v.operado_en) <= ? AND v.estado = 'PAGADA';
            `,
            params
        );
        
        // Consulta 2: Nuevos Clientes (clientes creados en el rango de fechas)
        const [clientRows] = await pool.query(
            `
            SELECT COUNT(id) AS nuevos_clientes 
            FROM cliente 
            WHERE DATE(creado_en) >= ? AND DATE(creado_en) <= ?;
            `,
            params
        );


        const summary = summaryRows[0] || { ventas_totales: 0, pedidos_recibidos: 0 };
        const clients = clientRows[0] || { nuevos_clientes: 0 };

        res.json({
            ventasTotales: Number(summary.ventas_totales).toFixed(2),
            pedidosRecibidos: summary.pedidos_recibidos,
            nuevosClientes: clients.nuevos_clientes
        });

    } catch (e) {
        console.error('❌ Error en getSalesSummary:', e.message);
        res.status(500).json({ error: 'report_summary_failed' });
    }
};


// ===========================================
// Obtener el Top 10 de Productos Vendidos por Rango de Fechas
// Endpoint: GET /api/admin/reportes/top-productos
// ===========================================
exports.getTopProducts = async (req, res) => {
    try {
        let { fechaInicio, fechaFin } = req.query;

        if (!fechaInicio || !fechaFin) {
            return res.status(400).json({ error: 'Fechas de inicio y fin son requeridas.' });
        }

        try {
            fechaInicio = validateDate(fechaInicio);
            fechaFin = validateDate(fechaFin);
        } catch (e) {
            return res.status(400).json({ error: e.message });
        }

        const params = [fechaInicio, fechaFin];

        const [rows] = await pool.query(
            `
            SELECT 
                p.sku,
                p.nombre AS producto_nombre,
                COALESCE(SUM(vd.cantidad), 0) AS cantidad_vendida,
                COALESCE(SUM(vd.importe_neto), 0) AS importe_total
            FROM venta_detalle vd
            JOIN venta v ON v.id = vd.venta_id
            JOIN producto p ON p.id = vd.producto_id
            WHERE DATE(v.operado_en) >= ? AND DATE(v.operado_en) <= ? AND v.estado = 'PAGADA'
            GROUP BY p.id, p.sku, p.nombre
            ORDER BY cantidad_vendida DESC
            LIMIT 10;
            `,
            params
        );
        
        const topProducts = rows.map(r => ({
            sku: r.sku,
            nombre: r.producto_nombre,
            cantidadVendida: Number(r.cantidad_vendida),
            importeTotal: Number(r.importe_total).toFixed(2)
        }));

        res.json(topProducts);

    } catch (e) {
        console.error('❌ Error en getTopProducts:', e.message);
        res.status(500).json({ error: 'report_top_products_failed' });
    }
};