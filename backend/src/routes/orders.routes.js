const router = require('express').Router();
const ctrl = require('../controllers/orders.controller');
// Asume que tienes un middleware para verificar la sesión del usuario
const authMiddleware = require('../middlewares/auth'); 

// --- Endpoints para Pedidos del Cliente ---
// Requiere autenticación
router.get('/orders', authMiddleware, ctrl.getOrders); 
router.get('/orders/:id', authMiddleware, ctrl.getOrderDetails);

module.exports = router;