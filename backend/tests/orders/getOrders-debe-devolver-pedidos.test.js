const test = require('node:test');
const assert = require('node:assert/strict');
const { buildMockResponse, loadOrdersController } = require('../helpers/orders.controller.test.helper');

test('getOrders debe devolver pedidos del cliente autenticado', async () => {
  // 1) Preparación de la Prueba
  const dbMock = {
    async query(sql, params) {
      assert.match(sql, /FROM pedido/);
      assert.deepEqual(params, [123]);
      return [[
        {
          id: 1,
          fecha_pedido: '2026-06-03',
          total_neto: 150.00,
          estado: 'PENDIENTE',
          sucursal_nombre: 'Central'
        }
      ]];
    }
  };
  const controller = loadOrdersController({ dbMock });
  const req = { user: { sub: 123 } };
  const res = buildMockResponse();

  // 2) Lógica de la Prueba
  await controller.getOrders(req, res);

  // 3) Verificación del resultado esperado o Assert
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, [
    {
      id: 1,
      fecha: '2026-06-03',
      total: '150.00',
      estado: 'PENDIENTE',
      sucursal: 'Central'
    }
  ]);
});
