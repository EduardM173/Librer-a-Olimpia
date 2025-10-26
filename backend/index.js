/**
 * =====================================================
 * PUNTO DE ENTRADA PRINCIPAL
 * Proyecto: Librería Olimpia
 * Autor: (Tu nombre)
 * Descripción: Carga la estructura modular del backend
 * =====================================================
 */

require('dotenv').config();  // Carga variables .env
require('./src/server');     // Inicia el servidor Express

// Nota:
// Ya no colocamos aquí lógica de rutas ni conexión a BD.
// Toda esa funcionalidad está organizada dentro de /src:
// - src/app.js → Configura la app y middlewares
// - src/server.js → Arranca el servidor
// - src/routes/ → Define rutas (ej. products.routes.js)
// - src/controllers/ → Lógica de control
// - src/services/ → Acceso a datos (consultas SQL)
// - src/config/db.js → Conexión MySQL centralizada
