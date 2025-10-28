const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- Helper para firmar el token ---
function sign(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || '7d',
  });
}

// --- Validadores auxiliares ---
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password) {
  // Mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}

// ========================================================
// REGISTRO DE CLIENTE
// ========================================================
exports.registerCliente = async (req, res) => {
  try {
    let { nombre, email, password } = req.body;
    nombre = (nombre || '').trim();
    email  = (email  || '').trim().toLowerCase();

    // --- Validaciones previas ---
    if (!nombre || nombre.length < 3) {
      return res.status(400).json({ error: 'invalid_name', message: 'El nombre debe tener al menos 3 caracteres.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'invalid_email', message: 'El correo electrónico no es válido.' });
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({
        error: 'weak_password',
        message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.',
      });
    }

    // --- Verificar si el correo ya existe ---
    const [exists] = await pool.query(`SELECT id FROM cliente WHERE email=?`, [email]);
    if (exists.length > 0) {
      return res.status(409).json({ error: 'email_in_use', message: 'Este correo ya está registrado.' });
    }

    // --- Insertar nuevo cliente ---
    const hash = await bcrypt.hash(password, 12);
    const [ins] = await pool.query(
      `INSERT INTO cliente (nombre, email, password_hash, tipo_cliente)
       VALUES (?, ?, ?, 'MINORISTA')`,
      [nombre, email, hash]
    );

    // --- Crear token JWT ---
    const token = jwt.sign(
  {
    sub: usr.id,
    kind: "usuario",
    rol: usr.rol.toLowerCase(),
    email: usr.email,
  },
  process.env.JWT_SECRET,
  { expiresIn: "8h" }
);


    res.status(201).json({
      token,
      user: { id: ins.insertId, nombre, email, tipo: 'CLIENTE' },
    });
  } catch (e) {
    console.error('registerCliente', e);
    res.status(500).json({ error: 'register_failed', message: 'Error interno del servidor.' });
  }
};

// ========================================================
// LOGIN UNIFICADO (cliente o usuario/admin)
// ========================================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'missing_fields', message: 'Campos incompletos.' });

    // 1) Intentar como CLIENTE
    const [cliRows] = await pool.query(
      `SELECT id, nombre, email, password_hash FROM cliente WHERE email=? LIMIT 1`,
      [email]
    );
    if (cliRows.length) {
      const cli = cliRows[0];
      const ok = await bcrypt.compare(password, cli.password_hash || '');
      if (!ok) return res.status(401).json({ error: 'invalid_credentials', message: 'Credenciales inválidas.' });

      const token = sign({ sub: cli.id, kind: 'cliente' });
      return res.json({
        token,
        user: { id: cli.id, nombre: cli.nombre, email: cli.email, tipo: 'CLIENTE' },
      });
    }

    // 2) Si no es cliente, intentar como USUARIO (ADMIN / VENDEDOR / ALMACEN)
    const [usrRows] = await pool.query(
      `SELECT id, nombre, email, password_hash, rol, activo
         FROM usuario
        WHERE email=? LIMIT 1`,
      [email]
    );
    if (!usrRows.length) {
      return res.status(401).json({ error: 'invalid_credentials', message: 'Credenciales inválidas.' });
    }

    const usr = usrRows[0];
    if (usr.activo === 0) {
      return res.status(403).json({ error: 'user_inactive', message: 'Usuario inactivo.' });
    }

    const ok = await bcrypt.compare(password, usr.password_hash || '');
    if (!ok) return res.status(401).json({ error: 'invalid_credentials', message: 'Credenciales inválidas.' });

    const token = sign({ sub: usr.id, kind: 'usuario', rol: usr.rol });
    return res.json({
      token,
      user: { id: usr.id, nombre: usr.nombre, email: usr.email, tipo: 'ADMIN', rol: usr.rol },
    });

  } catch (e) {
    console.error('login (unificado)', e);
    res.status(500).json({ error: 'login_failed', message: 'Error interno del servidor.' });
  }
};
