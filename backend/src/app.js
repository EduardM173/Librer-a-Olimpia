const express = require('express');
const cors = require('cors');

const products = require('./routes/products.routes');
const auth = require('./routes/auth.routes');
const pedidos = require('./routes/pedidos.routes'); 

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', products);
app.use('/api', auth);
app.use('/pedidos', pedidos); 

app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ error: 'internal_server_error' });
});

module.exports = app;
