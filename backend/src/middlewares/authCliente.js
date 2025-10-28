const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = function authCliente(req, res, next) {
  try {
    const raw = req.headers.authorization || '';
    const token = raw.startsWith('Bearer ') ? raw.slice(7) : null;
    if (!token) return res.status(403).json({ error: 'no_token' });

    const decoded = jwt.verify(token, JWT_SECRET);
    // Debe ser un cliente autenticado
    if (!decoded || decoded.kind !== 'cliente') {
      return res.status(403).json({ error: 'only_clients' });
    }
    req.user = decoded; // { sub: <id_cliente>, kind:'cliente' }
    next();
  } catch (e) {
    return res.status(403).json({ error: 'invalid_token' });
  }
};
