// routes/admin.products.routes.js
const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const authAdmin = require('../middlewares/authAdmin');
const ctrl = require('../controllers/admin.products.controller');

// 🧱 Middleware global: solo admins autenticados
router.use(auth, authAdmin);

// 🔹 CRUD principal
router.get('/products', ctrl.getAdminProducts);
router.get('/products/:id', ctrl.getAdminProductById);
router.post('/products', ctrl.createProduct);
router.put('/products/:id', ctrl.updateProduct);
router.delete('/products/:id', ctrl.deleteProduct);

// 🔹 Endpoint específico para cambiar estado (activar/desactivar)
router.patch('/products/:id/estado', ctrl.toggleEstado);

module.exports = router;
