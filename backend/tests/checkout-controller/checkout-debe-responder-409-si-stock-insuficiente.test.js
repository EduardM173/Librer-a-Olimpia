const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createAsyncMock,
  createRes,
  loadController,
} = require('../helpers/controller-loader.test.helper');

test('checkout responde 409 si el stock es insuficiente para un item', async () => {
  const queryMock = createAsyncMock();
  queryMock.mockResolvedValueOnce([[
    { id: 3, nombre: 'Lapiz', precio_venta: 5, activo: 1, stock: 1 },
  ]]);

  const connection = {
    rollbackCalled: false,
    releaseCalled: false,
    beginTransaction: async () => {},
    query: queryMock,
    rollback: async function rollback() {
      this.rollbackCalled = true;
    },
    commit: async () => {},
    release: function release() {
      this.releaseCalled = true;
    },
  };

  const checkoutController = loadController('checkout.controller.js', {
    getConnection: async () => connection,
  });

  const req = { user: { sub: 3 }, body: { items: [{ id: 3, qty: 4 }] } };
  const res = createRes();

  await checkoutController.checkout(req, res);

  assert.equal(res.statusCode, 409);
  assert.deepEqual(res.body, {
    error: 'stock_insuficiente',
    detail: { id: 3, nombre: 'Lapiz', stock: 1, solicitado: 4 },
  });
  assert.equal(connection.rollbackCalled, true);
  assert.equal(connection.releaseCalled, true);
});
