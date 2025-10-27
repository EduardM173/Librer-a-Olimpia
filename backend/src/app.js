const express = require('express');
const cors = require('cors');
const products = require('./routes/products.routes');
//pedidos rutas
const ordersRoutes = require('./routes/orders.routes');
//admin reportes rutas
const adminRoutes = require('./routes/admin.routes');

const app = express();
app.use(cors());
app.use(express.json());

// Registrar rutas de productos (puedes agregar más)
app.use('/api', products);

// Las rutas serán: /api/orders y /api/orders/:id
app.use('/api', ordersRoutes);

//las rutas de los reportes de ventas para admin
app.use('/api/admin', adminRoutes); // El prefijo /api/admin es importante

module.exports = app;
