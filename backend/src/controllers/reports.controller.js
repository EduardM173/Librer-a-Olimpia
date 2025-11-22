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
        // Usamos nombres estándar de tablas
        const sqlFinancials = `
            SELECT 
                COALESCE(SUM(total_neto), 0) as totalVentas,
                COUNT(id) as totalPedidos
            FROM venta 
            WHERE operado_en BETWEEN ? AND ?
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
                WHERE v.operado_en BETWEEN ? AND ?
            `;
            const [rowsGanancia] = await pool.query(sqlGanancia, params);
            ganancia = rowsGanancia[0]?.gananciaBruta || 0;
        } catch (errGanancia) {
            console.warn("Advertencia: No se pudo calcular ganancia (posible falta de columna costo). Se enviará 0.");
            ganancia = 0; // Fallback seguro
        }

        // Respuesta JSON estructurada
        res.json({
            ventas: Number(stats.totalVentas),
            pedidos: Number(stats.totalPedidos),
            ticketPromedio: Number(ticketPromedio),
            ganancia: Number(ganancia)
        });

    } catch (error) {
        console.error('Error CRÍTICO en getSalesSummary:', error);
        res.status(500).json({ message: 'Error al calcular KPIs' });
    }
};;


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