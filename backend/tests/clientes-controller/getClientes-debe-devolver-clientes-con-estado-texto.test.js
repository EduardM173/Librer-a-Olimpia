const test = require('node:test');
const assert = require('node:assert/strict');
const {
  pool,
  clientesController,
  createRes,
  resetTestState,
} = require('../helpers/clientes-controller-test.helper');

test('getClientes devuelve clientes con estado_texto', async () => {
  resetTestState();

  // Preparacion de la prueba
  const req = {};
  const res = createRes();
  pool.query.mockResolvedValueOnce([[
    {
      id: 1,
      nombre: 'Cliente Activo',
      email: 'activo@olimpia.com',
      tipo_cliente: 'MINORISTA',
      estado: 1,
      fecha_registro: '2026-06-01',
    },
    {
      id: 2,
      nombre: 'Cliente Inactivo',
      email: 'inactivo@olimpia.com',
      tipo_cliente: 'MAYORISTA',
      estado: 0,
      fecha_registro: '2026-06-02',
    },
  ]]);

  // Logica de la prueba
  await clientesController.getClientes(req, res);

  // Verificacion del resultado esperado o Assert
  assert.deepEqual(res.body, [
    {
      id: 1,
      nombre: 'Cliente Activo',
      email: 'activo@olimpia.com',
      tipo_cliente: 'MINORISTA',
      estado: 1,
      fecha_registro: '2026-06-01',
      estado_texto: 'ACTIVO',
    },
    {
      id: 2,
      nombre: 'Cliente Inactivo',
      email: 'inactivo@olimpia.com',
      tipo_cliente: 'MAYORISTA',
      estado: 0,
      fecha_registro: '2026-06-02',
      estado_texto: 'INACTIVO',
    },
  ]);
  assert.equal(res.statusCode, 200);
});
