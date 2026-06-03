const test = require('node:test');
const assert = require('node:assert/strict');
const {
  pool,
  clientesController,
  createRes,
  resetTestState,
} = require('../helpers/clientes-controller-test.helper');

test('getClienteMe responde 403 si no es cliente', async () => {
  resetTestState();

  // Preparacion de la prueba
  const req = { user: { kind: 'usuario', sub: 1 } };
  const res = createRes();

  // Logica de la prueba
  await clientesController.getClienteMe(req, res);

  // Verificacion del resultado esperado o Assert
  assert.equal(pool.query.calls.length, 0);
  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.body, { error: 'forbidden', message: 'Solo clientes' });
});
