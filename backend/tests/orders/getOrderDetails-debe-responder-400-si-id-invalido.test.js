const test = require('node:test');
const assert = require('node:assert/strict');
const { buildMockResponse, loadOrdersController } = require('../helpers/orders.controller.test.helper');

test('getOrderDetails debe responder 400 si el pedidoId no es válido', async () => {
  // 1) Preparación de la Prueba
  const controller = loadOrdersController();
  const req = { user: { sub: 123 }, params: { id: 'no-es-un-numero' } };
  const res = buildMockResponse();

  // 2) Lógica de la Prueba
  await controller.getOrderDetails(req, res);

  // 3) Verificación del resultado esperado o Assert
  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { error: 'invalid_pedido_id' });
});
