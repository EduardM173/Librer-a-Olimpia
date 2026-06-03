const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createAsyncMock,
  createRes,
  loadController,
} = require('../helpers/controller-loader.test.helper');

test('createProduct responde 409 si el SKU ya existe', async () => {
  const queryMock = createAsyncMock();
  const duplicateError = new Error('Duplicate entry');
  duplicateError.code = 'ER_DUP_ENTRY';
  queryMock.mockRejectedValueOnce(duplicateError);

  const adminProductsController = loadController('admin.products.controller.js', {
    query: queryMock,
  });

  const req = {
    body: {
      nombre: 'Nuevo Libro',
      sku: 'SKU-001',
      precio_venta: 20,
    },
  };
  const res = createRes();

  await adminProductsController.createProduct(req, res);

  assert.equal(res.statusCode, 409);
  assert.deepEqual(res.body, {
    error: 'sku_in_use',
    message: 'El SKU ya está en uso.',
  });
});
