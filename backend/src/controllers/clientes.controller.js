const pool = require('../config/db');

// GET /api/clientes
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

    // Convertir 1/0 → ACTIVO/INACTIVO para el front
    const data = rows.map(r => ({
      ...r,
      estado_texto: r.estado ? 'ACTIVO' : 'INACTIVO'
    }));

    res.json(data);
  } catch (error) {
    console.error('❌ getClientes', error);
    res.status(500).json({ message: 'Error al obtener clientes' });
  }
};

// PUT /api/clientes/:id
exports.updateCliente = async (req, res) => {
  const { id } = req.params;
  const { tipo_cliente, estado } = req.body;

  try {
    // Asegurar que "estado" llegue como 1 o 0
    const estadoNum = estado === true || estado === '1' || estado === 1 ? 1 : 0;

    await pool.query(
      `UPDATE cliente SET tipo_cliente = ?, estado = ? WHERE id = ?`,
      [tipo_cliente, estadoNum, id]
    );

    res.json({ message: 'Cliente actualizado correctamente' });
  } catch (error) {
    console.error('❌ updateCliente', error);
    res.status(500).json({ message: 'Error al actualizar cliente' });
  }
};
