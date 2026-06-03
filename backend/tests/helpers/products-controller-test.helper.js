jest.mock('../../src/config/db', () => ({
  query: jest.fn(),
}));

const pool = require('../../src/config/db');
const productsController = require('../../src/controllers/products.controller');

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

function resetTestState() {
  jest.clearAllMocks();
}

module.exports = {
  pool,
  productsController,
  createRes,
  resetTestState,
};