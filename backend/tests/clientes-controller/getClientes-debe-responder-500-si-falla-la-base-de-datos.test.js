const test = require('node:test');
const assert = require('node:assert/strict');
const {
  pool,
  clientesController,
  createRes,
  resetTestState,
} = require('../helpers/clientes-controller-test.helper');

test('getClientes responde 500 si falla la base de datos', async () => {
  resetTestState();

  // Preparacion de la prueba
  const req = {};
  const res = createRes();
  pool.query.mockRejectedValueOnce(new Error('fallo db clientes'));

  // Logica de la prueba
  await clientesController.getClientes(req, res);

  // Verificacion del resultado esperado o Assert
  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, { message: 'Error al obtener clientes' });
});
