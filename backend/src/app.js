const express = require('express');
const cors = require('cors');

const products = require('./routes/products.routes');
const ordersRoutes = require('./routes/orders.routes');
const auth = require('./routes/auth.routes');
const pedidos = require('./routes/pedidos.routes');
const clientesRoutes = require('./routes/clientes.routes');
const checkoutRoutes = require('./routes/checkout.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api', products);
app.use('/api', auth);
app.use('/api/pedidos', pedidos);
app.use('/api/clientes', clientesRoutes);
app.use('/api', ordersRoutes);
app.use('/api/checkout', checkoutRoutes);

// Middleware de errores (al final)
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ error: 'internal_server_error' });
});

module.exports = app;
