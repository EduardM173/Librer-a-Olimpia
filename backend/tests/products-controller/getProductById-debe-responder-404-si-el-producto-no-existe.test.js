const {
  pool,
  productsController,
  createRes,
  resetTestState,
} = require('../helpers/products-controller-test.helper');

describe('Prueba unitaria: getProductById responde 404 si el producto no existe', () => {
  beforeEach(() => {
    resetTestState();
  });

  test('Debe devolver not_found cuando la consulta no retorna filas', async () => {
    // Preparacion de la prueba
    const req = { params: { id: '99' } };
    const res = createRes();
    pool.query.mockResolvedValueOnce([[]]);

    // Logica de la prueba
    await productsController.getProductById(req, res);

    // Verificacion del resultado esperado o Assert
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: 'not_found',
      message: 'Producto no encontrado.',
    });
  });
});