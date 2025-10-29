// middlewares/authAdmin.js
module.exports = function authAdmin(req, res, next) {
  if (!req.user) {
    return res.status(403).json({ error: 'no_user', message: 'No se ha autenticado ningún usuario.' });
  }

  const rol = (req.user.rol || req.user.role || '').toString().toUpperCase();
  const kind = (req.user.kind || '').toLowerCase();

  // Aceptar si es usuario tipo "usuario" con rol ADMIN
  if (kind === 'usuario' && rol === 'ADMIN') {
    return next();
  }

  // O si el JWT no tiene "kind" pero el rol es ADMIN
  if (!kind && rol === 'ADMIN') {
    return next();
  }

  return res.status(403).json({
    error: 'forbidden',
    message: 'Acceso denegado. Se requiere rol de administrador válido.',
  });
};
