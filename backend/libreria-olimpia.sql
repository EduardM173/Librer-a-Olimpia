-- =====================================================
-- BASE DE DATOS: Librería Olimpia v2.3
-- Incluye: imágenes, login y direcciones de envío
-- =====================================================

CREATE DATABASE IF NOT EXISTS libreria_olimpia
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE libreria_olimpia;

-- =====================================================
-- MAESTROS BÁSICOS
-- =====================================================

CREATE TABLE IF NOT EXISTS sucursal (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  ciudad VARCHAR(80) NOT NULL,
  direccion VARCHAR(200) NOT NULL,
  activo TINYINT(1) DEFAULT 1,
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================
-- USUARIOS (con correo y dirección)
-- =====================================================

CREATE TABLE IF NOT EXISTS usuario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol VARCHAR(40) NOT NULL CHECK (UPPER(rol) IN ('ADMIN', 'VENDEDOR', 'ALMACEN')),
  zona VARCHAR(120),
  calle VARCHAR(120),
  numero_casa VARCHAR(30),
  activo TINYINT(1) DEFAULT 1,
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================
-- CLIENTES (con login y dirección de envío)
-- =====================================================

CREATE TABLE IF NOT EXISTS cliente (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(160) NOT NULL,
  email VARCHAR(120) UNIQUE,
  password_hash VARCHAR(255),
  tipo_cliente VARCHAR(40) CHECK (tipo_cliente IN ('MINORISTA', 'MAYORISTA')),
  nit_ci VARCHAR(30),
  zona VARCHAR(120),
  calle VARCHAR(120),
  numero_casa VARCHAR(30),
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================
-- PROVEEDORES
-- =====================================================

CREATE TABLE IF NOT EXISTS proveedor (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(160) NOT NULL,
  contacto VARCHAR(120),
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================
-- CATEGORÍAS
-- =====================================================

CREATE TABLE IF NOT EXISTS categoria (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  categoria_padre_id INT,
  FOREIGN KEY (categoria_padre_id) REFERENCES categoria(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================
-- PRODUCTOS (con imagen)
-- =====================================================

CREATE TABLE IF NOT EXISTS producto (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(60) UNIQUE,
  nombre VARCHAR(200) NOT NULL,
  categoria_id INT,
  precio_venta DECIMAL(14,2) DEFAULT 0,
  stock_minimo INT DEFAULT 0,
  imagen_url VARCHAR(255) NULL COMMENT 'Ruta o URL de la imagen del producto',
  activo TINYINT(1) DEFAULT 1,
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id) REFERENCES categoria(id) ON DELETE SET NULL,
  CONSTRAINT chk_precio CHECK (precio_venta >= 0)
) ENGINE=InnoDB;

-- =====================================================
-- PEDIDOS
-- =====================================================

CREATE TABLE IF NOT EXISTS pedido (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sucursal_id INT NOT NULL,
  cliente_id INT NOT NULL,
  usuario_id INT NOT NULL,
  estado VARCHAR(20) DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'ENTREGADO', 'CANCELADO')),
  fecha_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
  total_neto DECIMAL(14,2) NOT NULL CHECK (total_neto >= 0),
  direccion_envio VARCHAR(255) COMMENT 'Dirección de envío completa',
  FOREIGN KEY (sucursal_id) REFERENCES sucursal(id),
  FOREIGN KEY (cliente_id) REFERENCES cliente(id),
  FOREIGN KEY (usuario_id) REFERENCES usuario(id)
) ENGINE=InnoDB;

CREATE INDEX idx_pedido_cliente ON pedido(cliente_id);

CREATE TABLE IF NOT EXISTS pedido_detalle (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad DECIMAL(12,2) NOT NULL CHECK (cantidad > 0),
  precio_unitario DECIMAL(14,2) NOT NULL,
  importe_neto DECIMAL(14,2) NOT NULL,
  FOREIGN KEY (pedido_id) REFERENCES pedido(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES producto(id),
  INDEX (pedido_id)
) ENGINE=InnoDB;

-- =====================================================
-- VENTAS
-- =====================================================

CREATE TABLE IF NOT EXISTS venta (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sucursal_id INT NOT NULL,
  cliente_id INT,
  usuario_id INT NOT NULL,
  pedido_id INT,
  estado VARCHAR(20) DEFAULT 'PAGADA' CHECK (estado IN ('PAGADA', 'ANULADA')),
  operado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total_neto DECIMAL(14,2) NOT NULL CHECK (total_neto >= 0),
  FOREIGN KEY (sucursal_id) REFERENCES sucursal(id),
  FOREIGN KEY (cliente_id) REFERENCES cliente(id) ON DELETE SET NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuario(id),
  FOREIGN KEY (pedido_id) REFERENCES pedido(id) ON DELETE SET NULL,
  INDEX (operado_en)
) ENGINE=InnoDB;

CREATE INDEX idx_venta_cliente ON venta(cliente_id);

CREATE TABLE IF NOT EXISTS venta_detalle (
  id INT AUTO_INCREMENT PRIMARY KEY,
  venta_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad DECIMAL(12,2) NOT NULL CHECK (cantidad > 0),
  precio_unitario DECIMAL(14,2) NOT NULL,
  costo_unitario DECIMAL(14,4) NOT NULL,
  importe_neto DECIMAL(14,2) NOT NULL,
  FOREIGN KEY (venta_id) REFERENCES venta(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES producto(id),
  INDEX (venta_id),
  INDEX (producto_id)
) ENGINE=InnoDB;

-- =====================================================
-- INVENTARIO SIMPLIFICADO
-- =====================================================

CREATE TABLE IF NOT EXISTS inventario_actual (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sucursal_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad_actual DECIMAL(12,2) DEFAULT 0 CHECK (cantidad_actual >= 0),
  costo_promedio DECIMAL(14,4),
  actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (sucursal_id) REFERENCES sucursal(id),
  FOREIGN KEY (producto_id) REFERENCES producto(id),
  UNIQUE (sucursal_id, producto_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS movimiento_inventario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sucursal_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad DECIMAL(12,2) NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('COMPRA', 'VENTA', 'AJUSTE')),
  referencia_id INT,
  operado_en DATETIME NOT NULL,
  usuario_id INT,
  FOREIGN KEY (sucursal_id) REFERENCES sucursal(id),
  FOREIGN KEY (producto_id) REFERENCES producto(id),
  FOREIGN KEY (usuario_id) REFERENCES usuario(id),
  INDEX (producto_id, sucursal_id),
  INDEX (operado_en)
) ENGINE=InnoDB;

-- =====================================================
-- TRIGGER: Actualizar inventario automáticamente
-- =====================================================

DELIMITER //
CREATE TRIGGER trg_venta_detalle_inventario
AFTER INSERT ON venta_detalle
FOR EACH ROW
BEGIN
  DECLARE v_sucursal_id INT;
  SELECT sucursal_id INTO v_sucursal_id FROM venta WHERE id = NEW.venta_id;

  -- Crear el registro si no existe
  INSERT INTO inventario_actual (sucursal_id, producto_id, cantidad_actual, costo_promedio)
  VALUES (v_sucursal_id, NEW.producto_id, 0, NEW.costo_unitario)
  ON DUPLICATE KEY UPDATE
    cantidad_actual = cantidad_actual - NEW.cantidad,
    actualizado_en = NOW();

  -- Registrar movimiento
  INSERT INTO movimiento_inventario 
    (sucursal_id, producto_id, cantidad, tipo, referencia_id, operado_en, usuario_id)
  SELECT v_sucursal_id, NEW.producto_id, -NEW.cantidad, 'VENTA', NEW.venta_id, NOW(), usuario_id
  FROM venta WHERE id = NEW.venta_id;
END//
DELIMITER ;

-- =====================================================
-- DATOS INICIALES
-- =====================================================

INSERT INTO sucursal (nombre, ciudad, direccion) VALUES
('Sucursal Central', 'La Paz', 'Av. 16 de Julio #1234');

INSERT INTO usuario (nombre, email, username, password_hash, rol, zona, calle, numero_casa) VALUES
('Admin', 'admin@olimpia.com', 'admin', '$2b$10$rZ8qF7xK3mN2pL9wV1tXxO8YhJ4nM6sT7uK2pL9wV1tXxO8YhJ4nM', 'ADMIN', 'Sopocachi', 'Av. 20 de Octubre', '1234');

INSERT INTO categoria (nombre) VALUES
('Libros'),
('Útiles Escolares');
