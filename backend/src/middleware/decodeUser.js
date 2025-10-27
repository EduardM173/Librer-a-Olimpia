const jwt = require('jsonwebtoken');
const pool = require('../src/config/db'); 

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (decoded.kind === 'cliente') {
        req.user = { id: decoded.sub, tipo: 'CLIENTE' };
      } else if (decoded.kind === 'usuario') {
        req.user = { id: decoded.sub, tipo: 'USUARIO_INTERNO' };
      }
    }
  } catch (e) {
  }
  next();
};