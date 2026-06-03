const test = require('node:test');
const assert = require('node:assert/strict');
const { buildMockResponse, loadClientesController } = require('../helpers/orders.controller.test.helper');

test('getClienteMe debe responder 403 si el tipo de usuario no es cliente', async () => {
  // 1) Preparación de la Prueba
  const controller = loadClientesController();
  const req = { user: { sub: 123, kind: 'admin' } };
  const res = buildMockResponse();

  // 2) Lógica de la Prueba
  await controller.getClienteMe(req, res);

  // 3) Verificación del resultado esperado o Assert
  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.body, { error: 'forbidden', message: 'Solo clientes' });
});
