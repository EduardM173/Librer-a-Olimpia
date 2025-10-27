const express = require('express');
const cors = require('cors');

// Importar Middlewares
const decodeUser = require('./middleware/decodeUser');
const httpLogger = require('./middleware/httpLogger');
const logger = require('./config/logger');

const products = require('./routes/products.routes');
const auth = require('./routes/auth.routes');
// const orders = require('./routes/orders.routes');

const app = express();

app.use(cors());
app.use(express.json());

// 1. Decodificar usuario (para saber quién es)
app.use(decodeUser);
// 2. Registrar la petición (ahora que ya sabemos quién es)
app.use(httpLogger);

app.use('/api', products);
app.use('/api', auth);
// app.use('/api', orders);

app.use((err, req, res, next) => {
  logger.error('Error no controlado:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    user: req.user ? req.user.id : 'Visitante'
  });
  
  res.status(500).json({ error: 'internal_server_error' });
});

module.exports = app;