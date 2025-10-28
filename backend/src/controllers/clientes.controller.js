const pool = require('../config/db');

// Utilidad: normaliza 1/0/true/false
function to01(val) {
  return val === true || val === '1' || val === 1 ? 1 : 0;
}

/* =========================================================
 * GET /api/clientes
 *  - Lista para panel admin (front ya lo protege)
 * =======================================================*/
exports.getClientes = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id,
        nombre,
        email,
        tipo_cliente,
        estado,
        creado_en AS fecha_registro
      FROM cliente
      ORDER BY creado_en DESC
    `);

    const data = rows.map(r => ({
      ...r,
      estado_texto: r.estado ? 'ACTIVO' : 'INACTIVO',
    }));

    res.json(data);
  } catch (error) {
    console.error('❌ getClientes', error);
    res.status(500).json({ message: 'Error al obtener clientes' });
  }
};

/* =========================================================
 * PUT /api/clientes/:id
 *  - Usado desde el panel admin para cambiar tipo/estado
 * =======================================================*/
exports.updateCliente = async (req, res) => {
  const { id } = req.params;
  const { tipo_cliente, estado } = req.body;

  try {
    const estadoNum = to01(estado);
    await pool.query(
      `UPDATE cliente SET tipo_cliente = ?, estado = ? WHERE id = ?`,
      [tipo_cliente || null, estadoNum, id]
    );

    res.json({ message: 'Cliente actualizado correctamente' });
  } catch (error) {
    console.error('❌ updateCliente', error);
    res.status(500).json({ message: 'Error al actualizar cliente' });
  }
};

/* =========================================================
 * GET /api/clientes/me   (Auth requerido)
 *  - Devuelve datos del cliente autenticado (para autofill)
 * =======================================================*/
exports.getClienteMe = async (req, res) => {
  try {
    if (!req.user || req.user.kind !== 'cliente') {
      return res.status(403).json({ error: 'forbidden', message: 'Solo clientes' });
    }
    const id = req.user.sub;

    const [rows] = await pool.query(
      `SELECT id, nombre, email, nit_ci, zona, calle, numero_casa
         FROM cliente
        WHERE id = ?
        LIMIT 1`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'not_found' });
    }

    res.json(rows[0]);
  } catch (e) {
    console.error('❌ getClienteMe', e);
    res.status(500).json({ error: 'me_failed' });
  }
};

/* =========================================================
 * PATCH /api/clientes/me   (Auth requerido)
 *  - Actualiza SOLO campos permitidos del propio cliente
 *  - Útil si en checkout el usuario completa dirección/NIT
 * =======================================================*/
exports.patchClienteMe = async (req, res) => {
  try {
    if (!req.user || req.user.kind !== 'cliente') {
      return res.status(403).json({ error: 'forbidden', message: 'Solo clientes' });
    }
    const id = req.user.sub;

    // Campos permitidos
    const { nit_ci, zona, calle, numero_casa } = req.body;

    // Construye dinámicamente el UPDATE solo con lo enviado (no vacío)
    const sets = [];
    const vals = [];

    if (typeof nit_ci === 'string' && nit_ci.trim() !== '') {
      sets.push('nit_ci = ?'); vals.push(nit_ci.trim());
    }
    if (typeof zona === 'string' && zona.trim() !== '') {
      sets.push('zona = ?'); vals.push(zona.trim());
    }
    if (typeof calle === 'string' && calle.trim() !== '') {
      sets.push('calle = ?'); vals.push(calle.trim());
    }
    if (typeof numero_casa === 'string' && numero_casa.trim() !== '') {
      sets.push('numero_casa = ?'); vals.push(numero_casa.trim());
    }

    if (!sets.length) {
      return res.status(400).json({ error: 'nothing_to_update' });
    }

    const sql = `UPDATE cliente SET ${sets.join(', ')} WHERE id = ?`;
    await pool.query(sql, [...vals, id]);

    // Devuelve el registro actualizado
    const [rows] = await pool.query(
      `SELECT id, nombre, email, nit_ci, zona, calle, numero_casa
         FROM cliente
        WHERE id = ?
        LIMIT 1`,
      [id]
    );

    res.json({ ok: true, cliente: rows[0] });
  } catch (e) {
    console.error('❌ patchClienteMe', e);
    res.status(500).json({ error: 'update_me_failed' });
  }
};
