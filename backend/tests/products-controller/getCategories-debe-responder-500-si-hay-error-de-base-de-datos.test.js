const test = require('node:test');
const assert = require('node:assert/strict');
const {
  pool,
  productsController,
  createRes,
  resetTestState,
} = require('../helpers/products-controller-test.helper');

test('getCategories responde 500 si hay error de base de datos', async () => {
  resetTestState();

  // Preparacion de la prueba
  const req = {};
  const res = createRes();
  pool.query.mockRejectedValueOnce(new Error('db categories error'));

  // Logica de la prueba
  await productsController.getCategories(req, res);

  // Verificacion del resultado esperado o Assert
  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, {
    error: 'server_error',
    message: 'Error al obtener categorías desde la base de datos.',
  });
});
