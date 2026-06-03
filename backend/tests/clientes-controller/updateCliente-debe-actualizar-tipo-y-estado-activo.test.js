const test = require('node:test');
const assert = require('node:assert/strict');
const {
  pool,
  clientesController,
  createRes,
  resetTestState,
} = require('../helpers/clientes-controller-test.helper');

test('updateCliente actualiza tipo y convierte estado true a 1', async () => {
  resetTestState();

  // Preparacion de la prueba
  const req = {
    params: { id: '7' },
    body: { tipo_cliente: 'MAYORISTA', estado: true },
  };
  const res = createRes();
  pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

  // Logica de la prueba
  await clientesController.updateCliente(req, res);

  // Verificacion del resultado esperado o Assert
  assert.equal(pool.query.calls.length, 1);
  assert.match(pool.query.calls[0][0], /UPDATE cliente SET tipo_cliente = \?, estado = \? WHERE id = \?/);
  assert.deepEqual(pool.query.calls[0][1], ['MAYORISTA', 1, '7']);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { message: 'Cliente actualizado correctamente' });
});
