const test = require('node:test');
const assert = require('node:assert/strict');
const {
  pool,
  clientesController,
  createRes,
  resetTestState,
} = require('../helpers/clientes-controller-test.helper');

test('patchClienteMe actualiza solo campos permitidos y trimeados', async () => {
  resetTestState();

  // Preparacion de la prueba
  const clienteActualizado = {
    id: 9,
    nombre: 'Cliente Perfil',
    email: 'perfil@olimpia.com',
    nit_ci: '123456',
    zona: 'Centro',
    calle: 'Av. Uno',
    numero_casa: '45',
  };
  const req = {
    user: { kind: 'cliente', sub: 9 },
    body: {
      nit_ci: ' 123456 ',
      zona: ' Centro ',
      calle: ' Av. Uno ',
      numero_casa: ' 45 ',
      nombre: 'No debe actualizarse',
      email: 'no-debe@olimpia.com',
    },
  };
  const res = createRes();
  pool.query
    .mockResolvedValueOnce([{ affectedRows: 1 }])
    .mockResolvedValueOnce([[clienteActualizado]]);

  // Logica de la prueba
  await clientesController.patchClienteMe(req, res);

  // Verificacion del resultado esperado o Assert
  assert.equal(pool.query.calls.length, 2);
  assert.equal(
    pool.query.calls[0][0],
    'UPDATE cliente SET nit_ci = ?, zona = ?, calle = ?, numero_casa = ? WHERE id = ?'
  );
  assert.deepEqual(pool.query.calls[0][1], ['123456', 'Centro', 'Av. Uno', '45', 9]);
  assert.doesNotMatch(pool.query.calls[0][0], /nombre|email/);
  assert.deepEqual(pool.query.calls[1][1], [9]);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { ok: true, cliente: clienteActualizado });
});
