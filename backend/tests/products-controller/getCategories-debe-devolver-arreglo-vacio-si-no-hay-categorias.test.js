const test = require('node:test');
const assert = require('node:assert/strict');
const {
  pool,
  productsController,
  createRes,
  resetTestState,
} = require('../helpers/products-controller-test.helper');

test('getCategories devuelve un arreglo vacio cuando no hay categorias', async () => {
  resetTestState();

  // Preparacion de la prueba
  const req = {};
  const res = createRes();
  pool.query.mockResolvedValueOnce([[]]);

  // Logica de la prueba
  await productsController.getCategories(req, res);

  // Verificacion del resultado esperado o Assert
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, []);
});
