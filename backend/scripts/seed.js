const db = require('../src/config/db');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    console.log('Conectando a la BD...');
    const connection = await db.getConnection();
    console.log('¡Conexión exitosa!');

    // 🔹 Desactivar FK checks para limpiar
    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
    await connection.query('TRUNCATE TABLE producto;');
    await connection.query('TRUNCATE TABLE categoria;');
    await connection.query('TRUNCATE TABLE cliente;');
    await connection.query('TRUNCATE TABLE usuario;');
    await connection.query('TRUNCATE TABLE inventario_actual;');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log('Tablas limpiadas.');

    // 🔹 Hashear contraseñas
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const clientePassword = await bcrypt.hash('cliente123', salt);

    // 🔹 Crear usuario admin y cliente base
    await connection.query(
      `INSERT INTO usuario (nombre, email, username, password_hash, rol) VALUES
       ('Admin', 'admin@olimpia.com', 'admin', ?, 'ADMIN')`,
      [adminPassword]
    );
    await connection.query(
      `INSERT INTO cliente (nombre, email, password_hash) VALUES
       ('Cliente', 'cliente@olimpia.com', ?)`,
      [clientePassword]
    );
    console.log('Usuarios y clientes creados.');

    // 🔹 Categorías base
    await connection.query(
      `INSERT INTO categoria (nombre) VALUES 
      ('Libros'), ('Papelería'), ('Material Escolar'), ('Oficina'), ('Arte')`
    );
    console.log('Categorías creadas.');

    // 🔹 Productos con descripción detallada
    await connection.query(`
      INSERT INTO producto (sku, nombre, descripcion, precio_venta, stock_minimo, categoria_id, imagen_url) VALUES
      ('LIB-001', 'Animalitos de la Granja', 'Libro infantil educativo con ilustraciones coloridas que enseñan sobre animales de granja.', 120.00, 5, 1, '/IMG/productos/animalitos.jpg'),
      ('LIB-002', 'Sherlocks', 'Colección de cuentos detectivescos ideales para fomentar la lectura y la lógica en jóvenes.', 100.00, 5, 1, '/IMG/productos/sherlocks.jpg'),
      ('PAP-001', 'Cuaderno Anillado Tapa Dura (Mármol)', 'Cuaderno resistente con tapa dura, ideal para clases, apuntes o notas de trabajo.', 35.50, 10, 2, '/IMG/productos/cuaderno_marmol.jpg'),
      ('PAP-002', 'Agenda', 'Agenda de uso diario con secciones para notas, calendario y tareas importantes.', 30.00, 10, 2, '/IMG/productos/agenda.jpg'),
      ('ESC-001', 'Caja de 12 Colores Kores', 'Set de lápices de colores intensos, ideales para niños y artistas principiantes.', 20.00, 15, 3, '/IMG/productos/kromas.jpg'),
      ('ESC-002', 'Caja de 12 Colores Pelikan pastel', 'Lápices de tonos suaves y textura cremosa para colorear o realizar bocetos artísticos.', 50.00, 15, 3, '/IMG/productos/pelikanpastel.jpg'),
      ('OFI-001', 'Paquete 200 Hojas Papel Carpeta', 'Papel tamaño carta de alta calidad para impresiones y documentos de oficina.', 50.00, 20, 4, '/IMG/productos/papel_carpeta.jpg'),
      ('OFI-002', 'Paquete 100 Hojas Papel Trapper Punteadas', 'Hojas punteadas premium compatibles con archivadores tipo Trapper.', 100.00, 20, 4, '/IMG/productos/papel_trapper_punteadas.jpg'),
      ('ART-001', 'Pincel agua', 'Pincel recargable con depósito de agua para técnicas de acuarela y difuminado.', 50.00, 5, 5, '/IMG/productos/pincel_agua.jpg'),
      ('ART-002', 'Set de aquarela con lienzo Canva', 'Kit completo con acuarelas, pinceles y lienzo, perfecto para artistas principiantes.', 150.00, 5, 5, '/IMG/productos/set_arte_water.jpg');
    `);
    console.log('Productos creados.');

    // 🔹 Inventario base
    await connection.query(`
      INSERT INTO inventario_actual (sucursal_id, producto_id, cantidad_actual) VALUES
      (1, 1, 50), (1, 2, 50), (1, 3, 50), (1, 4, 50), (1, 5, 50),
      (1, 6, 50), (1, 7, 50), (1, 8, 50), (1, 9, 50), (1, 10, 50)
    `);

    console.log('Inventario inicial creado.');
    console.log('✅ ¡SEED COMPLETADO CON ÉXITO!');

    connection.release();
  } catch (error) {
    console.error('❌ Error durante el script de seed:', error);
  } finally {
    await db.end();
  }
};

seedDatabase();
