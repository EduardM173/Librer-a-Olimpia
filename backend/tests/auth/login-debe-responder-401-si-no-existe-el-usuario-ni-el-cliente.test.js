const test = require('node:test');
const assert = require('node:assert/strict');
const { buildMockResponse, loadAuthController } = require('../helpers/auth.controller.test.helper');

test('login responde 401 cuando no encuentra ni cliente ni usuario', async () => {
  process.env.JWT_SECRET = 'secreto-pruebas';
  let callCount = 0;
  const dbMock = {
    async query() {
      callCount += 1;
      return [[]];
    },
  };
  const loggerWarns = [];
  const loggerMock = {
    info() {},
    warn(message, meta) {
      loggerWarns.push({ message, meta });
    },
    error() {},
  };
  const controller = loadAuthController({ dbMock, loggerMock });
  const req = { body: { email: 'nadie@mail.com', password: 'Clave123' } };
  const res = buildMockResponse();

  // Preparacion
  // Lógica
  await controller.login(req, res);
  // Verificacion
  assert.equal(callCount, 2);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, {
    error: 'invalid_credentials',
    message: 'Credenciales inválidas.',
  });
  assert.equal(loggerWarns[0].message, 'LOGIN_FALLIDO: Usuario/Cliente no encontrado');
});
