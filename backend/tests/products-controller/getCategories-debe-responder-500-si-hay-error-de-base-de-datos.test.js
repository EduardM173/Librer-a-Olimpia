const {
  pool,
  productsController,
  createRes,
  resetTestState,
} = require('../helpers/products-controller-test.helper');

describe('Prueba unitaria: getCategories responde 500 si hay error de base de datos', () => {
  beforeEach(() => {
    resetTestState();
  });

  test('Debe responder con server_error cuando ocurre una excepcion al consultar categorias', async () => {
    // Preparacion de la prueba
    const req = {};
    const res = createRes();
    pool.query.mockRejectedValueOnce(new Error('db categories error'));

    // Logica de la prueba
    await productsController.getCategories(req, res);

    // Verificacion del resultado esperado o Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'server_error',
      message: 'Error al obtener categorías desde la base de datos.',
    });
  });
});