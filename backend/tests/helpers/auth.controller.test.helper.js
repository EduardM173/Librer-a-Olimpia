const path = require('path');

function buildMockResponse() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

function defaultAsyncMock(name) {
  return async () => {
    throw new Error(`Mock no configurado para ${name}`);
  };
}

function loadAuthController(overrides = {}) {
  const controllerPath = path.resolve(__dirname, '../../src/controllers/auth.controller.js');
  const dbPath = path.resolve(__dirname, '../../src/config/db.js');
  const loggerPath = path.resolve(__dirname, '../../src/config/logger.js');
  const bcryptPath = require.resolve('bcryptjs');
  const jwtPath = require.resolve('jsonwebtoken');

  const dbMock = overrides.dbMock || { query: defaultAsyncMock('pool.query') };
  const bcryptMock = overrides.bcryptMock || {
    hash: defaultAsyncMock('bcrypt.hash'),
    compare: defaultAsyncMock('bcrypt.compare'),
  };
  const jwtMock = overrides.jwtMock || {
    sign() {
      return 'token-mock';
    },
  };
  const loggerMock = overrides.loggerMock || {
    info() {},
    warn() {},
    error() {},
  };

  delete require.cache[controllerPath];
  delete require.cache[dbPath];
  delete require.cache[loggerPath];
  delete require.cache[bcryptPath];
  delete require.cache[jwtPath];

  require.cache[dbPath] = {
    id: dbPath,
    filename: dbPath,
    loaded: true,
    exports: dbMock,
  };
  require.cache[loggerPath] = {
    id: loggerPath,
    filename: loggerPath,
    loaded: true,
    exports: loggerMock,
  };
  require.cache[bcryptPath] = {
    id: bcryptPath,
    filename: bcryptPath,
    loaded: true,
    exports: bcryptMock,
  };
  require.cache[jwtPath] = {
    id: jwtPath,
    filename: jwtPath,
    loaded: true,
    exports: jwtMock,
  };

  return require(controllerPath);
}

module.exports = {
  buildMockResponse,
  loadAuthController,
};
