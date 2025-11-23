const router = require('express').Router();
const categoryController = require('../controllers/category.controller');

// Importar Middlewares (Asegúrate de que la ruta sea correcta)
const auth = require('../middlewares/auth'); 
const authAdmin = require('../middlewares/authAdmin'); 


// ===============================================================
// MIDDLEWARE DE SEGURIDAD (Aplicado a esta ruta)
// ===============================================================
router.get(
    '/', 
    auth,            // 1. Debe estar autenticado
    authAdmin,       // 2. Debe ser administrador
    categoryController.getAllCategories
);


module.exports = router;