-- ------------------------------------------------------------
-- MAESTRO: INSERCIÓN DE DATOS ADICIONALES PARA REPORTES
-- Se asume que el script Data_y_esquema.sql ya fue ejecutado.
-- ------------------------------------------------------------

-- Ajuste de AUTO_INCREMENT para continuar desde los IDs existentes
ALTER TABLE `cliente` AUTO_INCREMENT = 3;
ALTER TABLE `venta` AUTO_INCREMENT = 2;
ALTER TABLE `venta_detalle` AUTO_INCREMENT = 2;
ALTER TABLE `movimiento_inventario` AUTO_INCREMENT = 2;


-- ===========================================
-- 1. Nuevo Cliente (Fecha de creación: 2025-11-15)
-- Se usará para probar el contador de 'nuevos_clientes' en Noviembre.
-- ===========================================
INSERT INTO `cliente` (`id`, `nombre`, `email`, `password_hash`, `tipo_cliente`, `nit_ci`, `zona`, `calle`, `numero_casa`, `creado_en`) VALUES
(3, 'Carla Perez', 'carla@correo.com', '$2b$12$ABCDEF...', 'MAYORISTA', '1234567', 'B. Nuevo', 'Calle A', '50', '2025-11-15 10:00:00');


-- ===========================================
-- 2. Venta Grande (Fecha: 2025-09-01) - Para rango antiguo
-- Producto 3 (Cien años de soledad): 10 unidades
-- ===========================================

INSERT INTO `venta` (`id`, `sucursal_id`, `cliente_id`, `usuario_id`, `pedido_id`, `estado`, `operado_en`, `total_neto`) VALUES
(2, 1, 2, 1, NULL, 'PAGADA', '2025-09-01 10:00:00', 2807.50);

INSERT INTO `venta_detalle` (`id`, `venta_id`, `producto_id`, `cantidad`, `precio_unitario`, `costo_unitario`, `importe_neto`) VALUES
(2, 2, 3, 10.00, 280.75, 200.0000, 2807.50); -- Venta 2, Detalle 2

-- ===========================================
-- 3. Venta Mixta (Fecha: 2025-11-20) - Para rango reciente (Cliente 1)
-- Producto 2 (bolígrafos): 4 unidades
-- Producto 1 (Anillos): 1 unidad
-- ===========================================

INSERT INTO `venta` (`id`, `sucursal_id`, `cliente_id`, `usuario_id`, `pedido_id`, `estado`, `operado_en`, `total_neto`) VALUES
(3, 1, 1, 1, NULL, 'PAGADA', '2025-11-20 14:30:00', 532.00); -- (4*45.50 + 1*350.00)

INSERT INTO `venta_detalle` (`id`, `venta_id`, `producto_id`, `cantidad`, `precio_unitario`, `costo_unitario`, `importe_neto`) VALUES
(3, 3, 2, 4.00, 45.50, 30.0000, 182.00); -- Venta 3, Detalle 3
INSERT INTO `venta_detalle` (`id`, `venta_id`, `producto_id`, `cantidad`, `precio_unitario`, `costo_unitario`, `importe_neto`) VALUES
(4, 3, 1, 1.00, 350.00, 250.0000, 350.00); -- Venta 3, Detalle 4


-- ===========================================
-- 4. Venta sin Cliente (Fecha: 2025-11-20) - Para rango reciente (Cliente Anónimo/NULL)
-- Producto 2 (bolígrafos): 2 unidades
-- ===========================================

INSERT INTO `venta` (`id`, `sucursal_id`, `cliente_id`, `usuario_id`, `pedido_id`, `estado`, `operado_en`, `total_neto`) VALUES
(4, 1, NULL, 1, NULL, 'PAGADA', '2025-11-20 15:00:00', 91.00); -- (2*45.50)

INSERT INTO `venta_detalle` (`id`, `venta_id`, `producto_id`, `cantidad`, `precio_unitario`, `costo_unitario`, `importe_neto`) VALUES
(5, 4, 2, 2.00, 45.50, 30.0000, 91.00); -- Venta 4, Detalle 5


-- ===========================================
-- 5. Actualización Manual de Inventario
-- (Esto se hace por si los triggers no se ejecutan automáticamente en tu entorno)
-- ===========================================
UPDATE `inventario_actual` SET `cantidad_actual` = 97.00, `actualizado_en` = '2025-11-20 15:00:00' WHERE `producto_id` = 1;
UPDATE `inventario_actual` SET `cantidad_actual` = 94.00, `actualizado_en` = '2025-11-20 15:00:00' WHERE `producto_id` = 2;
UPDATE `inventario_actual` SET `cantidad_actual` = 90.00, `actualizado_en` = '2025-11-20 15:00:00' WHERE `producto_id` = 3;