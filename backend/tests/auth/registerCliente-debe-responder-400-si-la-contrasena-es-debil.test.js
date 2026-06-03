const test = require('node:test');
const assert = require('node:assert/strict');
const { buildMockResponse, loadAuthController } = require('../helpers/auth.controller.test.helper');

test('registerCliente responde 400 si la contraseña no cumple la politica minima', async () => {
  process.env.JWT_SECRET = 'secreto-pruebas';
  const controller = loadAuthController();
  const req = { body: { nombre: 'Alicia', email: 'alicia@mail.com', password: 'clave' } };
  const res = buildMockResponse();

  // Preparacion
  // Lógica
  await controller.registerCliente(req, res);
  // Verificacion
  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, {
    error: 'weak_password',
    message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.',
  });
});
