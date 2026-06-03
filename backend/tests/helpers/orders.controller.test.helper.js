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

function loadOrdersController(overrides = {}) {
  const controllerPath = path.resolve(__dirname, '../../src/controllers/orders.controller.js');
  const dbPath = path.resolve(__dirname, '../../src/config/db.js');

  const dbMock = overrides.dbMock || {
    query: async () => { throw new Error('Mock no configurado para pool.query'); },
  };

  delete require.cache[controllerPath];
  delete require.cache[dbPath];

  require.cache[dbPath] = {
    id: dbPath,
    filename: dbPath,
    loaded: true,
    exports: dbMock,
  };

  return require(controllerPath);
}

function loadClientesController(overrides = {}) {
  const controllerPath = path.resolve(__dirname, '../../src/controllers/clientes.controller.js');
  const dbPath = path.resolve(__dirname, '../../src/config/db.js');

  const dbMock = overrides.dbMock || {
    query: async () => { throw new Error('Mock no configurado para pool.query'); },
  };

  delete require.cache[controllerPath];
  delete require.cache[dbPath];

  require.cache[dbPath] = {
    id: dbPath,
    filename: dbPath,
    loaded: true,
    exports: dbMock,
  };

  return require(controllerPath);
}

module.exports = {
  buildMockResponse,
  loadOrdersController,
  loadClientesController,
};
