const express = require('express');
const cors = require('cors');

// --- Importar Middlewares (Tus cambios) ---
const decodeUser = require('./middleware/decodeUser');
const httpLogger = require('./middleware/httpLogger');
const logger = require('./config/logger');

// --- Importar Rutas (Cambios de ambos) ---
const products = require('./routes/products.routes');
const adminRoutes = require('./routes/admin.routes');
const auth = require('./routes/auth.routes');
const ordersRoutes = require('./routes/orders.routes'); 
const pedidos = require('./routes/pedidos.routes');
const clientesRoutes = require('./routes/clientes.routes'); 
const checkoutRoutes = require('./routes/checkout.routes');

const adminReportsRoutes = require('./routes/admin.reports.routes');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

app.use(decodeUser);
app.use(httpLogger);

// --- Registrar Rutas (Cambios de ambos) ---
app.use('/api/products', products);
app.use('/api', auth);
app.use('/api/admin', adminRoutes);

app.use('/api/admin/reportes', adminReportsRoutes);

app.use('/api', ordersRoutes); 
app.use('/api/pedidos', pedidos);
app.use('/api/clientes', clientesRoutes);
app.use('/api/checkout', checkoutRoutes);

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
