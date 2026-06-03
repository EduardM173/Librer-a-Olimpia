const {
  pool,
  productsController,
  createRes,
  resetTestState,
} = require('../helpers/products-controller-test.helper');

describe('Prueba unitaria: getProducts responde 500 si falla la base de datos', () => {
  beforeEach(() => {
    resetTestState();
  });

  test('Debe responder con error products_failed cuando pool.query lanza una excepcion', async () => {
    // Preparacion de la prueba
    const req = { query: {} };
    const res = createRes();
    pool.query.mockRejectedValueOnce(new Error('fallo db'));

    // Logica de la prueba
    await productsController.getProducts(req, res);

    // Verificacion del resultado esperado o Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'products_failed',
      message: 'fallo db',
    });
  });
});