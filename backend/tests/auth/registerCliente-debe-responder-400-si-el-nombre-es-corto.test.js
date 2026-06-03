const test = require('node:test');
const assert = require('node:assert/strict');
const { buildMockResponse, loadAuthController } = require('../helpers/auth.controller.test.helper');

test('registerCliente responde 400 si el nombre tiene menos de 3 caracteres', async () => {
  process.env.JWT_SECRET = 'secreto-pruebas';
  const controller = loadAuthController();
  const req = { body: { nombre: 'Al', email: 'alguien@mail.com', password: 'Clave123' } };
  const res = buildMockResponse();

  // Preparacion
  // Lógica
  await controller.registerCliente(req, res);
  // Verificacion
  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, {
    error: 'invalid_name',
    message: 'El nombre debe tener al menos 3 caracteres.',
  });
});
