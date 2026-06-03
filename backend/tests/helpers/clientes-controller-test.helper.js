const path = require('path');

function createAsyncMock() {
  const queue = [];

  const mockFn = async (...args) => {
    mockFn.calls.push(args);
    const next = queue.shift();

    if (!next) {
      throw new Error('Mock de query no configurado para esta llamada');
    }

    if (next.type === 'reject') {
      throw next.value;
    }

    return next.value;
  };

  mockFn.calls = [];
  mockFn.mockResolvedValueOnce = (value) => {
    queue.push({ type: 'resolve', value });
    return mockFn;
  };
  mockFn.mockRejectedValueOnce = (value) => {
    queue.push({ type: 'reject', value });
    return mockFn;
  };
  mockFn.reset = () => {
    queue.length = 0;
    mockFn.calls.length = 0;
  };

  return mockFn;
}

const queryMock = createAsyncMock();
const poolMock = { query: queryMock };

const controllerPath = path.resolve(__dirname, '../../src/controllers/clientes.controller.js');
const dbPath = path.resolve(__dirname, '../../src/config/db.js');

delete require.cache[controllerPath];
delete require.cache[dbPath];
require.cache[dbPath] = {
  id: dbPath,
  filename: dbPath,
  loaded: true,
  exports: poolMock,
};

const clientesController = require(controllerPath);

function createRes() {
  return {
    statusCode: 200,
    body: undefined,
    statusCalls: [],
    jsonCalls: [],
    status(code) {
      this.statusCalls.push(code);
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.jsonCalls.push(payload);
      this.body = payload;
      return this;
    },
  };
}

function resetTestState() {
  queryMock.reset();
}

module.exports = {
  pool: poolMock,
  clientesController,
  createRes,
  resetTestState,
};
