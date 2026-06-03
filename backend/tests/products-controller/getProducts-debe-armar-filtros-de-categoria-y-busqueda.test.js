const test = require('node:test');
const assert = require('node:assert/strict');
const {
  pool,
  productsController,
  createRes,
  resetTestState,
} = require('../helpers/products-controller-test.helper');

test('getProducts arma filtros de categoria y busqueda', async () => {
  resetTestState();

  // Preparacion de la prueba
  const req = {
    query: { page: '2', pageSize: '5', categoryId: '3', search: 'lapiz' },
  };
  const res = createRes();
  pool.query.mockResolvedValueOnce([[{ total: 0 }]]).mockResolvedValueOnce([[]]);

  // Logica de la prueba
  await productsController.getProducts(req, res);

  // Verificacion del resultado esperado o Assert
  assert.match(pool.query.calls[0][0], /p\.categoria_id = \?/);
  assert.deepEqual(pool.query.calls[0][1], [3, '%lapiz%', '%lapiz%']);
  assert.match(pool.query.calls[1][0], /LIMIT \? OFFSET \?/);
  assert.deepEqual(pool.query.calls[1][1], [3, '%lapiz%', '%lapiz%', 5, 5]);
  assert.deepEqual(res.body, {
    items: [],
    meta: { page: 2, pageSize: 5, total: 0 },
  });
});
