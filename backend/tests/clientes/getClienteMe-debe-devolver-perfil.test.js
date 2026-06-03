const test = require('node:test');
const assert = require('node:assert/strict');
const { buildMockResponse, loadClientesController } = require('../helpers/orders.controller.test.helper');

test('getClienteMe debe devolver la información del perfil del cliente autenticado', async () => {
  // 1) Preparación de la Prueba
  const dbMock = {
    async query(sql, params) {
      assert.match(sql, /SELECT id, nombre, email/);
      assert.deepEqual(params, [123]);
      return [[
        {
          id: 123,
          nombre: 'Wilson Zenteno',
          email: 'wilson@mail.com',
          nit_ci: '9876543',
          zona: 'Sur',
          calle: 'Avenida Principal',
          numero_casa: '23'
        }
      ]];
    }
  };
  const controller = loadClientesController({ dbMock });
  const req = { user: { sub: 123, kind: 'cliente' } };
  const res = buildMockResponse();

  // 2) Lógica de la Prueba
  await controller.getClienteMe(req, res);

  // 3) Verificación del resultado esperado o Assert
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, {
    id: 123,
    nombre: 'Wilson Zenteno',
    email: 'wilson@mail.com',
    nit_ci: '9876543',
    zona: 'Sur',
    calle: 'Avenida Principal',
    numero_casa: '23'
  });
});
