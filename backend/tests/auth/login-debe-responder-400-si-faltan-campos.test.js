const test = require('node:test');
const assert = require('node:assert/strict');
const { buildMockResponse, loadAuthController } = require('../helpers/auth.controller.test.helper');

test('login responde 400 cuando faltan email o password', async () => {
  process.env.JWT_SECRET = 'secreto-pruebas';
  const controller = loadAuthController();
  const req = { body: { email: '', password: '' } };
  const res = buildMockResponse();

  // Preparacion
  // Lógica
  await controller.login(req, res);
  // Verificacion
  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, {
    error: 'missing_fields',
    message: 'Campos incompletos.',
  });
});
