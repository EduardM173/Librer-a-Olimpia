const test = require('node:test');
const assert = require('node:assert/strict');
const {
  pool,
  productsController,
  createRes,
  resetTestState,
} = require('../helpers/products-controller-test.helper');

test('getProducts limita page y pageSize al rango permitido', async () => {
  resetTestState();

  // Preparacion de la prueba
  const req = { query: { page: '0', pageSize: '100' } };
  const res = createRes();
  pool.query.mockResolvedValueOnce([[{ total: 0 }]]).mockResolvedValueOnce([[]]);

  // Logica de la prueba
  await productsController.getProducts(req, res);

  // Verificacion del resultado esperado o Assert
  assert.deepEqual(pool.query.calls[1][1], [48, 0]);
  assert.deepEqual(res.body, {
    items: [],
    meta: { page: 1, pageSize: 48, total: 0 },
  });
});
