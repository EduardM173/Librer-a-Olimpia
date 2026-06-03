const test = require('node:test');
const assert = require('node:assert/strict');
const {
  pool,
  clientesController,
  createRes,
  resetTestState,
} = require('../helpers/clientes-controller-test.helper');

test('getClienteMe devuelve datos del cliente autenticado', async () => {
  resetTestState();

  // Preparacion de la prueba
  const cliente = {
    id: 3,
    nombre: 'Cliente Olimpia',
    email: 'cliente@olimpia.com',
    nit_ci: '123456',
    zona: 'Centro',
    calle: 'Av. Principal',
    numero_casa: '45',
  };
  const req = { user: { kind: 'cliente', sub: 3 } };
  const res = createRes();
  pool.query.mockResolvedValueOnce([[cliente]]);

  // Logica de la prueba
  await clientesController.getClienteMe(req, res);

  // Verificacion del resultado esperado o Assert
  assert.equal(pool.query.calls.length, 1);
  assert.deepEqual(pool.query.calls[0][1], [3]);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, cliente);
});
