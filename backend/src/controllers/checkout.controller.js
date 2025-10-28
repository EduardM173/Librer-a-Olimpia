const pool = require('../config/db');

/**
 * POST /api/checkout
 * Body: { envio:{zona,calle,numero_casa}, factura:{nit_ci,razon_social,celular}, items:[{id,qty}] }
 * Requiere token de cliente (authCliente).
 */
exports.checkout = async (req, res) => {
  const clienteId = req.user?.sub;
  const { envio = {}, factura = {}, items = [] } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'empty_cart' });
  }

  const cn = await pool.getConnection();
  try {
    await cn.beginTransaction();

    // 1) Traer precios y stock reales de BD, y validar
    const ids = items.map(i => Number(i.id)).filter(Boolean);
    const [prodRows] = await cn.query(
      `
      SELECT p.id, p.nombre, p.precio_venta,
             p.activo,
             IFNULL(SUM(ia.cantidad_actual),0) AS stock
        FROM producto p
        LEFT JOIN inventario_actual ia ON ia.producto_id = p.id
       WHERE p.id IN ( ${ids.map(()=>'?').join(',')} )
       GROUP BY p.id
      `,
      ids
    );

    const byId = new Map(prodRows.map(r => [r.id, r]));
    for (const it of items) {
      const row = byId.get(it.id);
      if (!row || row.activo === 0) {
        await cn.rollback();
        return res.status(409).json({ error: 'producto_invalido', id: it.id });
      }
      if (row.stock < it.qty) {
        await cn.rollback();
        return res.status(409).json({
          error: 'stock_insuficiente',
          detail: { id: row.id, nombre: row.nombre, stock: row.stock, solicitado: it.qty }
        });
      }
    }

    // 2) Calcular total con precio_venta de BD
    let total = 0;
    const itemsOk = items.map(it => {
      const r = byId.get(it.id);
      const pu = Number(r.precio_venta);
      const qty = Number(it.qty);
      total += pu * qty;
      return { id: r.id, nombre: r.nombre, precio_unit: pu, qty };
    });

    // 3) (Opcional) completar datos del cliente si están vacíos
    //    Solo rellenamos columnas nulas: zona/calle/numero_casa/nit_ci
    await cn.query(
      `
      UPDATE cliente
         SET zona = COALESCE(NULLIF(zona,''), ?),
             calle = COALESCE(NULLIF(calle,''), ?),
             numero_casa = COALESCE(NULLIF(numero_casa,''), ?),
             nit_ci = COALESCE(NULLIF(nit_ci,''), ?)
       WHERE id = ?
      `,
      [
        envio.zona || null,
        envio.calle || null,
        envio.numero_casa || null,
        factura.nit_ci || null,
        clienteId
      ]
    );

    // 4) Crear PEDIDO
    //    Nota: usuario_id es requerido en tu schema. Usa 1 = "Usuario Web" o ajústalo a tu id real.
    const sucursalId = 1;     // Ajusta si tienes varias sucursales
    const usuarioWebId = 1;   // Usuario "web" (admin/operador) responsable del pedido
    const direccionEnvio = [envio.zona, envio.calle, envio.numero_casa]
                            .filter(Boolean).join(', ');

    const [insPedido] = await cn.query(
      `
      INSERT INTO pedido (sucursal_id, cliente_id, usuario_id, estado, total_neto, direccion_envio)
      VALUES (?, ?, ?, 'PENDIENTE', ?, ?)
      `,
      [sucursalId, clienteId, usuarioWebId, total, direccionEnvio]
    );

    const pedidoId = insPedido.insertId;

    // 5) Insertar PEDIDO_DETALLE
    const detValues = [];
    const detParams = [];
    for (const it of itemsOk) {
      const importe = it.precio_unit * it.qty;
      detValues.push('(?,?,?,?,?)'); // pedido_id, producto_id, cantidad, precio_unitario, importe_neto
      detParams.push(pedidoId, it.id, it.qty, it.precio_unit, importe);
    }
    await cn.query(
      `
      INSERT INTO pedido_detalle (pedido_id, producto_id, cantidad, precio_unitario, importe_neto)
      VALUES ${detValues.join(',')}
      `,
      detParams
    );

    // 6) Crear VENTA (para activar tu trigger de inventario en venta_detalle)
    const [insVenta] = await cn.query(
      `
      INSERT INTO venta (sucursal_id, cliente_id, usuario_id, pedido_id, estado, total_neto)
      VALUES (?, ?, ?, ?, 'PAGADA', ?)
      `,
      [sucursalId, clienteId, usuarioWebId, pedidoId, total]
    );
    const ventaId = insVenta.insertId;

    // 7) Insertar VENTA_DETALLE (el trigger restará del inventario)
    const vdetValues = [];
    const vdetParams = [];
    for (const it of itemsOk) {
      const importe = it.precio_unit * it.qty;
      // costo_unitario: si no lo manejas aún, usa precio_unit como aproximación
      vdetValues.push('(?,?,?,?,?,?)'); // venta_id, producto_id, cantidad, precio_unitario, costo_unitario, importe_neto
      vdetParams.push(ventaId, it.id, it.qty, it.precio_unit, it.precio_unit, importe);
    }
    await cn.query(
      `
      INSERT INTO venta_detalle
        (venta_id, producto_id, cantidad, precio_unitario, costo_unitario, importe_neto)
      VALUES ${vdetValues.join(',')}
      `,
      vdetParams
    );

    // 8) Confirmar transacción
    await cn.commit();

    return res.json({
      ok: true,
      pedido_id: pedidoId,
      venta_id: ventaId,
      total
    });
  } catch (e) {
    await cn.rollback();
    console.error('checkout error:', e);
    return res.status(500).json({ error: 'checkout_failed' });
  } finally {
    cn.release();
  }
};
