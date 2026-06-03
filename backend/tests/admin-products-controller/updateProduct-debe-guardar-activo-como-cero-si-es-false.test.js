const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createAsyncMock,
  createRes,
  loadController,
} = require('../helpers/controller-loader.test.helper');

test('updateProduct guarda activo en 0 cuando llega false', async () => {
  const queryMock = createAsyncMock();
  queryMock
    .mockResolvedValueOnce([{ affectedRows: 1 }])
    .mockResolvedValueOnce([[{ id: 8, nombre: 'Marcador', activo: 0 }]]);

  const adminProductsController = loadController('admin.products.controller.js', {
    query: queryMock,
  });

  const req = {
    params: { id: '8' },
    body: {
      nombre: 'Marcador',
      sku: 'M-008',
      descripcion: 'Punta fina',
      precio_venta: 12,
      categoria_id: 2,
      imagen_url: '/IMG/marcador.jpg',
      activo: false,
    },
  };
  const res = createRes();

  await adminProductsController.updateProduct(req, res);

  assert.equal(queryMock.calls[0][1][6], 0);
  assert.equal(queryMock.calls[0][1][7], '8');
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.producto.activo, 0);
});
