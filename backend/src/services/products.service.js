const { pool } = require('../config/db');

/**
 * Lista categorías
 */
async function listCategories() {
  const [rows] = await pool.query(
    `SELECT id, nombre FROM categoria ORDER BY nombre ASC`
  );
  return rows;
}

/**
 * Lista productos con filtros + popularidad + stock
 */
async function listProducts({ page=1, pageSize=12, categoryId=null, search='', sort='popular' }) {
  page = Math.max(1, parseInt(page));
  pageSize = Math.min(48, Math.max(1, parseInt(pageSize)));

  const where = ['p.activo = 1'];
  const params = [];

  if (categoryId) { where.push('p.categoria_id = ?'); params.push(+categoryId); }
  if (search) { where.push('(p.nombre LIKE ? OR p.sku LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }

  const whereSQL = where.length ? 'WHERE ' + where.join(' AND ') : '';

  // total
  const [[{ total }]] = await pool.query(`
    SELECT COUNT(*) AS total
    FROM producto p
    ${whereSQL}
  `, params);

  // orden
  let orderBy = 'popularity DESC, p.nombre ASC';
  if (sort === 'price_asc') orderBy = 'p.precio_venta ASC';
  if (sort === 'price_desc') orderBy = 'p.precio_venta DESC';
  if (sort === 'new') orderBy = 'p.creado_en DESC';

  const offset = (page - 1) * pageSize;

  // productos + popularidad + stock disponible (sum inventario_actual)
  const [items] = await pool.query(`
    SELECT
      p.id, p.sku, p.nombre,
      p.precio_venta, p.imagen_url, p.categoria_id,
      IFNULL(SUM(vd.cantidad), 0)                AS popularity,
      IFNULL(SUM(inv.cantidad_actual), 0)        AS stock_disponible
    FROM producto p
    LEFT JOIN venta_detalle vd   ON vd.producto_id = p.id
    LEFT JOIN inventario_actual inv ON inv.producto_id = p.id
    ${whereSQL}
    GROUP BY p.id
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `, [...params, pageSize, offset]);

  // mapear para el front con campos que ya usas
  const mapped = items.map(r => ({
    id: r.id,
    nombre: r.nombre,
    precio: Number(r.precio_venta || 0).toFixed(2),
    imagen: r.imagen_url || '/IMG/placeholder-producto.jpg',
    agotado: Number(r.stock_disponible || 0) <= 0,
  }));

  return { page, pageSize, total, items: mapped };
}

module.exports = { listCategories, listProducts };


ALTER TABLE cliente ADD COLUMN estado TINYINT(1) DEFAULT 1 AFTER tipo_cliente;