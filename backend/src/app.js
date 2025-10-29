// app.js
const express = require('express');
const cors = require('cors');

// --- Middlewares ---
const decodeUser = require('./middleware/decodeUser');
const httpLogger = require('./middleware/httpLogger');
const logger = require('./config/logger');

// --- Rutas ---
const productsRoutes = require('./routes/products.routes');
const adminProductsRoutes = require('./routes/admin.routes'); // ✅ NUEVO NOMBRE CORRECTO
const authRoutes = require('./routes/auth.routes');
const ordersRoutes = require('./routes/orders.routes');
const pedidosRoutes = require('./routes/pedidos.routes');
const clientesRoutes = require('./routes/clientes.routes');
const checkoutRoutes = require('./routes/checkout.routes');

const adminReportsRoutes = require('./routes/admin.reports.routes');
const uploadRoutes = require('./routes/upload.routes');

const app = express();

// --- Configuración Global ---
app.use(cors());
app.use(express.json());
app.use(decodeUser);
app.use(httpLogger);

// --- Registro de Rutas ---
app.use('/api/products', productsRoutes);
app.use('/api/admin', adminProductsRoutes); // ✅ NUEVO CRUD DE PRODUCTOS ADMIN
app.use('/api/admin/reportes', adminReportsRoutes);
app.use('/api', authRoutes);
app.use('/api', ordersRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/checkout', checkoutRoutes);

app.use('/api', uploadRoutes);

// --- Manejador de errores global ---
app.use((err, req, res, next) => {
  logger.error('Error no controlado:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    user: req.user ? req.user.id : 'Visitante'
  });

  res.status(500).json({ error: 'internal_server_error', message: err.message });
});

module.exports = app;
