const express = require('express');
const cors = require('cors');
const products = require('./routes/products.routes');

const app = express();
app.use(cors());
app.use(express.json());

// Registrar rutas de productos (puedes agregar más)
app.use('/api', products);

module.exports = app;
