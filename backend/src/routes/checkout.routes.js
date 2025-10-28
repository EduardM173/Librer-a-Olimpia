const router = require('express').Router();
const authCliente = require('../middlewares/authCliente');
const ctrl = require('../controllers/checkout.controller');

// POST /api/checkout  (solo clientes logueados)
router.post('/', authCliente, ctrl.checkout);

module.exports = router;
