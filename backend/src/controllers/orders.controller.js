const pool = require('../config/db');

// =============================
// Obtener lista de pedidos del cliente
// =============================
exports.getOrders = async (req, res) => {
    try {
        // Asume que el ID del usuario autenticado está en req.user.id
        // y que el usuario_id en la tabla pedido se corresponde con el cliente registrado
        // NOTA: En tu esquema, 'pedido' tiene FK a 'cliente_id' y a 'usuario_id'.
        // Para "cliente registrado", asumiremos que filtramos por 'usuario_id'.
        const clienteId = req.user.sub; 
        if (!clienteId) {
            return res.status(401).json({ error: 'unauthorized' });
        }

        const [rows] = await pool.query(
            `
            SELECT
                p.id,
                p.fecha_pedido,
                p.total_neto,
                p.estado,
                s.nombre AS sucursal_nombre
            FROM pedido p
            JOIN sucursal s ON s.id = p.sucursal_id
            WHERE p.cliente_id = ?
            ORDER BY p.fecha_pedido DESC;
            `,
            [clienteId]
        );

        const items = rows.map(r => ({
            id: r.id,
            fecha: r.fecha_pedido,
            total: Number(r.total_neto).toFixed(2),
            estado: r.estado,
            sucursal: r.sucursal_nombre
        }));

        res.json(items);
    } catch (e) {
        console.error('❌ Error en getOrders:', e.message);
        res.status(500).json({ error: 'orders_failed' });
    }
};

// =============================
// Obtener detalle de un pedido específico
// =============================
exports.getOrderDetails = async (req, res) => {
    try {
        const clienteId = req.user.sub;
        const pedidoId = parseInt(req.params.id);

        if (!clienteId) {
            return res.status(401).json({ error: 'unauthorized' });
        }
        if (isNaN(pedidoId)) {
            return res.status(400).json({ error: 'invalid_pedido_id' });
        }

        // 1. Obtener los detalles del pedido principal y verificar que pertenezca al usuario
        const [pedidoRows] = await pool.query(
            `
            SELECT
                p.id, p.fecha_pedido, p.total_neto, p.estado,
                s.nombre AS sucursal_nombre,
                c.nombre AS cliente_nombre
            FROM pedido p
            JOIN sucursal s ON s.id = p.sucursal_id
            JOIN cliente c ON c.id = p.cliente_id
            WHERE p.id = ? AND p.cliente_id = ?;
            `,
            [pedidoId, clienteId]
        );

        if (!pedidoRows.length) {
            return res.status(404).json({ error: 'pedido_not_found_or_unauthorized' });
        }

        const pedido = pedidoRows[0];

        // 2. Obtener la lista de productos del detalle del pedido
        const [detalleRows] = await pool.query(
            `
            SELECT
                pd.cantidad,
                pd.precio_unitario,
                pd.importe_neto,
                prod.nombre AS producto_nombre,
                prod.sku
            FROM pedido_detalle pd
            JOIN producto prod ON prod.id = pd.producto_id
            WHERE pd.pedido_id = ?;
            `,
            [pedidoId]
        );

        const detalle = detalleRows.map(d => ({
            nombre: d.producto_nombre,
            sku: d.sku,
            cantidad: Number(d.cantidad),
            precio_unitario: Number(d.precio_unitario).toFixed(2),
            importe: Number(d.importe_neto).toFixed(2)
        }));

        res.json({
            id: pedido.id,
            fecha: pedido.fecha_pedido,
            total: Number(pedido.total_neto).toFixed(2),
            estado: pedido.estado,
            sucursal: pedido.sucursal_nombre,
            cliente: pedido.cliente_nombre,
            detalle: detalle
        });

    } catch (e) {
        console.error('❌ Error en getOrderDetails:', e.message);
        res.status(500).json({ error: 'order_detail_failed' });
    }
};