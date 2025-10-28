const express = require("express");
const pool = require("../config/db");
const auth = require("../middlewares/auth");
const router = express.Router();

/* ==========================================================
   🔹 RUTA: Pedidos del cliente autenticado (solo CLIENTE)
   ========================================================== */
router.get("/mis-pedidos", auth, async (req, res) => {
  try {
    // 🔸 Aseguramos que solo un cliente pueda acceder
    const kind = req.user.kind?.toLowerCase?.();
    if (kind !== "cliente") {
      return res.status(403).json({
        error: "only_clients",
        message: "Solo los clientes pueden ver sus pedidos.",
      });
    }

    const clienteId = req.user.sub;
    if (!clienteId) {
      return res.status(401).json({ error: "unauthorized", message: "ID de cliente no válido" });
    }

    const [rows] = await pool.query(
      `
      SELECT 
        p.id,
        p.estado,
        p.total_neto,
        DATE_FORMAT(p.fecha_pedido, '%Y-%m-%d %H:%i') AS fecha_pedido
      FROM pedido p
      WHERE p.cliente_id = ?
      ORDER BY p.fecha_pedido DESC;
      `,
      [clienteId]
    );

    res.json(rows);
  } catch (error) {
    console.error("❌ Error en /mis-pedidos:", error);
    res.status(500).json({ message: "Error al obtener pedidos del cliente" });
  }
});

/* ==========================================================
   🔹 RUTA: Listar todos los pedidos (solo ADMIN o usuario interno)
   ========================================================== */
router.get("/", auth, async (req, res) => {
  try {
    const kind = req.user.kind?.toLowerCase?.();
    const rol = req.user.rol?.toLowerCase?.();

    // 🔸 Admin o usuario interno autorizado
    const isAdmin = kind === "usuario" || kind === "admin" || rol === "admin";

    if (!isAdmin) {
      return res.status(403).json({
        error: "only_admins",
        message: "No autorizado para ver todos los pedidos.",
      });
    }

    const [rows] = await pool.query(`
      SELECT 
        p.id, 
        c.nombre AS cliente, 
        u.nombre AS usuario,
        s.nombre AS sucursal, 
        p.total_neto, 
        p.estado, 
        DATE_FORMAT(p.fecha_pedido, '%Y-%m-%d %H:%i') AS fecha_pedido
      FROM pedido p
      JOIN cliente c ON p.cliente_id = c.id
      JOIN usuario u ON p.usuario_id = u.id
      JOIN sucursal s ON p.sucursal_id = s.id
      ORDER BY p.fecha_pedido DESC;
    `);

    res.json(rows);
  } catch (error) {
    console.error("❌ Error en GET /pedidos:", error);
    res.status(500).json({ message: "Error al obtener pedidos" });
  }
});

/* ==========================================================
   🔹 RUTA: Ver detalle de un pedido (cliente o admin)
   ========================================================== */
router.get("/:id", auth, async (req, res) => {
  try {
    const pedidoId = req.params.id;
    const kind = req.user.kind?.toLowerCase?.();
    const rol = req.user.rol?.toLowerCase?.();

    const [pedidoRows] = await pool.query(
      `
      SELECT 
        p.id, 
        p.fecha_pedido, 
        p.estado,
        p.total_neto,
        p.direccion_envio,         
        c.id AS cliente_id,
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

    // 🔸 Solo el cliente dueño o un admin pueden verlo
    const isAdmin = kind === "usuario" || kind === "admin" || rol === "admin";
    if (kind === "cliente" && pedido.cliente_id !== req.user.sub) {
      return res.status(403).json({ message: "No autorizado para ver este pedido" });
    }

    // Detalle del pedido
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

    const totalCalculado = detalleRows.reduce(
      (acc, item) => acc + Number(item.importe_neto || 0),
      0
    );

    res.json({
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
    });
  } catch (error) {
    console.error("❌ Error en GET /pedidos/:id:", error);
    res.status(500).json({ message: "Error al obtener detalle del pedido" });
  }
});

/* ==========================================================
   🔹 RUTA: Cambiar estado (solo ADMIN)
   ========================================================== */
router.patch("/:id/estado", auth, async (req, res) => {
  try {
    const kind = req.user.kind?.toLowerCase?.();
    const rol = req.user.rol?.toLowerCase?.();

    const isAdmin = kind === "usuario" || kind === "admin" || rol === "admin";
    if (!isAdmin) {
      return res.status(403).json({
        error: "only_admins",
        message: "Solo administradores pueden modificar el estado del pedido.",
      });
    }

    const { estado } = req.body;
    await pool.query("UPDATE pedido SET estado = ? WHERE id = ?", [estado, req.params.id]);

    res.json({ message: `Estado del pedido #${req.params.id} actualizado a ${estado}` });
  } catch (error) {
    console.error("❌ Error en PATCH /estado:", error);
    res.status(500).json({ message: "Error al actualizar estado" });
  }
});

module.exports = router;
