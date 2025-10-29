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

// ===========================================
// Obtener Ventas Totales y Pedidos por Rango de Fechas
// ===========================================
exports.getSalesSummary = async (req, res) => {
    try {
        let { fechaInicio, fechaFin, format } = req.query; // Captura 'format'

        // Validar y sanear fechas
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
        
        // Consulta 2: Nuevos Clientes
        const [clientRows] = await pool.query(
            `
            SELECT COUNT(id) AS nuevos_clientes 
            FROM cliente 
            WHERE DATE(creado_en) >= ? AND DATE(creado_en) <= ?;
            `,
            params
        );

        const summaryData = summaryRows[0] || { ventas_totales: 0, pedidos_recibidos: 0 };
        const clientsData = clientRows[0] || { nuevos_clientes: 0 };

        // 2. Formatear el resultado final
        const finalResult = {
            rango_fechas: `${fechaInicio} - ${fechaFin}`,
            ventasTotales: Number(summaryData.ventas_totales).toFixed(2),
            pedidosRecibidos: summaryData.pedidos_recibidos,
            nuevosClientes: clientsData.nuevos_clientes
        };

        // 3. Lógica Condicional de CSV
        if (format && format.toLowerCase() === 'csv') {
            const dataToCsv = [finalResult]; // Convertir objeto a array para stringify
            
            stringify(dataToCsv, { header: true, delimiter: ';' }, (err, output) => {
                if (err) throw err;
                
                // Configurar cabeceras para descarga de archivo
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename="reporte_resumen_${fechaInicio}_a_${fechaFin}.csv"`);
                return res.status(200).send(output);
            });
        } else {
            // Respuesta JSON por defecto
            res.json(finalResult);
        }

    } catch (e) {
        console.error('❌ Error en getSalesSummary:', e.message);
        res.status(500).json({ error: 'report_summary_failed' });
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