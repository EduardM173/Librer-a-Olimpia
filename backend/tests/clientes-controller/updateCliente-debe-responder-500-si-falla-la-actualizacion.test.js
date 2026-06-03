const test = require('node:test');
const assert = require('node:assert/strict');
const {
  pool,
  clientesController,
  createRes,
  resetTestState,
} = require('../helpers/clientes-controller-test.helper');

test('updateCliente responde 500 si falla la actualizacion', async () => {
  resetTestState();

  // Preparacion de la prueba
  const req = {
    params: { id: '9' },
    body: { tipo_cliente: 'MAYORISTA', estado: true },
  };
  const res = createRes();
  pool.query.mockRejectedValueOnce(new Error('fallo update cliente'));

  // Logica de la prueba
  await clientesController.updateCliente(req, res);

  // Verificacion del resultado esperado o Assert
  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, { message: 'Error al actualizar cliente' });
});
