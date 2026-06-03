const test = require('node:test');
const assert = require('node:assert/strict');
const {
  pool,
  productsController,
  createRes,
  resetTestState,
} = require('../helpers/products-controller-test.helper');

test('getProductById responde 400 si el id no es valido', async () => {
  resetTestState();

  // Preparacion de la prueba
  const req = { params: { id: 'abc' } };
  const res = createRes();

  // Logica de la prueba
  await productsController.getProductById(req, res);

  // Verificacion del resultado esperado o Assert
  assert.equal(pool.query.calls.length, 0);
  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, {
    error: 'invalid_id',
    message: 'El ID de producto no es válido.',
  });
});
