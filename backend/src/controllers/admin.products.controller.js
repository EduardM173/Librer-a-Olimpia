// controllers/admin.products.controller.js
const pool = require('../config/db');

// ===============================
// 📘 LISTAR PRODUCTOS (GET ALL)
// ===============================
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
        p.descripcion,
        p.precio_venta,
        p.activo,
        c.nombre AS categoria,
        IFNULL(SUM(ia.cantidad_actual), 0) AS stock
      FROM producto p
      LEFT JOIN categoria c ON c.id = p.categoria_id
      LEFT JOIN inventario_actual ia ON ia.producto_id = p.id
      GROUP BY p.id
      ORDER BY p.nombre ASC
      LIMIT ? OFFSET ?
      `,
      [pageSize, offset]
    );

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM producto`);

    res.json({ items: rows, meta: { page, pageSize, total } });
  } catch (err) {
    console.error('❌ getAdminProducts:', err);
    res.status(500).json({ error: 'admin_products_failed', message: err.message });
  }
};

// ===============================
// 📗 OBTENER UN PRODUCTO POR ID
// ===============================
exports.getAdminProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `
      SELECT 
        p.id,
        p.sku,
        p.nombre,
        p.descripcion,
        p.precio_venta,
        p.categoria_id,
        p.imagen_url,
        p.activo,
        IFNULL(SUM(ia.cantidad_actual), 0) AS stock
      FROM producto p
      LEFT JOIN inventario_actual ia ON ia.producto_id = p.id
      WHERE p.id = ?
      GROUP BY p.id
      `,
      [id]
    );

    if (!rows.length) return res.status(404).json({ error: 'not_found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('❌ getAdminProductById:', err);
    res.status(500).json({ error: 'admin_product_detail_failed', message: err.message });
  }
};

// ===============================
// 🟩 CREAR PRODUCTO
// ===============================
exports.createProduct = async (req, res) => {
  try {
    const { nombre, sku, descripcion, precio_venta, categoria_id, imagen_url } = req.body;

    if (!nombre || !sku || precio_venta === undefined) {
      return res.status(400).json({ error: 'missing_fields', message: 'Faltan campos obligatorios.' });
    }

    const [result] = await pool.query(
      `
      INSERT INTO producto (
        nombre, sku, descripcion, precio_venta, categoria_id, imagen_url, activo
      ) VALUES (?, ?, ?, ?, ?, ?, 1)
      `,
      [nombre, sku, descripcion || null, precio_venta, categoria_id || null, imagen_url || null]
    );

    const [[nuevo]] = await pool.query(
      `SELECT id, nombre, sku, precio_venta, activo FROM producto WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json({ message: 'Producto creado correctamente.', producto: nuevo });
  } catch (err) {
    console.error('❌ createProduct:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'sku_in_use', message: 'El SKU ya está en uso.' });
    }
    res.status(500).json({ error: 'create_product_failed', message: err.message });
  }
};

// ===============================
// 🟨 EDITAR PRODUCTO
// ===============================
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, sku, descripcion, precio_venta, categoria_id, imagen_url, activo } = req.body;

    if (!nombre || !sku || precio_venta === undefined) {
      return res.status(400).json({ error: 'missing_fields', message: 'Campos obligatorios faltantes.' });
    }

    const [result] = await pool.query(
      `
      UPDATE producto SET
        nombre = ?, sku = ?, descripcion = ?, precio_venta = ?, 
        categoria_id = ?, imagen_url = ?, activo = ?
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
        id
      ]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'not_found', message: 'Producto no encontrado.' });

    const [[actualizado]] = await pool.query(`SELECT * FROM producto WHERE id = ?`, [id]);
    res.json({ message: 'Producto actualizado correctamente.', producto: actualizado });
  } catch (err) {
    console.error('❌ updateProduct:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'sku_in_use', message: 'El SKU ya está en uso.' });
    }
    res.status(500).json({ error: 'update_product_failed', message: err.message });
  }
};

// ===============================
// 🟥 ELIMINAR (DESACTIVAR) PRODUCTO
// ===============================
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(`UPDATE producto SET activo = 0 WHERE id = ?`, [id]);

    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'not_found', message: 'Producto no encontrado.' });

    res.json({ message: 'Producto desactivado correctamente.' });
  } catch (err) {
    console.error('❌ deleteProduct:', err);
    res.status(500).json({ error: 'delete_product_failed', message: err.message });
  }
};

// ===============================
// 🟦 ACTIVAR / DESACTIVAR PRODUCTO (toggle)
// ===============================
exports.toggleEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;

    if (activo === undefined)
      return res.status(400).json({ error: 'missing_fields', message: 'Campo "activo" es obligatorio.' });

    const [result] = await pool.query(`UPDATE producto SET activo = ? WHERE id = ?`, [activo ? 1 : 0, id]);

    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'not_found', message: 'Producto no encontrado.' });

    res.json({ message: 'Estado del producto actualizado.', id, activo });
  } catch (err) {
    console.error('❌ toggleEstado:', err);
    res.status(500).json({ error: 'toggle_estado_failed', message: err.message });
  }
};
