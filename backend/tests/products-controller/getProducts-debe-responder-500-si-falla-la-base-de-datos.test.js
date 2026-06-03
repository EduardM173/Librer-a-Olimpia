const test = require('node:test');
const assert = require('node:assert/strict');
const {
  pool,
  productsController,
  createRes,
  resetTestState,
} = require('../helpers/products-controller-test.helper');

test('getProducts responde 500 si falla la base de datos', async () => {
  resetTestState();

  // Preparacion de la prueba
  const req = { query: {} };
  const res = createRes();
  pool.query.mockRejectedValueOnce(new Error('fallo db'));

  // Logica de la prueba
  await productsController.getProducts(req, res);

  // Verificacion del resultado esperado o Assert
  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, {
    error: 'products_failed',
    message: 'fallo db',
  });
});
