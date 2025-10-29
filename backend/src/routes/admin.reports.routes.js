const express = require('express');
const router = express.Router();

// Middlewares de autenticación
// Asegúrate de que las rutas a estos archivos sean correctas en tu proyecto
const auth = require('../middlewares/auth'); 
const authAdmin = require('../middlewares/authAdmin'); 

// Controlador de Reportes
const adminReports = require('../controllers/reports.controller');


// ===============================================================
// MIDDLEWARE DE SEGURIDAD
// Aplica autenticación (auth) y autorización de administrador (authAdmin) 
// a TODAS las rutas definidas en este router.
// ===============================================================
router.use(auth, authAdmin);


// ===============================================
// RUTAS DE REPORTES (Base: /api/admin/reportes)
// ===============================================

// GET /api/admin/reportes/summary
// Resumen de ventas (Total Neto, Pedidos Recibidos, Nuevos Clientes) por rango de fechas
router.get('/summary', adminReports.getSalesSummary);

// GET /api/admin/reportes/top-productos
// Lista de los 10 productos más vendidos por rango de fechas
router.get('/top-productos', adminReports.getTopProducts);


module.exports = router;