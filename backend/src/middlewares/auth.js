const jwt = require('jsonwebtoken');
const JWT_SECRET =  process.env.JWT_SECRET;

module.exports = (req, res, next) => {
  
  // 🛑 VERIFICACIÓN CRÍTICA
    if (!JWT_SECRET) {
        console.error('🛑 ERROR FATAL: JWT_SECRET no cargada.');
        return res.status(500).json({ 
            error: 'server_config_error', 
            message: 'Error de configuración. La clave secreta JWT no está definida.' 
        });
    }

    
  const token = req.headers.authorization;
  if (!token) return res.status(403).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token.split(' ')[1], JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Token inválido' });
  }
};
