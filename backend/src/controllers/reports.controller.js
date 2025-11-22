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


exports.getSalesSummary = async (req, res) => {
    try {
        let { fechaInicio, fechaFin } = req.query;

        // Validación básica de fechas
        if (!fechaInicio || !fechaFin) {
            return res.status(400).json({ error: 'Fechas requeridas' });
        }

        const params = [fechaInicio, fechaFin];

        // 1. KPI: Ventas Totales y Cantidad de Pedidos
        // Usamos COALESCE para que si es null devuelva 0
        const sqlFinancials = `
            SELECT 
                COALESCE(SUM(monto_total), 0) as totalVentas,
                COUNT(id) as totalPedidos,
                COALESCE(SUM(monto_total) / NULLIF(COUNT(id), 0), 0) as ticketPromedio
            FROM venta 
            WHERE operado_en BETWEEN ? AND ?
        `;

        const [rowsFinancials] = await pool.query(sqlFinancials, params);
        const stats = rowsFinancials[0];

        // 2. KPI: Comparativa 
        // Para el MVP calcularemos la ganancia bruta estimada (Precio - Costo)
        // Necesitamos hacer JOIN con detalle_venta
        const sqlGanancia = `
            SELECT 
                COALESCE(SUM((vd.precio_unitario_historico - vd.costo_unitario) * vd.cantidad), 0) as gananciaBruta
            FROM venta_detalle vd
            JOIN venta v ON vd.venta_id = v.id
            WHERE v.operado_en BETWEEN ? AND ?
        `;
        
        const [rowsGanancia] = await pool.query(sqlGanancia, params);
        const ganancia = rowsGanancia[0].gananciaBruta;

        // Respuesta JSON estructurada para el Frontend
        res.json({
            ventas: Number(stats.totalVentas),
            pedidos: Number(stats.totalPedidos),
            ticketPromedio: Number(stats.ticketPromedio),
            ganancia: Number(ganancia)
        });

    } catch (error) {
        console.error('Error en getSalesSummary:', error);
        res.status(500).json({ message: 'Error al calcular KPIs' });
    }
};


// ===========================================
// Obtener el Top 10 de Productos Vendidos por Rango de Fechas
// ===========================================
exports.getTopProducts = async (req, res) => {
    try {
        let { fechaInicio, fechaFin, format } = req.query; // Captura 'format'

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
            SUM(vd.cantidad) AS cantidad_vendida,
            SUM(vd.importe_neto) AS importe_total,
            SUM(vd.importe_neto - (vd.cantidad * vd.costo_unitario)) AS ganancia_bruta 
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
        
        // Formatear los datos y asegurar los decimales
        const topProducts = rows.map(r => ({
            sku: r.sku,
            nombre: r.producto_nombre,
            cantidadVendida: Number(r.cantidad_vendida),
            importeTotal: Number(r.importe_total).toFixed(2),
            gananciaBruta: Number(r.ganancia_bruta).toFixed(2) // Incluir ganancia para el CSV
        }));

        // 3. Lógica Condicional de CSV
        if (format && format.toLowerCase() === 'csv') {
            stringify(topProducts, { header: true, delimiter: ';' }, (err, output) => {
                if (err) throw err;
                
                // Configurar cabeceras para descarga de archivo
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename="reporte_top10_${fechaInicio}_a_${fechaFin}.csv"`);
                return res.status(200).send(output);
            });
        } else {
            // Respuesta JSON por defecto
            res.json(topProducts.map(r => ({
                 // Devolver el JSON original (sin ganancia) para mantener la compatibilidad 
                 // o incluirla si es requerida en la interfaz. Aquí la mantendremos simple.
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