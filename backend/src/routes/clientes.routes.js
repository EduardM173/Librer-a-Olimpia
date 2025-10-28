const router = require('express').Router();
const requireAuth = require('../middlewares/auth');
const {
  getClientes,
  updateCliente,
  getClienteMe,
  patchClienteMe,
} = require('../controllers/clientes.controller');

// ⚠️ Público (lo proteges en el front con RequireAdmin). Si quieres, añade un middleware de admin aquí.
router.get('/', getClientes);

// ⚠️ Público (lo usas desde el panel admin del front). Puedes protegerlo con middleware de admin si lo deseas.
router.put('/:id', updateCliente);

// ✅ Solo cliente autenticado: obtener sus propios datos (para autofill en checkout)
router.get('/me', requireAuth, getClienteMe);

// ✅ Solo cliente autenticado: actualizar sus propios datos (solo campos permitidos)
router.patch('/me', requireAuth, patchClienteMe);

module.exports = router;
