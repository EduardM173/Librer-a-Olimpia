const test = require('node:test');
const assert = require('node:assert/strict');
const {
  pool,
  clientesController,
  createRes,
  resetTestState,
} = require('../helpers/clientes-controller-test.helper');

test('getClientes devuelve arreglo vacio si no hay clientes', async () => {
  resetTestState();

  // Preparacion de la prueba
  const req = {};
  const res = createRes();
  pool.query.mockResolvedValueOnce([[]]);

  // Logica de la prueba
  await clientesController.getClientes(req, res);

  // Verificacion del resultado esperado o Assert
  assert.deepEqual(res.body, []);
  assert.equal(res.statusCode, 200);
});
