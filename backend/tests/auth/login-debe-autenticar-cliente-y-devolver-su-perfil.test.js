const test = require('node:test');
const assert = require('node:assert/strict');
const { buildMockResponse, loadAuthController } = require('../helpers/auth.controller.test.helper');

test('login autentica un cliente y devuelve token con su perfil', async () => {
  process.env.JWT_SECRET = 'secreto-pruebas';
  const dbMock = {
    async query(sql, params) {
      assert.match(sql, /FROM cliente/);
      assert.deepEqual(params, ['cliente@mail.com']);
      return [[{
        id: 8,
        nombre: 'Cliente Demo',
        email: 'cliente@mail.com',
        password_hash: 'hash-guardado',
        nit_ci: '123456',
        zona: 'Centro',
        calle: 'Sucre',
        numero_casa: '10',
      }]];
    },
  };
  const bcryptMock = {
    async hash() {
      throw new Error('hash no debe usarse en login');
    },
    async compare(password, hash) {
      assert.equal(password, 'Clave123');
      assert.equal(hash, 'hash-guardado');
      return true;
    },
  };
  const jwtCalls = [];
  const jwtMock = {
    sign(payload, secret, options) {
      jwtCalls.push({ payload, secret, options });
      return 'token-cliente';
    },
  };
  const loggerInfos = [];
  const loggerMock = {
    info(message, meta) {
      loggerInfos.push({ message, meta });
    },
    warn() {},
    error() {},
  };
  const controller = loadAuthController({ dbMock, bcryptMock, jwtMock, loggerMock });
  const req = { body: { email: 'cliente@mail.com', password: 'Clave123' } };
  const res = buildMockResponse();

  // Preparacion
  // Lógica
  await controller.login(req, res);
  // Verificacion
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.token, 'token-cliente');
  assert.deepEqual(res.body.user, {
    id: 8,
    nombre: 'Cliente Demo',
    email: 'cliente@mail.com',
    tipo: 'CLIENTE',
    nit_ci: '123456',
    zona: 'Centro',
    calle: 'Sucre',
    numero_casa: '10',
  });
  assert.deepEqual(jwtCalls[0], {
    payload: { sub: 8, kind: 'cliente' },
    secret: 'secreto-pruebas',
    options: { expiresIn: '7d' },
  });
  assert.equal(loggerInfos[0].message, 'LOGIN_EXITOSO: Cliente autenticado');
});
