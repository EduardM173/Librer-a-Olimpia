const {
  pool,
  productsController,
  createRes,
  resetTestState,
} = require('../helpers/products-controller-test.helper');

describe('Prueba unitaria: getProductById responde 400 si el id no es valido', () => {
  beforeEach(() => {
    resetTestState();
  });

  test('Debe rechazar ids no numericos sin consultar la base de datos', async () => {
    // Preparacion de la prueba
    const req = { params: { id: 'abc' } };
    const res = createRes();

    // Logica de la prueba
    await productsController.getProductById(req, res);

    // Verificacion del resultado esperado o Assert
    expect(pool.query).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'invalid_id',
      message: 'El ID de producto no es válido.',
    });
  });
});