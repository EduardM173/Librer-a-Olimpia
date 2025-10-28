const express = require('express');
const router = express.Router();

// Middlewares de autenticación
const auth = require('../middlewares/auth'); 
const authAdmin = require('../middlewares/authAdmin'); 

// Controlador
const adminProducts = require('../controllers/admin.products.controller');


// (Aplica ambos middlewares a todas las rutas de este router)
router.use(auth, authAdmin);

// GET /api/admin/products (Lista para el panel)
router.get('/products', adminProducts.getAdminProducts);

// POST /api/admin/products (Crear)
router.post('/products', adminProducts.createProduct);

// GET /api/admin/products/:id (Detalle para editar)
router.get('/products/:id', adminProducts.getAdminProductById);

// PUT /api/admin/products/:id (Actualizar)
router.put('/products/:id', adminProducts.updateProduct);

// DELETE /api/admin/products/:id (Desactivar)
router.delete('/products/:id', adminProducts.deleteProduct);

module.exports = router;