const test = require('node:test');
const assert = require('node:assert/strict');
const { buildMockResponse, loadClientesController } = require('../helpers/orders.controller.test.helper');

test('getClienteMe debe responder 404 si el cliente no existe en la base de datos', async () => {
  // 1) Preparación de la Prueba
  const dbMock = {
    async query(sql, params) {
      assert.match(sql, /SELECT id, nombre, email/);
      assert.deepEqual(params, [123]);
      return [[]]; // Vacío, no se encuentra
    }
  };
  const controller = loadClientesController({ dbMock });
  const req = { user: { sub: 123, kind: 'cliente' } };
  const res = buildMockResponse();

  // 2) Lógica de la Prueba
  await controller.getClienteMe(req, res);

  // 3) Verificación del resultado esperado o Assert
  assert.equal(res.statusCode, 404);
  assert.deepEqual(res.body, { error: 'not_found' });
});
