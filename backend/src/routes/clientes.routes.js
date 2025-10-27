const router = require('express').Router();
const ctrl = require('../controllers/products.controller');

// --- Endpoints principales ---
router.get('/categories', ctrl.getCategories);
router.get('/products', ctrl.getProducts);
router.get('/products/:id', ctrl.getProductById); // ✅ detalle incluye descripción

module.exports = router;
