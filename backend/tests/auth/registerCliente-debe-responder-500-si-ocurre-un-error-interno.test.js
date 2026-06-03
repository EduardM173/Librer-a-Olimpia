const test = require('node:test');
const assert = require('node:assert/strict');
const { buildMockResponse, loadAuthController } = require('../helpers/auth.controller.test.helper');

test('registerCliente responde 500 y registra error si falla la base de datos', async () => {
  process.env.JWT_SECRET = 'secreto-pruebas';
  const dbMock = {
    async query() {
      throw new Error('db rota');
    },
  };
  const loggerErrors = [];
  const loggerMock = {
    info() {},
    warn() {},
    error(message, meta) {
      loggerErrors.push({ message, meta });
    },
  };
  const controller = loadAuthController({ dbMock, loggerMock });
  const req = { body: { nombre: 'Alicia', email: 'alicia@mail.com', password: 'Clave123' } };
  const res = buildMockResponse();

  // Preparacion
  // Lógica
  await controller.registerCliente(req, res);
  // Verificacion
  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, {
    error: 'register_failed',
    message: 'Error interno del servidor.',
  });
  assert.equal(loggerErrors.length, 1);
  assert.equal(loggerErrors[0].message, 'Error en registerCliente');
  assert.equal(loggerErrors[0].meta.message, 'db rota');
});
