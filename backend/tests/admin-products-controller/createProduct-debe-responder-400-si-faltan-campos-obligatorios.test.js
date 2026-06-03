const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createRes,
  loadController,
} = require('../helpers/controller-loader.test.helper');

test('createProduct responde 400 cuando faltan campos obligatorios', async () => {
  const adminProductsController = loadController('admin.products.controller.js', {
    query: async () => {
      throw new Error('No deberia consultar la BD cuando faltan campos');
    },
  });

  const req = {
    body: {
      nombre: 'Agenda 2026',
      descripcion: 'Sin SKU ni precio',
    },
  };
  const res = createRes();

  await adminProductsController.createProduct(req, res);

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, {
    error: 'missing_fields',
    message: 'Faltan campos obligatorios.',
  });
});
