const test = require('node:test');
const assert = require('node:assert/strict');
const { buildMockResponse, loadOrdersController } = require('../helpers/orders.controller.test.helper');

test('getOrders debe responder 401 si el clienteId no está definido', async () => {
  // 1) Preparación de la Prueba
  const controller = loadOrdersController();
  const req = { user: { sub: null } };
  const res = buildMockResponse();

  // 2) Lógica de la Prueba
  await controller.getOrders(req, res);

  // 3) Verificación del resultado esperado o Assert
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { error: 'unauthorized' });
});
