const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');

router.post('/auth/register', ctrl.registerCliente);
router.post('/auth/login',    ctrl.login); // <- unificado

module.exports = router;
