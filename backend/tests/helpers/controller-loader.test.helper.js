const path = require('path');

function createAsyncMock() {
  const queue = [];

  const mockFn = async (...args) => {
    mockFn.calls.push(args);
    const next = queue.shift();

    if (!next) {
      throw new Error('Mock no configurado para esta llamada');
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

  return mockFn;
}

function createRes() {
  return {
    statusCode: 200,
    body: undefined,
    headers: {},
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    send(payload) {
      this.body = payload;
      return this;
    },
    setHeader(name, value) {
      this.headers[name] = value;
      return this;
    },
  };
}

function loadController(controllerFileName, dbMock) {
  const controllerPath = path.resolve(__dirname, `../../src/controllers/${controllerFileName}`);
  const dbPath = path.resolve(__dirname, '../../src/config/db.js');

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
  createAsyncMock,
  createRes,
  loadController,
};
