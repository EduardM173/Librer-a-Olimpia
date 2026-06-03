const test = require('node:test');
const assert = require('node:assert/strict');
const {
  pool,
  clientesController,
  createRes,
  resetTestState,
} = require('../helpers/clientes-controller-test.helper');

test('updateCliente convierte estado false a 0', async () => {
  resetTestState();

  // Preparacion de la prueba
  const req = {
    params: { id: '8' },
    body: { tipo_cliente: 'MINORISTA', estado: false },
  };
  const res = createRes();
  pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

  // Logica de la prueba
  await clientesController.updateCliente(req, res);

  // Verificacion del resultado esperado o Assert
  assert.equal(pool.query.calls.length, 1);
  assert.deepEqual(pool.query.calls[0][1], ['MINORISTA', 0, '8']);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { message: 'Cliente actualizado correctamente' });
});
