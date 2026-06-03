const {
  pool,
  productsController,
  createRes,
  resetTestState,
} = require('../helpers/products-controller-test.helper');

describe('Prueba unitaria: getCategories devuelve categorias ordenadas', () => {
  beforeEach(() => {
    resetTestState();
  });

  test('Debe retornar la lista de categorias recibida desde base de datos', async () => {
    // Preparacion de la prueba
    const req = {};
    const res = createRes();
    const rows = [
      { id: 1, nombre: 'Accesorios' },
      { id: 2, nombre: 'Libros' },
    ];
    pool.query.mockResolvedValueOnce([rows]);

    // Logica de la prueba
    await productsController.getCategories(req, res);

    // Verificacion del resultado esperado o Assert
    expect(res.json).toHaveBeenCalledWith(rows);
  });
});