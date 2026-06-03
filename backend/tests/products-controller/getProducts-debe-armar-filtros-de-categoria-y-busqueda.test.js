const {
  pool,
  productsController,
  createRes,
  resetTestState,
} = require('../helpers/products-controller-test.helper');

describe('Prueba unitaria: getProducts arma filtros de categoria y busqueda', () => {
  beforeEach(() => {
    resetTestState();
  });

  test('Debe construir la consulta con categoryId y search, y devolver la meta paginada correcta', async () => {
    // Preparacion de la prueba
    const req = {
      query: { page: '2', pageSize: '5', categoryId: '3', search: 'lapiz' },
    };
    const res = createRes();
    pool.query.mockResolvedValueOnce([[{ total: 0 }]]).mockResolvedValueOnce([[]]);

    // Logica de la prueba
    await productsController.getProducts(req, res);

    // Verificacion del resultado esperado o Assert
    expect(pool.query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('p.categoria_id = ?'),
      [3, '%lapiz%', '%lapiz%']
    );
    expect(pool.query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('LIMIT ? OFFSET ?'),
      [3, '%lapiz%', '%lapiz%', 5, 5]
    );
    expect(res.json).toHaveBeenCalledWith({
      items: [],
      meta: { page: 2, pageSize: 5, total: 0 },
    });
  });
});