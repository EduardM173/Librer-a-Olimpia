const test = require('node:test');
const assert = require('node:assert/strict');
const { buildMockResponse, loadOrdersController } = require('../helpers/orders.controller.test.helper');

test('getOrderDetails debe devolver el detalle de un pedido del cliente', async () => {
  // 1) Preparación de la Prueba
  let queryCount = 0;
  const dbMock = {
    async query(sql, params) {
      queryCount++;
      if (queryCount === 1) {
        assert.match(sql, /FROM pedido/);
        assert.deepEqual(params, [10, 123]);
        return [[
          {
            id: 10,
            fecha_pedido: '2026-06-03',
            total_neto: 50.00,
            estado: 'PAGADO',
            sucursal_nombre: 'Central',
            cliente_nombre: 'Wilson Test'
          }
        ]];
      } else if (queryCount === 2) {
        assert.match(sql, /FROM pedido_detalle/);
        assert.deepEqual(params, [10]);
        return [[
          {
            producto_nombre: 'Libro X',
            sku: 'SKU123',
            cantidad: 2,
            precio_unitario: 25.00,
            importe_neto: 50.00
          }
        ]];
      }
      return [[]];
    }
  };
  const controller = loadOrdersController({ dbMock });
  const req = { user: { sub: 123 }, params: { id: '10' } };
  const res = buildMockResponse();

  // 2) Lógica de la Prueba
  await controller.getOrderDetails(req, res);

  // 3) Verificación del resultado esperado o Assert
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, {
    id: 10,
    fecha: '2026-06-03',
    total: '50.00',
    estado: 'PAGADO',
    sucursal: 'Central',
    cliente: 'Wilson Test',
    detalle: [
      {
        nombre: 'Libro X',
        sku: 'SKU123',
        cantidad: 2,
        precio_unitario: '25.00',
        importe: '50.00'
      }
    ]
  });
});
