-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 28-10-2025 a las 03:24:02
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `libreria_olimpia`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria`
--

CREATE TABLE `categoria` (
  `id` int(11) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `categoria_padre_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `categoria`
--

INSERT INTO `categoria` (`id`, `nombre`, `categoria_padre_id`) VALUES
(1, 'Libros', NULL),
(2, 'Papelería', NULL),
(3, 'Material Escolar', NULL),
(4, 'Oficina', NULL),
(5, 'Arte', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cliente`
--

CREATE TABLE `cliente` (
  `id` int(11) NOT NULL,
  `nombre` varchar(160) NOT NULL,
  `email` varchar(120) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `tipo_cliente` varchar(40) DEFAULT NULL CHECK (`tipo_cliente` in ('MINORISTA','MAYORISTA')),
  `estado` tinyint(1) DEFAULT 1,
  `nit_ci` varchar(30) DEFAULT NULL,
  `zona` varchar(120) DEFAULT NULL,
  `calle` varchar(120) DEFAULT NULL,
  `numero_casa` varchar(30) DEFAULT NULL,
  `creado_en` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `cliente`
--

INSERT INTO `cliente` (`id`, `nombre`, `email`, `password_hash`, `tipo_cliente`, `estado`, `nit_ci`, `zona`, `calle`, `numero_casa`, `creado_en`) VALUES
(1, 'Cliente', 'cliente@olimpia.com', '$2b$10$fwmSB5pkslYnE9jCQqvuNezgApG4SYr1llI7sL2kZwPtyhnj0kLN.', NULL, 1, NULL, NULL, NULL, NULL, '2025-10-27 19:57:36'),
(2, 'Esme', 'esme@gmail.com', '$2b$12$mo0GoWpz2ktOgYC3KH.RoOC2wjLHztw7DCEySquzoBafjp16OpXP.', 'MINORISTA', 1, NULL, NULL, NULL, NULL, '2025-10-27 20:10:27');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventario_actual`
--

CREATE TABLE `inventario_actual` (
  `id` int(11) NOT NULL,
  `sucursal_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `cantidad_actual` decimal(12,2) DEFAULT 0.00 CHECK (`cantidad_actual` >= 0),
  `costo_promedio` decimal(14,4) DEFAULT NULL,
  `actualizado_en` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `inventario_actual`
--

INSERT INTO `inventario_actual` (`id`, `sucursal_id`, `producto_id`, `cantidad_actual`, `costo_promedio`, `actualizado_en`) VALUES
(1, 1, 1, 50.00, NULL, '2025-10-27 19:57:36'),
(2, 1, 2, 50.00, NULL, '2025-10-27 19:57:36'),
(3, 1, 3, 50.00, NULL, '2025-10-27 19:57:36'),
(4, 1, 4, 50.00, NULL, '2025-10-27 19:57:36'),
(5, 1, 5, 50.00, NULL, '2025-10-27 19:57:36'),
(6, 1, 6, 50.00, NULL, '2025-10-27 19:57:36'),
(7, 1, 7, 50.00, NULL, '2025-10-27 19:57:36'),
(8, 1, 8, 50.00, NULL, '2025-10-27 19:57:36'),
(9, 1, 9, 50.00, NULL, '2025-10-27 19:57:36'),
(10, 1, 10, 50.00, NULL, '2025-10-27 19:57:36');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimiento_inventario`
--

CREATE TABLE `movimiento_inventario` (
  `id` int(11) NOT NULL,
  `sucursal_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `cantidad` decimal(12,2) NOT NULL,
  `tipo` varchar(20) NOT NULL CHECK (`tipo` in ('COMPRA','VENTA','AJUSTE')),
  `referencia_id` int(11) DEFAULT NULL,
  `operado_en` datetime NOT NULL,
  `usuario_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedido`
--

CREATE TABLE `pedido` (
  `id` int(11) NOT NULL,
  `sucursal_id` int(11) NOT NULL,
  `cliente_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `estado` varchar(20) DEFAULT 'PENDIENTE' CHECK (`estado` in ('PENDIENTE','ENTREGADO','CANCELADO')),
  `fecha_pedido` datetime DEFAULT current_timestamp(),
  `total_neto` decimal(14,2) NOT NULL CHECK (`total_neto` >= 0),
  `direccion_envio` varchar(255) DEFAULT NULL COMMENT 'Dirección de envío completa'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedido_detalle`
--

CREATE TABLE `pedido_detalle` (
  `id` int(11) NOT NULL,
  `pedido_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `cantidad` decimal(12,2) NOT NULL CHECK (`cantidad` > 0),
  `precio_unitario` decimal(14,2) NOT NULL,
  `importe_neto` decimal(14,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto`
--

CREATE TABLE `producto` (
  `id` int(11) NOT NULL,
  `sku` varchar(60) DEFAULT NULL,
  `nombre` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `categoria_id` int(11) DEFAULT NULL,
  `precio_venta` decimal(14,2) DEFAULT 0.00,
  `stock_minimo` int(11) DEFAULT 0,
  `imagen_url` varchar(255) DEFAULT NULL COMMENT 'Ruta o URL de la imagen del producto',
  `activo` tinyint(1) DEFAULT 1,
  `creado_en` datetime DEFAULT current_timestamp()
) ;

--
-- Volcado de datos para la tabla `producto`
--

INSERT INTO `producto` (`id`, `sku`, `nombre`, `descripcion`, `categoria_id`, `precio_venta`, `stock_minimo`, `imagen_url`, `activo`, `creado_en`) VALUES
(1, 'LIB-001', 'Animalitos de la Granja', 'Libro infantil educativo con ilustraciones coloridas que enseñan sobre animales de granja.', 1, 120.00, 5, '/IMG/productos/animalitos.jpg', 1, '2025-10-27 19:57:36'),
(2, 'LIB-002', 'Sherlocks', 'Colección de cuentos detectivescos ideales para fomentar la lectura y la lógica en jóvenes.', 1, 100.00, 5, '/IMG/productos/sherlocks.jpg', 1, '2025-10-27 19:57:36'),
(3, 'PAP-001', 'Cuaderno Anillado Tapa Dura (Mármol)', 'Cuaderno resistente con tapa dura, ideal para clases, apuntes o notas de trabajo.', 2, 35.50, 10, '/IMG/productos/cuaderno_marmol.jpg', 1, '2025-10-27 19:57:36'),
(4, 'PAP-002', 'Agenda', 'Agenda de uso diario con secciones para notas, calendario y tareas importantes.', 2, 30.00, 10, '/IMG/productos/agenda.jpg', 1, '2025-10-27 19:57:36'),
(5, 'ESC-001', 'Caja de 12 Colores Kores', 'Set de lápices de colores intensos, ideales para niños y artistas principiantes.', 3, 20.00, 15, '/IMG/productos/kromas.jpg', 1, '2025-10-27 19:57:36'),
(6, 'ESC-002', 'Caja de 12 Colores Pelikan pastel', 'Lápices de tonos suaves y textura cremosa para colorear o realizar bocetos artísticos.', 3, 50.00, 15, '/IMG/productos/pelikanpastel.jpg', 1, '2025-10-27 19:57:36'),
(7, 'OFI-001', 'Paquete 200 Hojas Papel Carpeta', 'Papel tamaño carta de alta calidad para impresiones y documentos de oficina.', 4, 50.00, 20, '/IMG/productos/papel_carpeta.jpg', 1, '2025-10-27 19:57:36'),
(8, 'OFI-002', 'Paquete 100 Hojas Papel Trapper Punteadas', 'Hojas punteadas premium compatibles con archivadores tipo Trapper.', 4, 100.00, 20, '/IMG/productos/papel_trapper_punteadas.jpg', 1, '2025-10-27 19:57:36'),
(9, 'ART-001', 'Pincel agua', 'Pincel recargable con depósito de agua para técnicas de acuarela y difuminado.', 5, 50.00, 5, '/IMG/productos/pincel_agua.jpg', 1, '2025-10-27 19:57:36'),
(10, 'ART-002', 'Set de aquarela con lienzo Canva', 'Kit completo con acuarelas, pinceles y lienzo, perfecto para artistas principiantes.', 5, 150.00, 5, '/IMG/productos/set_arte_water.jpg', 1, '2025-10-27 19:57:36');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedor`
--

CREATE TABLE `proveedor` (
  `id` int(11) NOT NULL,
  `nombre` varchar(160) NOT NULL,
  `contacto` varchar(120) DEFAULT NULL,
  `creado_en` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sucursal`
--

CREATE TABLE `sucursal` (
  `id` int(11) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `ciudad` varchar(80) NOT NULL,
  `direccion` varchar(200) NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `creado_en` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `sucursal`
--

INSERT INTO `sucursal` (`id`, `nombre`, `ciudad`, `direccion`, `activo`, `creado_en`) VALUES
(1, 'Ballivian', 'La Paz', 'Calle Ballivián #1232 Entre\r\nColón y Plaza Murillo', 1, '2025-10-27 19:57:17');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id` int(11) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `email` varchar(120) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `rol` varchar(40) NOT NULL CHECK (ucase(`rol`) in ('ADMIN','VENDEDOR','ALMACEN')),
  `zona` varchar(120) DEFAULT NULL,
  `calle` varchar(120) DEFAULT NULL,
  `numero_casa` varchar(30) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `creado_en` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id`, `nombre`, `email`, `username`, `password_hash`, `rol`, `zona`, `calle`, `numero_casa`, `activo`, `creado_en`) VALUES
(1, 'Admin', 'admin@olimpia.com', 'admin', '$2b$10$fwmSB5pkslYnE9jCQqvuNev2V70yhZZiKRYbaQMRAuHA10GAWHNyS', 'ADMIN', NULL, NULL, NULL, 1, '2025-10-27 19:57:36');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `venta`
--

CREATE TABLE `venta` (
  `id` int(11) NOT NULL,
  `sucursal_id` int(11) NOT NULL,
  `cliente_id` int(11) DEFAULT NULL,
  `usuario_id` int(11) NOT NULL,
  `pedido_id` int(11) DEFAULT NULL,
  `estado` varchar(20) DEFAULT 'PAGADA' CHECK (`estado` in ('PAGADA','ANULADA')),
  `operado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `total_neto` decimal(14,2) NOT NULL CHECK (`total_neto` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `venta_detalle`
--

CREATE TABLE `venta_detalle` (
  `id` int(11) NOT NULL,
  `venta_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `cantidad` decimal(12,2) NOT NULL CHECK (`cantidad` > 0),
  `precio_unitario` decimal(14,2) NOT NULL,
  `costo_unitario` decimal(14,4) NOT NULL,
  `importe_neto` decimal(14,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Disparadores `venta_detalle`
--
DELIMITER $$
CREATE TRIGGER `trg_venta_detalle_inventario` AFTER INSERT ON `venta_detalle` FOR EACH ROW BEGIN
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
END
$$
DELIMITER ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categoria`
--
ALTER TABLE `categoria`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categoria_padre_id` (`categoria_padre_id`);

--
-- Indices de la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indices de la tabla `inventario_actual`
--
ALTER TABLE `inventario_actual`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sucursal_id` (`sucursal_id`,`producto_id`),
  ADD KEY `producto_id` (`producto_id`);

--
-- Indices de la tabla `movimiento_inventario`
--
ALTER TABLE `movimiento_inventario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sucursal_id` (`sucursal_id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `producto_id` (`producto_id`,`sucursal_id`),
  ADD KEY `operado_en` (`operado_en`);

--
-- Indices de la tabla `pedido`
--
ALTER TABLE `pedido`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sucursal_id` (`sucursal_id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `idx_pedido_cliente` (`cliente_id`);

--
-- Indices de la tabla `pedido_detalle`
--
ALTER TABLE `pedido_detalle`
  ADD PRIMARY KEY (`id`),
  ADD KEY `producto_id` (`producto_id`),
  ADD KEY `pedido_id` (`pedido_id`);

--
-- Indices de la tabla `producto`
--
ALTER TABLE `producto`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sku` (`sku`),
  ADD KEY `categoria_id` (`categoria_id`);

--
-- Indices de la tabla `proveedor`
--
ALTER TABLE `proveedor`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `sucursal`
--
ALTER TABLE `sucursal`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indices de la tabla `venta`
--
ALTER TABLE `venta`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sucursal_id` (`sucursal_id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `pedido_id` (`pedido_id`),
  ADD KEY `operado_en` (`operado_en`),
  ADD KEY `idx_venta_cliente` (`cliente_id`);

--
-- Indices de la tabla `venta_detalle`
--
ALTER TABLE `venta_detalle`
  ADD PRIMARY KEY (`id`),
  ADD KEY `venta_id` (`venta_id`),
  ADD KEY `producto_id` (`producto_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categoria`
--
ALTER TABLE `categoria`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `cliente`
--
ALTER TABLE `cliente`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `inventario_actual`
--
ALTER TABLE `inventario_actual`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `movimiento_inventario`
--
ALTER TABLE `movimiento_inventario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pedido`
--
ALTER TABLE `pedido`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pedido_detalle`
--
ALTER TABLE `pedido_detalle`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `producto`
--
ALTER TABLE `producto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `proveedor`
--
ALTER TABLE `proveedor`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `sucursal`
--
ALTER TABLE `sucursal`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `venta`
--
ALTER TABLE `venta`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `venta_detalle`
--
ALTER TABLE `venta_detalle`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `categoria`
--
ALTER TABLE `categoria`
  ADD CONSTRAINT `categoria_ibfk_1` FOREIGN KEY (`categoria_padre_id`) REFERENCES `categoria` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `inventario_actual`
--
ALTER TABLE `inventario_actual`
  ADD CONSTRAINT `inventario_actual_ibfk_1` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursal` (`id`),
  ADD CONSTRAINT `inventario_actual_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `producto` (`id`);

--
-- Filtros para la tabla `movimiento_inventario`
--
ALTER TABLE `movimiento_inventario`
  ADD CONSTRAINT `movimiento_inventario_ibfk_1` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursal` (`id`),
  ADD CONSTRAINT `movimiento_inventario_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `producto` (`id`),
  ADD CONSTRAINT `movimiento_inventario_ibfk_3` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`);

--
-- Filtros para la tabla `pedido`
--
ALTER TABLE `pedido`
  ADD CONSTRAINT `pedido_ibfk_1` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursal` (`id`),
  ADD CONSTRAINT `pedido_ibfk_2` FOREIGN KEY (`cliente_id`) REFERENCES `cliente` (`id`),
  ADD CONSTRAINT `pedido_ibfk_3` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`);

--
-- Filtros para la tabla `pedido_detalle`
--
ALTER TABLE `pedido_detalle`
  ADD CONSTRAINT `pedido_detalle_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedido` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pedido_detalle_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `producto` (`id`);

--
-- Filtros para la tabla `producto`
--
ALTER TABLE `producto`
  ADD CONSTRAINT `producto_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categoria` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `venta`
--
ALTER TABLE `venta`
  ADD CONSTRAINT `venta_ibfk_1` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursal` (`id`),
  ADD CONSTRAINT `venta_ibfk_2` FOREIGN KEY (`cliente_id`) REFERENCES `cliente` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `venta_ibfk_3` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`),
  ADD CONSTRAINT `venta_ibfk_4` FOREIGN KEY (`pedido_id`) REFERENCES `pedido` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `venta_detalle`
--
ALTER TABLE `venta_detalle`
  ADD CONSTRAINT `venta_detalle_ibfk_1` FOREIGN KEY (`venta_id`) REFERENCES `venta` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `venta_detalle_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `producto` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

--Tarea03:Optimización de consultas JOIN entre tablas Venta, Detalle y Producto para evitar latencia en reportes.

-- 1. Optimización para filtrar Ventas por Fecha y Estado al mismo tiempo
-- (Evita que la DB revise ventas 'ANULADAS' cuando pides reportes de ventas 'PAGADAS')
CREATE INDEX idx_venta_estado_fecha 
ON venta(estado, operado_en);

-- 2. Optimización para el Buscador de Productos del Dashboard
-- (Tu código React busca por nombre, y actualmente 'nombre' NO tiene índice, lo cual es lento)
CREATE INDEX idx_producto_nombre 
ON producto(nombre);

-- 3. Optimización para filtrar Productos por Categoría
-- (Ayuda a la gráfica de "Top Productos Filtrados por Categoría")
CREATE INDEX idx_producto_categoria_activo 
ON producto(categoria_id, activo);

-- 4. Optimización opcional para JOINs masivos en Detalles
-- (Ayuda a unir Venta con Detalle más rápido usando el ID y trayendo el producto)
CREATE INDEX idx_detalle_covering 
ON venta_detalle(venta_id, producto_id);