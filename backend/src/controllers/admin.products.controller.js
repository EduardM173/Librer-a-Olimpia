const pool = require('../config/db');

/**
 * GET /api/admin/products
 * (CORREGIDO: Eliminado 'precio_costo')
 */
exports.getAdminProducts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const pageSize = 20;
    const offset = (page - 1) * pageSize;

    const [rows] = await pool.query(
      `
      SELECT
        p.id,
        p.sku,
        p.nombre,
        p.precio_venta,
        p.activo,
        c.nombre AS categoria,
        IFNULL(SUM(ia.cantidad_actual), 0) AS stock
      FROM producto p
      LEFT JOIN categoria c ON c.id = p.categoria_id
      LEFT JOIN inventario_actual ia ON ia.producto_id = p.id
      GROUP BY 
        p.id, p.sku, p.nombre, p.precio_venta, p.activo, c.nombre
      ORDER BY p.nombre ASC
      LIMIT ? OFFSET ?
    `,
      [pageSize, offset]
    );

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM producto`);

    res.json({
      items: rows,
      meta: { page, pageSize, total },
    });
  } catch (e) {
    console.error('❌ getAdminProducts:', e.message); 
    res.status(500).json({ error: 'admin_products_failed', message: e.message });
  }
};

/**
 * GET /api/admin/products/:id
 * (CORREGIDO: Eliminado 'precio_costo')
 */
exports.getAdminProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `
      SELECT
        p.id,
        p.nombre,
        p.sku,
        p.descripcion,
        p.precio_venta,
        p.categoria_id,
        p.imagen_url,
        p.activo,
        IFNULL(SUM(ia.cantidad_actual), 0) AS stock
      FROM producto p
      LEFT JOIN inventario_actual ia ON ia.producto_id = p.id
      WHERE p.id = ?
      GROUP BY 
        p.id, p.nombre, p.sku, p.descripcion, p.precio_venta, 
        p.categoria_id, p.imagen_url, p.activo
      `,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'not_found' });
    }
    res.json(rows[0]);
  } catch (e) {
    console.error('❌ getAdminProductById:', e.message);
    res.status(500).json({ error: 'admin_product_detail_failed', message: e.message });
  }
};

/**
 * POST /api/admin/products
 * (CORREGIDO: Eliminado 'precio_costo')
 */
exports.createProduct = async (req, res) => {
  try {
    const {
      nombre,
      sku,
      descripcion,
      precio_venta,
      // precio_costo (eliminado)
      categoria_id,
      imagen_url,
    } = req.body;

    if (!nombre || !sku || !precio_venta) {
      return res.status(400).json({ error: 'missing_fields' });
    }

    const [result] = await pool.query(
      `
      INSERT INTO producto (
        nombre, sku, descripcion, precio_venta,
        categoria_id, imagen_url, activo
      ) VALUES (?, ?, ?, ?, ?, ?, 1)
      `,
      [
        nombre,
        sku,
        descripcion || null,
        precio_venta,
        categoria_id || null,
        imagen_url || null,
      ]
    );

    res.status(201).json({ id: result.insertId, message: 'Producto creado' });
  } catch (e) {
    console.error('❌ createProduct:', e.message);
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'sku_in_use', message: 'El SKU ya está en uso.' });
    }
    res.status(500).json({ error: 'create_product_failed' });
  }
};

/**
 * PUT /api/admin/products/:id
 * (CORREGIDO: Eliminado 'precio_costo')
 */
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      sku,
      descripcion,
      precio_venta,
      // precio_costo (eliminado)
      categoria_id,
      imagen_url,
      activo,
    } = req.body;

    if (!nombre || !sku || !precio_venta) {
      return res.status(400).json({ error: 'missing_fields' });
    }

    const [result] = await pool.query(
      `
      UPDATE producto SET
        nombre = ?,
        sku = ?,
        descripcion = ?,
        precio_venta = ?,
        categoria_id = ?,
        imagen_url = ?,
        activo = ?
      WHERE id = ?
      `,
      [
        nombre,
        sku,
        descripcion || null,
        precio_venta,
        categoria_id || null,
        imagen_url || null,
        activo ? 1 : 0, 
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'not_found' });
    }

    res.json({ id, message: 'Producto actualizado' });
  } catch (e) {
    console.error('❌ updateProduct:', e.message);
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'sku_in_use', message: 'El SKU ya está en uso.' });
    }
    res.status(500).json({ error: 'update_product_failed' });
  }
};

/**
 * DELETE /api/admin/products/:id
 * (Sin cambios, esta función estaba bien)
 */
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      `UPDATE producto SET activo = 0 WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'not_found' });
    }

    res.json({ message: 'Producto desactivado (eliminado)' });
  } catch (e) {
    console.error('❌ deleteProduct:', e.message);
    res.status(500).json({ error: 'delete_product_failed' });
  }
};