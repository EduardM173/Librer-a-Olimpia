const {
  pool,
  productsController,
  createRes,
  resetTestState,
} = require('../helpers/products-controller-test.helper');

describe('Prueba unitaria: getProductById devuelve el detalle del producto mapeado', () => {
  beforeEach(() => {
    resetTestState();
  });

  test('Debe transformar descripcion, categoria, precio, imagen y agotado antes de responder', async () => {
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
    expect(res.json).toHaveBeenCalledWith({
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
});