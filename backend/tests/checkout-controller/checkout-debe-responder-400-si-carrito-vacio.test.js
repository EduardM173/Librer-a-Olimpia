const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createRes,
  loadController,
} = require('../helpers/controller-loader.test.helper');

test('checkout responde 400 si el carrito esta vacio', async () => {
  const checkoutController = loadController('checkout.controller.js', {
    getConnection: async () => {
      throw new Error('No debe solicitar conexion si el carrito esta vacio');
    },
  });

  const req = { user: { sub: 7 }, body: { items: [] } };
  const res = createRes();

  await checkoutController.checkout(req, res);

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { error: 'empty_cart' });
});
