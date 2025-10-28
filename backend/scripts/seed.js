/**
 * Script de Seed - Librería Olimpia
 * Crea datos base en entorno de desarrollo
 */

const db = require('../src/config/db');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    console.log('🚀 Conectando a la base de datos...');
    const connection = await db.getConnection();
    console.log('✅ ¡Conexión exitosa!\n');

    // ===================================================
    // 🔹 LIMPIEZA DE TABLAS (sin eliminar sucursales)
    // ===================================================
    console.log('🧹 Limpiando tablas dependientes...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
    await connection.query('TRUNCATE TABLE inventario_actual;');
    await connection.query('TRUNCATE TABLE producto;');
    await connection.query('TRUNCATE TABLE categoria;');
    await connection.query('TRUNCATE TABLE cliente;');
    await connection.query('TRUNCATE TABLE usuario;');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log('✅ Tablas limpiadas correctamente.\n');

    // ===================================================
    // 🔹 CREAR SUCURSAL BASE SI NO EXISTE
    // ===================================================
    console.log('🏢 Verificando sucursal base...');
    const [sucursal] = await connection.query('SELECT id FROM sucursal WHERE id = 1');
    if (sucursal.length === 0) {
      await connection.query(`
        INSERT INTO sucursal (id, nombre, ciudad, direccion)
        VALUES (1, 'Sucursal Central', 'La Paz', 'Av. Camacho #123')
      `);
      console.log('✅ Sucursal creada: "Sucursal Central" (id=1)\n');
    } else {
      console.log('ℹ️ Sucursal base ya existente (id=1)\n');
    }

    // ===================================================
    // 🔹 USUARIOS Y CLIENTES BASE
    // ===================================================
    console.log('👤 Creando usuarios base...');
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const clientePassword = await bcrypt.hash('cliente123', salt);

    await connection.query(`
      INSERT INTO usuario (nombre, email, username, password_hash, rol)
      VALUES ('Admin', 'admin@olimpia.com', 'admin', ?, 'ADMIN')
    `, [adminPassword]);

    await connection.query(`
      INSERT INTO cliente (nombre, email, password_hash)
      VALUES ('Cliente', 'cliente@olimpia.com', ?)
    `, [clientePassword]);
    console.log('✅ Usuarios y clientes creados.\n');

    // ===================================================
    // 🔹 CATEGORÍAS BASE
    // ===================================================
    console.log('📚 Insertando categorías...');
    await connection.query(`
      INSERT INTO categoria (nombre) VALUES 
      ('Libros'), ('Papelería'), ('Material Escolar'), ('Oficina'), ('Arte')
    `);
    console.log('✅ Categorías creadas.\n');

    // ===================================================
    // 🔹 PRODUCTOS BASE
    // ===================================================
    console.log('📦 Insertando productos...');
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
    console.log('✅ Productos creados.\n');

    // ===================================================
    // 🔹 INVENTARIO BASE
    // ===================================================
    console.log('📦 Insertando inventario inicial...');
    await connection.query(`
      INSERT INTO inventario_actual (sucursal_id, producto_id, cantidad_actual) VALUES
      (1, 1, 50), (1, 2, 50), (1, 3, 50), (1, 4, 50), (1, 5, 50),
      (1, 6, 50), (1, 7, 50), (1, 8, 50), (1, 9, 50), (1, 10, 50)
    `);
    console.log('✅ Inventario inicial creado.\n');

    // ===================================================
    // 🔹 FINALIZACIÓN
    // ===================================================
    console.log('🎉 SEED COMPLETADO CON ÉXITO ✅');
    connection.release();
  } catch (error) {
    console.error('❌ Error durante el script de seed:\n', error.message);
  } finally {
    await db.end();
  }
};

seedDatabase();
