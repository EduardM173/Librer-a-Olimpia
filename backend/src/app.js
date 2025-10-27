const express = require('express');
const cors = require('cors');

const products = require('./routes/products.routes');
//pedidos rutas
const ordersRoutes = require('./routes/orders.routes');

const auth = require('./routes/auth.routes');
// const orders = require('./routes/orders.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', products);
app.use('/api', auth);
// app.use('/api', orders);

// Las rutas serán: /api/orders y /api/orders/:id
//necesita autenticacion
app.use('/api', ordersRoutes);

module.exports = app;
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ error: 'internal_server_error' });
});

module.exports = app;
