const {
  pool,
  productsController,
  createRes,
  resetTestState,
} = require('../helpers/products-controller-test.helper');

describe('Prueba unitaria: getProducts limita page y pageSize', () => {
  beforeEach(() => {
    resetTestState();
  });

  test('Debe normalizar page a 1 y pageSize a 48 cuando llegan valores fuera del rango permitido', async () => {
    // Preparacion de la prueba
    const req = { query: { page: '0', pageSize: '100' } };
    const res = createRes();
    pool.query.mockResolvedValueOnce([[{ total: 0 }]]).mockResolvedValueOnce([[]]);

    // Logica de la prueba
    await productsController.getProducts(req, res);

    // Verificacion del resultado esperado o Assert
    expect(pool.query).toHaveBeenNthCalledWith(
      2,
      expect.any(String),
      [48, 0]
    );
    expect(res.json).toHaveBeenCalledWith({
      items: [],
      meta: { page: 1, pageSize: 48, total: 0 },
    });
  });
});