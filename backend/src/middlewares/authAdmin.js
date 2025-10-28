
module.exports = function authAdmin(req, res, next) {
  if (!req.user || req.user.kind !== 'usuario' || req.user.rol !== 'admin') {
    return res.status(403).json({
      error: 'forbidden',
      message: 'Acceso denegado. Se requiere rol de administrador.',
    });
  }
  next();
};