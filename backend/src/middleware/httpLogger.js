const logger = require('../config/logger');

module.exports = (req, res, next) => {
  const start = process.hrtime();
  
  res.on('finish', () => {
    const durationInMilliseconds = getDurationInMilliseconds(start);
    
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ip = req.ip;
    let userIdentifier;

    console.log("HOla🍔🍔🔥");
    if (req.user) {
      userIdentifier = `Usuario: ${req.user.id} (Tipo: ${req.user.tipo})`;
    } else {
      userIdentifier = 'Visitante';
    }

    // Loggear la vista de página
    logger.info(
      `${req.method} ${req.originalUrl} - ${res.statusCode} (${durationInMilliseconds.toLocaleString()} ms)`,
      { 
        user: userIdentifier,
        ip: ip,
        agent: userAgent
      }
    );
  });

  next();
};

const getDurationInMilliseconds = (start) => {
    const NS_PER_SEC = 1e9;
    const NS_TO_MS = 1e-6;
    const diff = process.hrtime(start);
    return (diff[0] * NS_PER_SEC + diff[1]) * NS_TO_MS;
};