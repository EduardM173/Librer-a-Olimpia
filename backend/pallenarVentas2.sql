-- 1. Configuraciones de seguridad para evitar errores por restricciones.
SET FOREIGN_KEY_CHECKS = 0;

-- =============================================
-- PARTE 1: NUEVOS REGISTROS DE PRODUCTOS
-- Se agregan 5 productos (IDs 21-25), uno por cada categoría existente.
-- =============================================

INSERT INTO `producto` (`id`, `sku`, `nombre`, `descripcion`, `categoria_id`, `precio_venta`, `stock_minimo`, `activo`, `creado_en`) VALUES
(21, 'LIB-005', 'Novela de Ciencia Ficción', 'Un relato épico sobre viajes en el tiempo y el destino.', 1, 190.00, 5, 1, NOW()), -- Categoría 1: Libros
(22, 'PAP-005', 'Set de Bolígrafos de Gel (Colores)', 'Bolígrafos de gel de alta fluidez en 10 colores vibrantes.', 2, 45.00, 10, 1, NOW()), -- Categoría 2: Papelería
(23, 'ESC-005', 'Compás de Precisión Metálico', 'Compás robusto para uso geométrico avanzado.', 3, 30.00, 10, 1, NOW()), -- Categoría 3: Material Escolar
(24, 'OFI-005', 'Archivador de Palanca Tamaño Oficio', 'Archivador de gran capacidad con mecanismo de palanca reforzado.', 4, 85.00, 5, 1, NOW()), -- Categoría 4: Oficina
(25, 'ART-005', 'Set de Óleos Profesionales (24 Tubos)', 'Pinturas al óleo de alta pigmentación para artistas expertos.', 5, 350.00, 3, 1, NOW()); -- Categoría 5: Arte

-- =============================================
-- PARTE 2: INICIALIZAR INVENTARIO PARA NUEVOS PRODUCTOS
-- Se simula una compra inicial de 100 unidades de cada nuevo producto en Sucursal 1.
-- =============================================

INSERT INTO `inventario_actual` (`sucursal_id`, `producto_id`, `cantidad_actual`, `costo_promedio`, `actualizado_en`) VALUES
(1, 21, 100.00, 95.0000, NOW()),
(1, 22, 100.00, 22.5000, NOW()),
(1, 23, 100.00, 15.0000, NOW()),
(1, 24, 100.00, 42.5000, NOW()),
(1, 25, 100.00, 175.0000, NOW());

-- =============================================
-- PARTE 3: NUEVOS REGISTROS DE CLIENTES
-- Se inserta un nuevo cliente (ID 4).
-- =============================================

INSERT INTO `cliente` (`id`, `nombre`, `email`, `password_hash`, `tipo_cliente`, `estado`, `creado_en`) VALUES
(4, 'Roberto Gomez', 'roberto.g@ejemplo.com', '$2b$12$ABCDEF...', 'MINORISTA', 1, NOW());

-- =============================================
-- PARTE 4: NUEVAS VENTAS Y DETALLES
-- Se insertan 2 ventas (IDs 5 y 6) para probar el sistema y el Trigger.
-- (Sucursal: 1, Vendedor: Usuario 1)
-- =============================================

-- Venta 5: Venta a cliente existente (Esme, ID 2) con productos variados (Total: 840.00)
INSERT INTO `venta` (`id`, `sucursal_id`, `cliente_id`, `usuario_id`, `estado`, `operado_en`, `total_neto`) VALUES
(5, 1, 2, 1, 'PAGADA', NOW(), 840.00); 

INSERT INTO `venta_detalle` (`venta_id`, `producto_id`, `cantidad`, `precio_unitario`, `costo_unitario`, `importe_neto`) VALUES
-- Animalitos de la Granja (ID 1, Libros), Agotando 2 unidades.
(5, 1, 2.00, 120.00, 60.0000, 240.00), 
-- Agenda (ID 4, Papelería), Agotando 1 unidad.
(5, 4, 1.00, 30.00, 15.0000, 30.00), 
-- Novela de Ciencia Ficción (ID 21, NUEVO), Agotando 3 unidades.
(5, 21, 3.00, 190.00, 95.0000, 570.00); 


-- Venta 6: Venta a cliente nuevo (Roberto Gomez, ID 4) con productos recién agregados (Total: 635.00)
INSERT INTO `venta` (`id`, `sucursal_id`, `cliente_id`, `usuario_id`, `estado`, `operado_en`, `total_neto`) VALUES
(6, 1, 4, 1, 'PAGADA', NOW(), 635.00);

INSERT INTO `venta_detalle` (`venta_id`, `producto_id`, `cantidad`, `precio_unitario`, `costo_unitario`, `importe_neto`) VALUES
-- Set Bolígrafos (ID 22, NUEVO), Agotando 5 unidades.
(6, 22, 5.00, 45.00, 22.5000, 225.00), 
-- Compás (ID 23, NUEVO), Agotando 2 unidades.
(6, 23, 2.00, 30.00, 15.0000, 60.00), 
-- Set de Óleos (ID 25, NUEVO), Agotando 1 unidad.
(6, 25, 1.00, 350.00, 175.0000, 350.00); 

-- 5. Re-activar restricciones de seguridad.
SET FOREIGN_KEY_CHECKS = 1;