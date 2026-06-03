const {
  pool,
  productsController,
  createRes,
  resetTestState,
} = require('../helpers/products-controller-test.helper');

describe('Prueba unitaria: getCategories devuelve arreglo vacio cuando no hay categorias', () => {
  beforeEach(() => {
    resetTestState();
  });

  test('Debe responder con un arreglo vacio cuando la consulta no devuelve registros', async () => {
    // Preparacion de la prueba
    const req = {};
    const res = createRes();
    pool.query.mockResolvedValueOnce([[]]);

    // Logica de la prueba
    await productsController.getCategories(req, res);

    // Verificacion del resultado esperado o Assert
    expect(res.json).toHaveBeenCalledWith([]);
  });
});