const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createAsyncMock,
  createRes,
  loadController,
} = require('../helpers/controller-loader.test.helper');

test('checkout responde 500 y hace rollback si ocurre un error en la transaccion', async () => {
  const queryMock = createAsyncMock();
  queryMock.mockRejectedValueOnce(new Error('Fallo de BD'));

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

  const req = { user: { sub: 1 }, body: { items: [{ id: 9, qty: 1 }] } };
  const res = createRes();

  await checkoutController.checkout(req, res);

  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, { error: 'checkout_failed' });
  assert.equal(connection.rollbackCalled, true);
  assert.equal(connection.releaseCalled, true);
});
