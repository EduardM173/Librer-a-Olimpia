const test = require('node:test');
const assert = require('node:assert/strict');
const { buildMockResponse, loadOrdersController } = require('../helpers/orders.controller.test.helper');

test('getOrders debe responder 500 si falla la base de datos', async () => {
  // 1) Preparación de la Prueba
  const dbMock = {
    async query() {
      throw new Error('Error de conexión a la BD');
    }
  };
  const controller = loadOrdersController({ dbMock });
  const req = { user: { sub: 123 } };
  const res = buildMockResponse();

  // 2) Lógica de la Prueba
  await controller.getOrders(req, res);

  // 3) Verificación del resultado esperado o Assert
  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, { error: 'orders_failed' });
});
