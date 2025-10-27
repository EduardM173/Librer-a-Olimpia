const router = require('express').Router();
const reportsCtrl = require('../controllers/reports.controller');
// Supón que tienes un middleware para verificar que sea ADMIN
const authAdminMiddleware = require('../middlewares/auth'); 

// Todas las rutas de reportes requieren autenticación y rol de ADMIN
router.use(authAdminMiddleware); 

// --- Endpoints de Reportes ---

// GET /api/admin/reportes/ventas-por-dia?fechaInicio=...&fechaFin=...
router.get('/reportes/ventas-por-dia', reportsCtrl.getSalesSummary);

// GET /api/admin/reportes/top-productos?fechaInicio=...&fechaFin=...
router.get('/reportes/top-productos', reportsCtrl.getTopProducts);

module.exports = router;