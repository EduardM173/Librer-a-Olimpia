const test = require('node:test');
const assert = require('node:assert/strict');
const {
  pool,
  productsController,
  createRes,
  resetTestState,
} = require('../helpers/products-controller-test.helper');

test('getProducts devuelve items mapeados y meta por defecto', async () => {
  resetTestState();

  // Preparacion de la prueba
  const req = { query: {} };
  const res = createRes();
  pool.query
    .mockResolvedValueOnce([[{ total: 2 }]])
    .mockResolvedValueOnce([[
      {
        id: 1,
        nombre: 'Libro A',
        descripcion: 'Descripcion A',
        precio_venta: 25.5,
        imagen_url: null,
        activo: 1,
        stock: 3,
        popularity: 8,
      },
      {
        id: 2,
        nombre: 'Libro B',
        descripcion: null,
        precio_venta: 10,
        imagen_url: '/img/libro-b.png',
        activo: 0,
        stock: 2,
        popularity: 1,
      },
    ]]);

  // Logica de la prueba
  await productsController.getProducts(req, res);

  // Verificacion del resultado esperado o Assert
  assert.deepEqual(res.body, {
    items: [
      {
        id: 1,
        nombre: 'Libro A',
        descripcion: 'Descripcion A',
        precio: '25.50',
        imagen: '/IMG/placeholder-producto.jpg',
        agotado: false,
      },
      {
        id: 2,
        nombre: 'Libro B',
        descripcion: 'Sin descripción disponible',
        precio: '10.00',
        imagen: '/img/libro-b.png',
        agotado: true,
      },
    ],
    meta: { page: 1, pageSize: 12, total: 2 },
  });
});
