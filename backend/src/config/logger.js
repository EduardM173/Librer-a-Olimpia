const winston = require('winston');
const fs = require('fs');
const path = require('path');

const logDir = 'logs';

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Formato de log: [Timestamp] NIVEL: Mensaje
const logFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level.toUpperCase()}] : ${message} `;
  if (Object.keys(metadata).length > 0) {
    msg += JSON.stringify(metadata);
  }
  return msg;
});

const logger = winston.createLogger({
  level: 'info', // Nivel mínimo de log a registrar
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    logFormat 
  ),
  defaultMeta: { service: 'api-libreria' },
  transports: [
    // Escribir todos los logs de nivel 'info' y superior a `logs/app.log`
    new winston.transports.File({ 
      filename: path.join(logDir, 'app.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Escribir todos los logs en la consola
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // Añadir colores a la consola
        logFormat
      )
    })
  ],
});

module.exports = logger;