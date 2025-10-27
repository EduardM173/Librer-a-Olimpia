    // backend/scripts/seed.js



const db = require('../src/config/db'); // Importa tu pool de conexión


const bcrypt = require('bcryptjs'); // Importa bcrypt para hashear





const seedDatabase = async () => {


  try {


    console.log('Conectando a la BD...');


    const connection = await db.getConnection();


    console.log('¡Conexión exitosa!');





    // Desactivar FK checks para poder truncar en orden


    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');


    await connection.query('TRUNCATE TABLE producto;');


    await connection.query('TRUNCATE TABLE categoria;');


    await connection.query('TRUNCATE TABLE cliente;');


    await connection.query('TRUNCATE TABLE usuario;');


    await connection.query('TRUNCATE TABLE inventario_actual;');


    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');


    console.log('Tablas limpiadas.');





    // --- 1. Hashear Contraseñas ---


    const salt = await bcrypt.genSalt(10);


    const adminPassword = await bcrypt.hash('admin123', salt);


    const clientePassword = await bcrypt.hash('cliente123', salt);


    console.log('Contraseñas hasheadas.');





    // --- 2. Crear Usuarios (HU-01) ---


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





    // --- 3. Crear Categorías (HU-02) ---


    await connection.query(


      `INSERT INTO categoria (nombre) VALUES ('Libros'),('Papelería'),('Material Escolar'), ('Oficina'), ('Arte')`


    );


    console.log('Categorías creadas.');





    // --- 4. Crear Productos (HU-02) ---


    // Asumimos que las categorías tienen IDs 1, 2, 3, 4, 5


    await connection.query(


      `INSERT INTO producto (sku, nombre, precio_venta, stock_minimo, categoria_id, imagen_url) VALUES


        ('LIB-001', 'Animalitos de la Granja', 120.00, 5, 1, '/IMG/productos/animalitos.jpg'), 


        ('LIB-002', 'Sherlocks', 100.00, 5, 1, '/IMG/productos/sherlocks.jpg'),


        ('PAP-001', 'Cuaderno Anillado Tapa Dura (Mármol)', 35.50, 10, 2, '/IMG/productos/cuaderno_marmol.jpg'),


        ('PAP-002', 'Agenda', 30, 10, 2, '/IMG/productos/agenda.jpg'),


        ('ESC-001', 'Caja de 12 Colores Kores', 20.00, 15, 3, '/IMG/productos/kromas.jpg'),


        ('ESC-002', 'Caja de 12 Colores Pelikan pastel', 50.00, 15, 3, '/IMG/productos/pelikanpastel.jpg'),


        ('OFI-001', 'Paquete 200 Hojas Papel Carpeta', 50.00, 20, 4, '/IMG/productos/papel_carpeta.jpg'),


        ('OFI-002', 'Paquete 100 Hojas Papel Trapper Punteadas', 100.00, 20, 4, '/IMG/productos/papel_trapper_punteadas.jpg'),


        ('ART-001', 'Pincel agua', 50.00, 5, 5, '/IMG/productos/pincel_agua.jpg'),


        ('ART-002', 'Set de aquarela con lienzo Canva', 150.00, 5, 5, '/IMG/productos/set_arte_water.jpg')


        `


    );


    await connection.query(


      `INSERT INTO inventario_actual (sucursal_id, producto_id, cantidad_actual) VALUES


        (1, 1, 50), (1, 2, 50), (1, 3, 50), (1, 4, 50), (1, 5, 50),


        (1, 6, 50), (1, 7, 50), (1, 8, 50), (1, 9, 50), (1, 10, 50)`


    );


    console.log('Productos creados.');





    console.log('¡SCRIPT DE SEED COMPLETADO!');





    // Liberar la conexión


    connection.release();





  } catch (error) {


    console.error('Error durante el script de seed:', error);


  } finally {


    // Cerrar el pool de conexiones


    await db.end();


  }


};





// Ejecutar el script


seedDatabase();