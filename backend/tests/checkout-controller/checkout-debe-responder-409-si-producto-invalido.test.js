const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createAsyncMock,
  createRes,
  loadController,
} = require('../helpers/controller-loader.test.helper');

test('checkout responde 409 si encuentra un producto inactivo o invalido', async () => {
  const queryMock = createAsyncMock();
  queryMock.mockResolvedValueOnce([[
    { id: 1, nombre: 'Libro', precio_venta: 25, activo: 0, stock: 10 },
  ]]);

  const connection = {
    beginTransactionCalled: false,
    rollbackCalled: false,
    commitCalled: false,
    releaseCalled: false,
    beginTransaction: async function beginTransaction() {
      this.beginTransactionCalled = true;
    },
    query: queryMock,
    rollback: async function rollback() {
      this.rollbackCalled = true;
    },
    commit: async function commit() {
      this.commitCalled = true;
    },
    release: function release() {
      this.releaseCalled = true;
    },
  };

  const checkoutController = loadController('checkout.controller.js', {
    getConnection: async () => connection,
  });

  const req = { user: { sub: 7 }, body: { items: [{ id: 1, qty: 2 }] } };
  const res = createRes();

  await checkoutController.checkout(req, res);

  assert.equal(res.statusCode, 409);
  assert.deepEqual(res.body, { error: 'producto_invalido', id: 1 });
  assert.equal(connection.rollbackCalled, true);
  assert.equal(connection.commitCalled, false);
  assert.equal(connection.releaseCalled, true);
});
