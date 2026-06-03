const test = require('node:test');
const assert = require('node:assert/strict');
const { buildMockResponse, loadOrdersController } = require('../helpers/orders.controller.test.helper');

test('getOrderDetails debe responder 401 si no está autenticado', async () => {
  // 1) Preparación de la Prueba
  const controller = loadOrdersController();
  const req = { user: { sub: null }, params: { id: '10' } };
  const res = buildMockResponse();

  // 2) Lógica de la Prueba
  await controller.getOrderDetails(req, res);

  // 3) Verificación del resultado esperado o Assert
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { error: 'unauthorized' });
});
