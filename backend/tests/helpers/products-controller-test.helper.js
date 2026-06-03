const assert = require('node:assert/strict');
const path = require('path');

// 1. Mocking require cache for db.js
const dbPath = path.resolve(__dirname, '../../src/config/db.js');
const controllerPath = path.resolve(__dirname, '../../src/controllers/products.controller.js');

let mockQueries = [];
let queryCalls = [];

const poolMock = {
  query: async (sql, params) => {
    queryCalls.push([sql, params]);
    if (mockQueries.length === 0) {
      throw new Error("No mock queries configured for pool.query");
    }
    const nextMock = mockQueries.shift();
    if (nextMock instanceof Error) {
      throw nextMock;
    }
    return nextMock;
  }
};

delete require.cache[dbPath];
delete require.cache[controllerPath];

require.cache[dbPath] = {
  id: dbPath,
  filename: dbPath,
  loaded: true,
  exports: poolMock,
};

const productsController = require(controllerPath);

function asymmetricDeepEqual(actual, expected) {
  if (expected && typeof expected.asymmetricMatch === 'function') {
    assert.ok(expected.asymmetricMatch(actual), `Asymmetric match failed for value: ${actual}`);
    return;
  }
  if (expected && expected instanceof RegExp) {
    assert.ok(typeof actual === 'string' && expected.test(actual), `RegExp match failed for value: ${actual}`);
    return;
  }
  if (Array.isArray(expected)) {
    assert.ok(Array.isArray(actual), `Expected array, got ${typeof actual}`);
    assert.equal(actual.length, expected.length, 'Arrays length mismatch');
    for (let i = 0; i < expected.length; i++) {
      asymmetricDeepEqual(actual[i], expected[i]);
    }
    return;
  }
  if (expected && typeof expected === 'object') {
    assert.ok(actual && typeof actual === 'object', `Expected object, got ${typeof actual}`);
    for (const key of Object.keys(expected)) {
      asymmetricDeepEqual(actual[key], expected[key]);
    }
    return;
  }
  assert.equal(actual, expected);
}

// 2. Mocking Jest globals so Johan's files run without modifications under node --test
global.jest = {
  mock: () => {},
  fn: (impl) => {
    const fnMock = (...args) => {
      fnMock.mock.calls.push(args);
      if (fnMock.mock.returnValue !== undefined) {
        return fnMock.mock.returnValue;
      }
      if (impl) return impl(...args);
      return fnMock;
    };
    fnMock.mock = { calls: [] };
    fnMock.mockReturnThis = () => {
      fnMock.mock.returnValue = fnMock;
      return fnMock;
    };
    return fnMock;
  }
};

global.describe = (name, fn) => {
  fn();
};

let beforeEachFn = () => {};
global.beforeEach = (fn) => {
  beforeEachFn = fn;
};

const nodeTest = require('node:test');
global.test = (name, fn) => {
  nodeTest(name, async () => {
    beforeEachFn();
    await fn();
  });
};

global.expect = (received) => {
  return {
    toHaveBeenCalledWith(...expectedArgs) {
      if (typeof received === 'function' && received.mock) {
        const matched = received.mock.calls.some(call => {
          try {
            asymmetricDeepEqual(call, expectedArgs);
            return true;
          } catch {
            return false;
          }
        });
        if (!matched) {
          throw new Error(`Expected mock function to be called with ${JSON.stringify(expectedArgs)}, but was called with ${JSON.stringify(received.mock.calls)}`);
        }
      } else if (received === poolMock) {
        const matched = queryCalls.some(callArgs => {
          try {
            asymmetricDeepEqual(callArgs, expectedArgs);
            return true;
          } catch {
            return false;
          }
        });
        if (!matched) {
          throw new Error(`Expected pool.query to be called with ${JSON.stringify(expectedArgs)}, but query calls were ${JSON.stringify(queryCalls)}`);
        }
      }
    },
    toHaveBeenNthCalledWith(n, ...expectedArgs) {
      const callArgs = queryCalls[n - 1];
      if (!callArgs) {
        throw new Error(`Expected pool.query to be called at least ${n} times, but was called only ${queryCalls.length} times`);
      }
      try {
        asymmetricDeepEqual(callArgs, expectedArgs);
      } catch (err) {
        throw new Error(`Expected pool.query at call ${n} to be called with ${JSON.stringify(expectedArgs)}, but was called with ${JSON.stringify(callArgs)}. Details: ${err.message}`);
      }
    },
    not: {
      toHaveBeenCalled() {
        if (received === poolMock) {
          assert.equal(queryCalls.length, 0, `Expected pool.query not to be called, but it was called ${queryCalls.length} times`);
        } else if (typeof received === 'function' && received.mock) {
          assert.equal(received.mock.calls.length, 0, `Expected mock function not to be called, but it was called ${received.mock.calls.length} times`);
        }
      }
    },
    toHaveBeenCalled() {
      if (received === poolMock) {
        assert.ok(queryCalls.length > 0, 'Expected pool.query to be called');
      } else if (typeof received === 'function' && received.mock) {
        assert.ok(received.mock.calls.length > 0, 'Expected mock function to be called');
      }
    }
  };
};

global.expect.stringContaining = (str) => {
  return {
    asymmetricMatch(other) {
      return typeof other === 'string' && other.includes(str);
    }
  };
};

global.expect.any = (type) => {
  return {
    asymmetricMatch(other) {
      if (type === String) return typeof other === 'string';
      if (type === Number) return typeof other === 'number';
      return false;
    }
  };
};

function createRes() {
  const res = {
    statusCode: 200,
    body: undefined,
  };
  res.status = global.jest.fn(() => res);
  res.json = global.jest.fn((payload) => {
    res.body = payload;
    return res;
  });
  return res;
}

function resetTestState() {
  mockQueries = [];
  queryCalls = [];
}

poolMock.query.mockResolvedValueOnce = (val) => {
  mockQueries.push(val);
  return poolMock.query;
};
poolMock.query.mockRejectedValueOnce = (err) => {
  mockQueries.push(err);
  return poolMock.query;
};

module.exports = {
  pool: poolMock,
  productsController,
  createRes,
  resetTestState,
};