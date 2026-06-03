const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createAsyncMock,
  createRes,
  loadController,
} = require('../helpers/controller-loader.test.helper');

test('checkout confirma transaccion y devuelve pedido, venta y total', async () => {
  const queryMock = createAsyncMock();
  queryMock
    .mockResolvedValueOnce([[{ id: 2, nombre: 'Cuaderno', precio_venta: 5, activo: 1, stock: 9 }]])
    .mockResolvedValueOnce([{}])
    .mockResolvedValueOnce([{ insertId: 101 }])
    .mockResolvedValueOnce([{}])
    .mockResolvedValueOnce([{ insertId: 202 }])
    .mockResolvedValueOnce([{}]);

  const connection = {
    commitCalled: false,
    releaseCalled: false,
    beginTransaction: async () => {},
    query: queryMock,
    rollback: async () => {},
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

  const req = {
    user: { sub: 99 },
    body: {
      envio: { zona: 'Centro', calle: 'Sucre', numero_casa: '88' },
      factura: { nit_ci: '12345' },
      items: [{ id: 2, qty: 3 }],
    },
  };
  const res = createRes();

  await checkoutController.checkout(req, res);

  assert.equal(connection.commitCalled, true);
  assert.equal(connection.releaseCalled, true);
  assert.deepEqual(queryMock.calls[0][1], [2]);
  assert.deepEqual(queryMock.calls[3][1], [101, 2, 3, 5, 15]);
  assert.deepEqual(res.body, { ok: true, pedido_id: 101, venta_id: 202, total: 15 });
});
