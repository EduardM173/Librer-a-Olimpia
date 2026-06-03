const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createAsyncMock,
  createRes,
  loadController,
} = require('../helpers/controller-loader.test.helper');

test('getAdminProducts devuelve items y meta con paginacion por defecto', async () => {
  const queryMock = createAsyncMock();
  queryMock
    .mockResolvedValueOnce([[{ id: 11, nombre: 'Libro Azul' }]])
    .mockResolvedValueOnce([[{ total: 35 }]]);

  const adminProductsController = loadController('admin.products.controller.js', {
    query: queryMock,
  });

  const req = { query: {} };
  const res = createRes();

  await adminProductsController.getAdminProducts(req, res);

  assert.deepEqual(queryMock.calls[0][1], [20, 0]);
  assert.deepEqual(res.body, {
    items: [{ id: 11, nombre: 'Libro Azul' }],
    meta: { page: 1, pageSize: 20, total: 35 },
  });
});
