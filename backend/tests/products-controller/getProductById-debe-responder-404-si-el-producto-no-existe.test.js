const test = require('node:test');
const assert = require('node:assert/strict');
const {
  pool,
  productsController,
  createRes,
  resetTestState,
} = require('../helpers/products-controller-test.helper');

test('getProductById responde 404 si el producto no existe', async () => {
  resetTestState();

  // Preparacion de la prueba
  const req = { params: { id: '99' } };
  const res = createRes();
  pool.query.mockResolvedValueOnce([[]]);

  // Logica de la prueba
  await productsController.getProductById(req, res);

  // Verificacion del resultado esperado o Assert
  assert.equal(res.statusCode, 404);
  assert.deepEqual(res.body, {
    error: 'not_found',
    message: 'Producto no encontrado.',
  });
});
