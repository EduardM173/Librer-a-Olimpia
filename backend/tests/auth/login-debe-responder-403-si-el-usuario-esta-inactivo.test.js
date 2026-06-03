const test = require('node:test');
const assert = require('node:assert/strict');
const { buildMockResponse, loadAuthController } = require('../helpers/auth.controller.test.helper');

test('login responde 403 cuando el usuario interno existe pero esta inactivo', async () => {
  process.env.JWT_SECRET = 'secreto-pruebas';
  let callCount = 0;
  const dbMock = {
    async query(sql, params) {
      callCount += 1;
      assert.deepEqual(params, ['usuario@mail.com']);
      if (callCount === 1) {
        assert.match(sql, /FROM cliente/);
        return [[]];
      }
      assert.match(sql, /FROM usuario/);
      return [[{
        id: 3,
        nombre: 'Operador',
        email: 'usuario@mail.com',
        password_hash: 'hash',
        rol: 'ADMIN',
        activo: 0,
      }]];
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
  const req = { body: { email: 'usuario@mail.com', password: 'Clave123' } };
  const res = buildMockResponse();

  // Preparacion
  // Lógica
  await controller.login(req, res);
  // Verificacion
  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.body, {
    error: 'user_inactive',
    message: 'Usuario inactivo.',
  });
  assert.equal(loggerWarns[0].message, 'LOGIN_FALLIDO: Usuario inactivo');
});
