const pool = require('../config/db');

// =============================
//  Obtener lista de productos
// =============================
exports.getProducts = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1'), 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || '12'), 1), 48);
    const categoryId = req.query.categoryId ? parseInt(req.query.categoryId) : null;
    const search = (req.query.search || '').trim();

    const where = ['p.activo = 1'];
    const params = [];

    if (categoryId) { where.push('p.categoria_id = ?'); params.push(categoryId); }
    if (search) { where.push('(p.nombre LIKE ? OR p.sku LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }

    const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';

    // total
    const [tot] = await pool.query(
      `SELECT COUNT(*) AS total FROM producto p ${whereSQL}`, params
    );
    const total = tot[0]?.total || 0;

    const offset = (page - 1) * pageSize;

    // ✅ Incluimos descripción
    const [rows] = await pool.query(
      `
      SELECT 
        p.id,
        p.nombre,
        p.descripcion,
        p.precio_venta,
        p.imagen_url,
        p.activo,
        COALESCE(SUM(ia.cantidad_actual), 0) AS stock,
        COALESCE(COUNT(vd.id), 0) AS popularity
      FROM producto p
      LEFT JOIN inventario_actual ia ON ia.producto_id = p.id
      LEFT JOIN venta_detalle vd ON vd.producto_id = p.id
      ${whereSQL}
      GROUP BY p.id, p.nombre, p.descripcion, p.precio_venta, p.imagen_url, p.activo
      ORDER BY popularity DESC, p.nombre ASC
      LIMIT ? OFFSET ?;
      `,
      [...params, pageSize, offset]
    );

    const items = rows.map(r => ({
      id: r.id,
      nombre: r.nombre,
      descripcion: r.descripcion || 'Sin descripción disponible',
      precio: Number(r.precio_venta).toFixed(2),
      imagen: r.imagen_url || '/IMG/placeholder-producto.jpg',
      agotado: r.stock <= 0 || r.activo === 0
    }));

    res.json({
      items,
      meta: { page, pageSize, total }
    });
  } catch (e) {
    console.error('❌ Error en getProducts:', e.message);
    res.status(500).json({ error: 'products_failed' });
  }
};

// =============================
//  Obtener categorías
// =============================
exports.getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, nombre FROM categoria ORDER BY nombre ASC;`
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'categories_failed' });
  }
};

// =============================
//  Obtener detalle de producto
// =============================
exports.getProductById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'invalid_id' });

    // ✅ Incluimos descripción
    const [rows] = await pool.query(
      `
      SELECT 
        p.id,
        p.nombre,
        p.descripcion,
        p.precio_venta,
        p.imagen_url,
        p.activo,
        c.nombre AS categoria,
        IFNULL(SUM(ia.cantidad_actual), 0) AS stock,
        IFNULL(SUM(vd.cantidad), 0) AS popularity
      FROM producto p
      LEFT JOIN categoria c ON c.id = p.categoria_id
      LEFT JOIN inventario_actual ia ON ia.producto_id = p.id
      LEFT JOIN venta_detalle vd ON vd.producto_id = p.id
      WHERE p.id = ?
      GROUP BY p.id;
      `,
      [id]
    );

    if (!rows.length) return res.status(404).json({ error: 'not_found' });

    const r = rows[0];
    res.json({
      id: r.id,
      nombre: r.nombre,
      descripcion: r.descripcion || 'Sin descripción disponible',
      categoria: r.categoria || 'Sin categoría',
      precio: Number(r.precio_venta).toFixed(2),
      imagen: r.imagen_url || '/IMG/placeholder-producto.jpg',
      agotado: r.stock <= 0 || r.activo === 0,
      stock: r.stock,
      popularidad: r.popularity
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'product_detail_failed' });
  }
};
