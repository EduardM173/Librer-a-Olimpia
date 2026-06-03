const test = require('node:test');
const assert = require('node:assert/strict');
const {
  pool,
  productsController,
  createRes,
  resetTestState,
} = require('../helpers/products-controller-test.helper');

test('getCategories devuelve correctamente la lista de categorias', async () => {
  resetTestState();

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
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, rows);
});
