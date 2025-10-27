const express = require('express');
const { getClientes, updateCliente } = require('../controllers/clientes.controller');
// 🔹 De momento no usaremos auth hasta tener el middleware
// const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

// Listar clientes
router.get('/', getClientes);

// Actualizar cliente
router.put('/:id', updateCliente);

module.exports = router;
