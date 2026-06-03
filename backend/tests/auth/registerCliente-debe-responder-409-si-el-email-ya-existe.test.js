const test = require('node:test');
const assert = require('node:assert/strict');
const { buildMockResponse, loadAuthController } = require('../helpers/auth.controller.test.helper');

test('registerCliente responde 409 cuando el correo ya esta registrado', async () => {
  process.env.JWT_SECRET = 'secreto-pruebas';
  const dbMock = {
    async query(sql, params) {
      assert.match(sql, /SELECT id FROM cliente WHERE email=\?/);
      assert.deepEqual(params, ['cliente@mail.com']);
      return [[{ id: 99 }]];
    },
  };
  const controller = loadAuthController({ dbMock });
  const req = { body: { nombre: 'Cliente Uno', email: 'Cliente@Mail.com', password: 'Clave123' } };
  const res = buildMockResponse();

  // Preparacion
  // Lógica
  await controller.registerCliente(req, res);
  // Verificacion
  assert.equal(res.statusCode, 409);
  assert.deepEqual(res.body, {
    error: 'email_in_use',
    message: 'Este correo ya está registrado.',
  });
});
