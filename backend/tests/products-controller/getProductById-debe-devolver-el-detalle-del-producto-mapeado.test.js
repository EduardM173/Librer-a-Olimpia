const test = require('node:test');
const assert = require('node:assert/strict');
const {
  pool,
  productsController,
  createRes,
  resetTestState,
} = require('../helpers/products-controller-test.helper');

test('getProductById devuelve el detalle del producto mapeado', async () => {
  resetTestState();

  // Preparacion de la prueba
  const req = { params: { id: '5' } };
  const res = createRes();
  pool.query.mockResolvedValueOnce([[
    {
      id: 5,
      nombre: 'Cuaderno',
      descripcion: null,
      precio_venta: 18,
      imagen_url: null,
      activo: 1,
      categoria: null,
      stock: 0,
      popularity: 12,
    },
  ]]);

  // Logica de la prueba
  await productsController.getProductById(req, res);

  // Verificacion del resultado esperado o Assert
  assert.deepEqual(res.body, {
    id: 5,
    nombre: 'Cuaderno',
    descripcion: 'Sin descripción disponible',
    categoria: 'Sin categoría',
    precio: '18.00',
    imagen: '/IMG/placeholder-producto.jpg',
    agotado: true,
    stock: 0,
    popularidad: 12,
  });
});
