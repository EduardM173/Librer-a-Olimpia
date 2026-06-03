const test = require('node:test');
const assert = require('node:assert/strict');
const { buildMockResponse, loadOrdersController } = require('../helpers/orders.controller.test.helper');

test('getOrderDetails debe responder 404 si el pedido no existe o no pertenece al usuario', async () => {
  // 1) Preparación de la Prueba
  const dbMock = {
    async query(sql, params) {
      assert.match(sql, /FROM pedido/);
      assert.deepEqual(params, [999, 123]);
      return [[]]; // pedido no encontrado
    }
  };
  const controller = loadOrdersController({ dbMock });
  const req = { user: { sub: 123 }, params: { id: '999' } };
  const res = buildMockResponse();

  // 2) Lógica de la Prueba
  await controller.getOrderDetails(req, res);

  // 3) Verificación del resultado esperado o Assert
  assert.equal(res.statusCode, 404);
  assert.deepEqual(res.body, { error: 'pedido_not_found_or_unauthorized' });
});
