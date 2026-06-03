const test = require('node:test');
const assert = require('node:assert/strict');
const {
  pool,
  clientesController,
  createRes,
  resetTestState,
} = require('../helpers/clientes-controller-test.helper');

test('getClienteMe responde 404 si el cliente no existe', async () => {
  resetTestState();

  // Preparacion de la prueba
  const req = { user: { kind: 'cliente', sub: 1 } };
  const res = createRes();
  pool.query.mockResolvedValueOnce([[]]);

  // Logica de la prueba
  await clientesController.getClienteMe(req, res);

  // Verificacion del resultado esperado o Assert
  assert.equal(pool.query.calls.length, 1);
  assert.deepEqual(pool.query.calls[0][1], [1]);
  assert.equal(res.statusCode, 404);
  assert.deepEqual(res.body, { error: 'not_found' });
});
