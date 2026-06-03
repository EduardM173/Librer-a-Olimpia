const test = require('node:test');
const assert = require('node:assert/strict');
const { buildMockResponse, loadAuthController } = require('../helpers/auth.controller.test.helper');

test('registerCliente crea el cliente con datos normalizados y responde 201 con token', async () => {
  process.env.JWT_SECRET = 'secreto-pruebas';
  const queries = [];
  const dbMock = {
    async query(sql, params) {
      queries.push({ sql, params });
      if (/SELECT id FROM cliente WHERE email=\?/.test(sql)) {
        return [[]];
      }
      if (/INSERT INTO cliente/.test(sql)) {
        return [{ insertId: 17 }];
      }
      throw new Error('Consulta no esperada');
    },
  };
  const bcryptCalls = [];
  const bcryptMock = {
    async hash(password, rounds) {
      bcryptCalls.push({ password, rounds });
      return 'hash-seguro';
    },
    async compare() {
      throw new Error('compare no debe usarse en este caso');
    },
  };
  const jwtCalls = [];
  const jwtMock = {
    sign(payload, secret, options) {
      jwtCalls.push({ payload, secret, options });
      return 'jwt-generado';
    },
  };
  const loggerCalls = [];
  const loggerMock = {
    info(message, meta) {
      loggerCalls.push({ message, meta });
    },
    warn() {},
    error() {},
  };
  const controller = loadAuthController({ dbMock, bcryptMock, jwtMock, loggerMock });
  const req = { body: { nombre: '  Alicia Perez  ', email: ' Alicia@Mail.com ', password: 'Clave123' } };
  const res = buildMockResponse();

  // Preparacion
  // Lógica
  await controller.registerCliente(req, res);
  // Verificacion
  assert.equal(res.statusCode, 201);
  assert.equal(res.body.token, 'jwt-generado');
  assert.deepEqual(res.body.user, {
    id: 17,
    nombre: 'Alicia Perez',
    email: 'alicia@mail.com',
    tipo: 'CLIENTE',
  });
  assert.equal(bcryptCalls.length, 1);
  assert.deepEqual(bcryptCalls[0], { password: 'Clave123', rounds: 12 });
  assert.deepEqual(queries[0].params, ['alicia@mail.com']);
  assert.deepEqual(queries[1].params, ['Alicia Perez', 'alicia@mail.com', 'hash-seguro']);
  assert.deepEqual(jwtCalls[0], {
    payload: {
      sub: 17,
      kind: 'cliente',
      rol: 'cliente',
      email: 'alicia@mail.com',
    },
    secret: 'secreto-pruebas',
    options: { expiresIn: '8h' },
  });
  assert.equal(loggerCalls.length, 1);
  assert.equal(loggerCalls[0].message, 'REGISTRO_EXITOSO: Nuevo cliente registrado');
});
