// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors()); // Permite conexiones
app.use(express.json()); // Permite leer JSON del body

// Ruta de prueba
app.get('/api', (req, res) => {
  res.json({ message: '¡El backend de la Librería Olimpia funciona!' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});