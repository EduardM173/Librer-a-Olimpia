const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

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
    email = (email || '').trim().toLowerCase();

    // --- Validaciones previas ---
    if (!nombre || nombre.length < 3) {
      return res.status(400).json({
        error: 'invalid_name',
        message: 'El nombre debe tener al menos 3 caracteres.',
      });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: 'invalid_email',
        message: 'El correo electrónico no es válido.',
      });
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({
        error: 'weak_password',
        message:
          'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.',
      });
    }

    // --- Verificar si el correo ya existe ---
    const [exists] = await pool.query(
      `SELECT id FROM cliente WHERE email=?`,
      [email]
    );
    if (exists.length > 0) {
      return res.status(409).json({
        error: 'email_in_use',
        message: 'Este correo ya está registrado.',
      });
    }

    // --- Insertar nuevo cliente ---
    const hash = await bcrypt.hash(password, 12);
    const [ins] = await pool.query(
      `INSERT INTO cliente (nombre, email, password_hash, tipo_cliente)
       VALUES (?, ?, ?, 'MINORISTA')`,
      [nombre, email, hash]
    );

    // --- Crear objeto de usuario (reemplaza al "usr" inexistente) ---
    const newUser = {
      id: ins.insertId,
      nombre,
      email,
      rol: 'CLIENTE',
    };

    // --- Crear token JWT coherente con el login ---
    const token = jwt.sign(
      {
        sub: newUser.id,
        kind: 'cliente',
        rol: newUser.rol.toLowerCase(),
        email: newUser.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // --- Log de registro exitoso ---
    logger.info('REGISTRO_EXITOSO: Nuevo cliente registrado', {
      clienteId: newUser.id,
      email: newUser.email,
    });

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        nombre: newUser.nombre,
        email: newUser.email,
        tipo: 'CLIENTE',
      },
    });
  } catch (e) {
    logger.error('Error en registerCliente', {
      message: e.message,
      stack: e.stack,
    });
    res
      .status(500)
      .json({ error: 'register_failed', message: 'Error interno del servidor.' });
  }
};

// ========================================================
// LOGIN UNIFICADO (CLIENTE Y USUARIO)
// ========================================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ error: 'missing_fields', message: 'Campos incompletos.' });

    // 1) Intentar como CLIENTE
    const [rows] = await pool.query(
      `SELECT id, nombre, email, password_hash, nit_ci, zona, calle, numero_casa 
       FROM cliente 
       WHERE email=? LIMIT 1`,
      [email]
    );

    if (rows.length) {
      const cli = rows[0];
      const ok = await bcrypt.compare(password, cli.password_hash || '');

      if (!ok) {
        logger.warn('LOGIN_FALLIDO: Contraseña incorrecta (Cliente)', {
          email,
          clienteId: cli.id,
        });
        return res
          .status(401)
          .json({ error: 'invalid_credentials', message: 'Credenciales inválidas.' });
      }

      const token = sign({ sub: cli.id, kind: 'cliente' });
      logger.info('LOGIN_EXITOSO: Cliente autenticado', {
        clienteId: cli.id,
        email: cli.email,
      });

      return res.json({
        token,
        user: {
          id: cli.id,
          nombre: cli.nombre,
          email: cli.email,
          tipo: 'CLIENTE',
          nit_ci: cli.nit_ci,
          zona: cli.zona,
          calle: cli.calle,
          numero_casa: cli.numero_casa,
        },
      });
    }

    // 2) Si no es cliente, intentar como USUARIO
    const [usrRows] = await pool.query(
      `SELECT id, nombre, email, password_hash, rol, activo
       FROM usuario
       WHERE email=? LIMIT 1`,
      [email]
    );

    if (!usrRows.length) {
      logger.warn('LOGIN_FALLIDO: Usuario/Cliente no encontrado', { email });
      return res
        .status(401)
        .json({ error: 'invalid_credentials', message: 'Credenciales inválidas.' });
    }

    const usr = usrRows[0];
    if (usr.activo === 0) {
      logger.warn('LOGIN_FALLIDO: Usuario inactivo', {
        email,
        usuarioId: usr.id,
      });
      return res
        .status(403)
        .json({ error: 'user_inactive', message: 'Usuario inactivo.' });
    }

    const ok = await bcrypt.compare(password, usr.password_hash || '');
    if (!ok) {
      logger.warn('LOGIN_FALLIDO: Contraseña incorrecta (Usuario)', {
        email,
        usuarioId: usr.id,
      });
      return res
        .status(401)
        .json({ error: 'invalid_credentials', message: 'Credenciales inválidas.' });
    }

    const token = sign({ sub: usr.id, kind: 'usuario', rol: usr.rol });
    logger.info('LOGIN_EXITOSO: Usuario interno autenticado', {
      usuarioId: usr.id,
      email: usr.email,
      rol: usr.rol,
    });

    return res.json({
      token,
      user: {
        id: usr.id,
        nombre: usr.nombre,
        email: usr.email,
        tipo: usr.rol,
        rol: usr.rol,
      },
    });
  } catch (e) {
    logger.error('Error interno en Login', {
      message: e.message,
      stack: e.stack,
      email: req.body ? req.body.email : 'N/A',
    });
    res
      .status(500)
      .json({ error: 'login_failed', message: 'Error interno del servidor.' });
  }
};

// ========================================================
// LOGOUT
// ========================================================
exports.logout = (req, res) => {
  if (req.user) {
    logger.info('LOGOUT: Sesión cerrada por el usuario', {
      userId: req.user.id,
      tipo: req.user.tipo,
    });
  } else {
    logger.warn('LOGOUT: Intento de logout sin usuario identificado.');
  }

  res.status(200).json({ message: 'Logout registrado exitosamente.' });
};
