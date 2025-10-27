const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');

router.post('/auth/register', ctrl.registerCliente);
router.post('/auth/login',    ctrl.loginCliente);
router.post('/auth/logout',   ctrl.logout);
module.exports = router;
