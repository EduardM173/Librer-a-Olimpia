const router = require('express').Router();
const ctrl = require('../controllers/products.controller');

// GET /api/products
router.get('/', ctrl.getProducts); 
// GET /api/products/:id
router.get('/:id', ctrl.getProductById); 

// GET /api/products/categories
router.get('/categories', ctrl.getCategories); 

module.exports = router;