const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createAsyncMock,
  createRes,
  loadController,
} = require('../helpers/controller-loader.test.helper');

test('getAllCategories mapea categoriaPadre como N/A cuando viene null', async () => {
  const queryMock = createAsyncMock();
  queryMock.mockResolvedValueOnce([[
    { id: 1, nombre: 'Papeleria', categoria_padre_nombre: null },
    { id: 2, nombre: 'Colores', categoria_padre_nombre: 'Papeleria' },
  ]]);

  const categoryController = loadController('category.controller.js', {
    query: queryMock,
  });

  const req = {};
  const res = createRes();

  await categoryController.getAllCategories(req, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, [
    { id: 1, nombre: 'Papeleria', categoriaPadre: 'N/A' },
    { id: 2, nombre: 'Colores', categoriaPadre: 'Papeleria' },
  ]);
});
