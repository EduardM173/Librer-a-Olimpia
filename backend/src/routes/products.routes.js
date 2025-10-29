const router = require('express').Router();
const ctrl = require('../controllers/products.controller');
const uploadCtrl = require('../controllers/upload.controller');

// ===============================
// 🔹 RUTAS PÚBLICAS DE PRODUCTOS
// ===============================

// 🟢 Obtener categorías primero (debe ir ANTES de /:id)
router.get('/categories', ctrl.getCategories);

// 🟢 Lista de productos
router.get('/', ctrl.getProducts);

// 🟢 Detalle de producto
router.get('/:id', ctrl.getProductById);

// ===============================
// 🔹 SUBIDA DE IMÁGENES
// ===============================
router.post('/upload/image', uploadCtrl.uploadImage);

module.exports = router;
