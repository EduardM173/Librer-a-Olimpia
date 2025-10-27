const express = require("express");
const pool = require("../config/db");
const router = express.Router();

// ✅ Listar todos los pedidos
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.id, c.nombre AS cliente, u.nombre AS usuario,
       s.nombre AS sucursal, p.total_neto, p.estado, p.fecha_pedido
        FROM pedido p
        JOIN cliente c ON p.cliente_id = c.id
        JOIN usuario u ON p.usuario_id = u.id
        JOIN sucursal s ON p.sucursal_id = s.id
        ORDER BY p.fecha_pedido DESC;
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener pedidos" });
  }
});

// ✅ Ver detalle de un pedido
router.get("/:id", async (req, res) => {
  try {
    const pedidoId = req.params.id;

    // 🔹 1. Obtener información general del pedido (cliente + dirección)
    const [pedidoRows] = await pool.query(
      `
      SELECT 
        p.id, 
        p.fecha_pedido, 
        p.estado,
        p.total_neto,
        p.direccion_envio,         
        c.nombre AS cliente, 
        c.tipo_cliente, 
        c.nit_ci
      FROM pedido p
      JOIN cliente c ON p.cliente_id = c.id
      WHERE p.id = ?;
      `,
      [pedidoId]
    );

    if (pedidoRows.length === 0)
      return res.status(404).json({ message: "Pedido no encontrado" });

    const pedido = pedidoRows[0];

    // 🔹 2. Obtener detalle del pedido (los productos)
    const [detalleRows] = await pool.query(
      `
      SELECT 
        pr.nombre AS producto,
        pd.cantidad,
        pd.precio_unitario,
        pd.importe_neto
      FROM pedido_detalle pd
      JOIN producto pr ON pd.producto_id = pr.id
      WHERE pd.pedido_id = ?;
      `,
      [pedidoId]
    );

    // 🔹 3. Calcular total si no está en la tabla
    const totalCalculado = detalleRows.reduce(
      (acc, item) => acc + Number(item.importe_neto || 0),
      0
    );

    // 🔹 4. Enviar respuesta estructurada correctamente
    const resultado = {
      pedido: {
        id: pedido.id,
        cliente: pedido.cliente,
        tipo_cliente: pedido.tipo_cliente,
        nit_ci: pedido.nit_ci,
        direccion_envio: pedido.direccion_envio,
        fecha_pedido: pedido.fecha_pedido,
        estado: pedido.estado,
        detalle: detalleRows,
        total_calculado: totalCalculado,
      },
    };

    res.json(resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener detalle del pedido" });
  }
});


// ✅ Cambiar estado
router.patch("/:id/estado", async (req, res) => {
  try {
    const { estado } = req.body;
    await pool.query("UPDATE pedido SET estado = ? WHERE id = ?", [
      estado,
      req.params.id,
    ]);
    res.json({ message: `Estado del pedido #${req.params.id} actualizado a ${estado}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar estado" });
  }
});

module.exports = router;
