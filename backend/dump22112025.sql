-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: libreria_olimpia
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categoria`
--

DROP TABLE IF EXISTS `categoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categoria` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `categoria_padre_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `categoria_padre_id` (`categoria_padre_id`),
  CONSTRAINT `categoria_ibfk_1` FOREIGN KEY (`categoria_padre_id`) REFERENCES `categoria` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoria`
--

LOCK TABLES `categoria` WRITE;
/*!40000 ALTER TABLE `categoria` DISABLE KEYS */;
INSERT INTO `categoria` VALUES (1,'Libros',NULL),(2,'Papelería',NULL),(3,'Material Escolar',NULL),(4,'Oficina',NULL),(5,'Arte',NULL);
/*!40000 ALTER TABLE `categoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cliente`
--

DROP TABLE IF EXISTS `cliente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cliente` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(160) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_cliente` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` tinyint(1) DEFAULT '1',
  `nit_ci` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `zona` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `calle` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero_casa` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creado_en` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  CONSTRAINT `cliente_chk_1` CHECK ((`tipo_cliente` in (_utf8mb4'MINORISTA',_utf8mb4'MAYORISTA')))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cliente`
--

LOCK TABLES `cliente` WRITE;
/*!40000 ALTER TABLE `cliente` DISABLE KEYS */;
INSERT INTO `cliente` VALUES (1,'Cliente','cliente@olimpia.com','$2b$10$fwmSB5pkslYnE9jCQqvuNezgApG4SYr1llI7sL2kZwPtyhnj0kLN.',NULL,1,NULL,NULL,NULL,NULL,'2025-10-27 19:57:36'),(2,'Esme','esme@gmail.com','$2b$12$mo0GoWpz2ktOgYC3KH.RoOC2wjLHztw7DCEySquzoBafjp16OpXP.','MINORISTA',1,NULL,NULL,NULL,NULL,'2025-10-27 20:10:27'),(3,'Carla Perez','carla@correo.com','$2b$12$ABCDEF...','MAYORISTA',1,'1234567','B. Nuevo','Calle A','50','2025-11-15 10:00:00');
/*!40000 ALTER TABLE `cliente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventario_actual`
--

DROP TABLE IF EXISTS `inventario_actual`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventario_actual` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sucursal_id` int NOT NULL,
  `producto_id` int NOT NULL,
  `cantidad_actual` decimal(12,2) DEFAULT '0.00',
  `costo_promedio` decimal(14,4) DEFAULT NULL,
  `actualizado_en` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sucursal_id` (`sucursal_id`,`producto_id`),
  KEY `producto_id` (`producto_id`),
  CONSTRAINT `inventario_actual_ibfk_1` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursal` (`id`),
  CONSTRAINT `inventario_actual_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `producto` (`id`),
  CONSTRAINT `inventario_actual_chk_1` CHECK ((`cantidad_actual` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventario_actual`
--

LOCK TABLES `inventario_actual` WRITE;
/*!40000 ALTER TABLE `inventario_actual` DISABLE KEYS */;
INSERT INTO `inventario_actual` VALUES (1,1,1,97.00,NULL,'2025-11-20 15:00:00'),(2,1,2,94.00,NULL,'2025-11-20 15:00:00'),(3,1,3,90.00,NULL,'2025-11-20 15:00:00'),(4,1,4,50.00,NULL,'2025-10-27 19:57:36'),(5,1,5,50.00,NULL,'2025-10-27 19:57:36'),(6,1,6,50.00,NULL,'2025-10-27 19:57:36'),(7,1,7,50.00,NULL,'2025-10-27 19:57:36'),(8,1,8,50.00,NULL,'2025-10-27 19:57:36'),(9,1,9,50.00,NULL,'2025-10-27 19:57:36'),(10,1,10,50.00,NULL,'2025-10-27 19:57:36'),(11,1,11,100.00,125.0000,'2025-11-28 10:00:10'),(12,1,12,100.00,90.2500,'2025-11-28 10:00:11'),(13,1,13,100.00,22.5000,'2025-11-28 10:00:12'),(14,1,14,100.00,7.5000,'2025-11-28 10:00:13'),(15,1,15,100.00,6.0000,'2025-11-28 10:00:14'),(16,1,16,100.00,2.7500,'2025-11-28 10:00:15'),(17,1,17,100.00,11.0000,'2025-11-28 10:00:16'),(18,1,18,100.00,42.5000,'2025-11-28 10:00:17'),(19,1,19,100.00,55.0000,'2025-11-28 10:00:18'),(20,1,20,100.00,32.5000,'2025-11-28 10:00:19');
/*!40000 ALTER TABLE `inventario_actual` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movimiento_inventario`
--

DROP TABLE IF EXISTS `movimiento_inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movimiento_inventario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sucursal_id` int NOT NULL,
  `producto_id` int NOT NULL,
  `cantidad` decimal(12,2) NOT NULL,
  `tipo` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `referencia_id` int DEFAULT NULL,
  `operado_en` datetime NOT NULL,
  `usuario_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sucursal_id` (`sucursal_id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `producto_id` (`producto_id`,`sucursal_id`),
  KEY `operado_en` (`operado_en`),
  CONSTRAINT `movimiento_inventario_ibfk_1` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursal` (`id`),
  CONSTRAINT `movimiento_inventario_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `producto` (`id`),
  CONSTRAINT `movimiento_inventario_ibfk_3` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`),
  CONSTRAINT `movimiento_inventario_chk_1` CHECK ((`tipo` in (_utf8mb4'COMPRA',_utf8mb4'VENTA',_utf8mb4'AJUSTE')))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimiento_inventario`
--

LOCK TABLES `movimiento_inventario` WRITE;
/*!40000 ALTER TABLE `movimiento_inventario` DISABLE KEYS */;
INSERT INTO `movimiento_inventario` VALUES (2,1,3,-10.00,'VENTA',2,'2025-11-21 20:51:58',1),(3,1,2,-4.00,'VENTA',3,'2025-11-21 20:51:58',1),(4,1,1,-1.00,'VENTA',3,'2025-11-21 20:51:58',1),(5,1,2,-2.00,'VENTA',4,'2025-11-21 20:51:59',1);
/*!40000 ALTER TABLE `movimiento_inventario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedido`
--

DROP TABLE IF EXISTS `pedido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedido` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sucursal_id` int NOT NULL,
  `cliente_id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'PENDIENTE',
  `fecha_pedido` datetime DEFAULT CURRENT_TIMESTAMP,
  `total_neto` decimal(14,2) NOT NULL,
  `direccion_envio` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Dirección de envío completa',
  PRIMARY KEY (`id`),
  KEY `sucursal_id` (`sucursal_id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `idx_pedido_cliente` (`cliente_id`),
  CONSTRAINT `pedido_ibfk_1` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursal` (`id`),
  CONSTRAINT `pedido_ibfk_2` FOREIGN KEY (`cliente_id`) REFERENCES `cliente` (`id`),
  CONSTRAINT `pedido_ibfk_3` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`),
  CONSTRAINT `pedido_chk_1` CHECK ((`estado` in (_utf8mb4'PENDIENTE',_utf8mb4'ENTREGADO',_utf8mb4'CANCELADO'))),
  CONSTRAINT `pedido_chk_2` CHECK ((`total_neto` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedido`
--

LOCK TABLES `pedido` WRITE;
/*!40000 ALTER TABLE `pedido` DISABLE KEYS */;
/*!40000 ALTER TABLE `pedido` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedido_detalle`
--

DROP TABLE IF EXISTS `pedido_detalle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedido_detalle` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pedido_id` int NOT NULL,
  `producto_id` int NOT NULL,
  `cantidad` decimal(12,2) NOT NULL,
  `precio_unitario` decimal(14,2) NOT NULL,
  `importe_neto` decimal(14,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `producto_id` (`producto_id`),
  KEY `pedido_id` (`pedido_id`),
  CONSTRAINT `pedido_detalle_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedido` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pedido_detalle_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `producto` (`id`),
  CONSTRAINT `pedido_detalle_chk_1` CHECK ((`cantidad` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedido_detalle`
--

LOCK TABLES `pedido_detalle` WRITE;
/*!40000 ALTER TABLE `pedido_detalle` DISABLE KEYS */;
/*!40000 ALTER TABLE `pedido_detalle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `producto`
--

DROP TABLE IF EXISTS `producto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `producto` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sku` varchar(60) DEFAULT NULL,
  `nombre` varchar(200) NOT NULL,
  `descripcion` text,
  `categoria_id` int DEFAULT NULL,
  `precio_venta` decimal(14,2) DEFAULT '0.00',
  `stock_minimo` int DEFAULT '0',
  `imagen_url` varchar(255) DEFAULT NULL COMMENT 'Ruta o URL de la imagen del producto',
  `activo` tinyint(1) DEFAULT '1',
  `creado_en` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `categoria_id` (`categoria_id`),
  CONSTRAINT `producto_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categoria` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `producto`
--

LOCK TABLES `producto` WRITE;
/*!40000 ALTER TABLE `producto` DISABLE KEYS */;
INSERT INTO `producto` VALUES (1,'LIB-001','Animalitos de la Granja','Libro infantil educativo con ilustraciones coloridas que enseñan sobre animales de granja.',1,120.00,5,'/IMG/productos/animalitos.jpg',1,'2025-10-27 19:57:36'),(2,'LIB-002','Sherlocks','Colección de cuentos detectivescos ideales para fomentar la lectura y la lógica en jóvenes.',1,100.00,5,'/IMG/productos/sherlocks.jpg',1,'2025-10-27 19:57:36'),(3,'PAP-001','Cuaderno Anillado Tapa Dura (Mármol)','Cuaderno resistente con tapa dura, ideal para clases, apuntes o notas de trabajo.',2,35.50,10,'/IMG/productos/cuaderno_marmol.jpg',1,'2025-10-27 19:57:36'),(4,'PAP-002','Agenda','Agenda de uso diario con secciones para notas, calendario y tareas importantes.',2,30.00,10,'/IMG/productos/agenda.jpg',1,'2025-10-27 19:57:36'),(5,'ESC-001','Caja de 12 Colores Kores','Set de lápices de colores intensos, ideales para niños y artistas principiantes.',3,20.00,15,'/IMG/productos/kromas.jpg',1,'2025-10-27 19:57:36'),(6,'ESC-002','Caja de 12 Colores Pelikan pastel','Lápices de tonos suaves y textura cremosa para colorear o realizar bocetos artísticos.',3,50.00,15,'/IMG/productos/pelikanpastel.jpg',1,'2025-10-27 19:57:36'),(7,'OFI-001','Paquete 200 Hojas Papel Carpeta','Papel tamaño carta de alta calidad para impresiones y documentos de oficina.',4,50.00,20,'/IMG/productos/papel_carpeta.jpg',1,'2025-10-27 19:57:36'),(8,'OFI-002','Paquete 100 Hojas Papel Trapper Punteadas','Hojas punteadas premium compatibles con archivadores tipo Trapper.',4,100.00,20,'/IMG/productos/papel_trapper_punteadas.jpg',1,'2025-10-27 19:57:36'),(9,'ART-001','Pincel agua','Pincel recargable con depósito de agua para técnicas de acuarela y difuminado.',5,50.00,5,'/IMG/productos/pincel_agua.jpg',1,'2025-10-27 19:57:36'),(10,'ART-002','Set de aquarela con lienzo Canva','Kit completo con acuarelas, pinceles y lienzo, perfecto para artistas principiantes.',5,150.00,5,'/IMG/productos/set_arte_water.jpg',1,'2025-10-27 19:57:36'),(11,'LIB-003','El Se├▒or de los Anillos: La Comunidad del Anillo','Primera entrega de la ├®pica saga de J.R.R. Tolkien.',1,250.00,5,'/IMG/productos/esdlacomunidad.jpg',1,'2025-11-28 10:00:00'),(12,'LIB-004','Cien a├▒os de soledad','Novela cumbre de Gabriel Garc├¡a M├írquez.',1,180.50,5,'/IMG/productos/ciena├▒os.jpg',1,'2025-11-28 10:00:01'),(13,'PAP-003','Resaltadores Pastel (Set de 6)','Set de marcadores fluorescentes de tonos suaves.',2,45.00,10,'/IMG/productos/resaltadores_pastel.jpg',1,'2025-11-28 10:00:02'),(14,'PAP-004','Block de Notas Adhesivas 3x3','Notas autoadhesivas de 3x3 pulgadas, color amarillo.',2,15.00,20,'/IMG/productos/postit.jpg',1,'2025-11-28 10:00:03'),(15,'ESC-003','Tijera Punta Redonda Infantil','Tijera segura para uso escolar, color azul.',3,12.00,25,'/IMG/productos/tijera_infantil.jpg',1,'2025-11-28 10:00:04'),(16,'ESC-004','Goma de Borrar de Precisi├│n','Goma de borrar de alta calidad para detalles finos.',3,5.50,30,'/IMG/productos/goma_precision.jpg',1,'2025-11-28 10:00:05'),(17,'OFI-003','Clip Sujetapapeles (Caja 50 und.)','Clips met├ílicos grandes para documentos.',4,22.00,15,'/IMG/productos/clips.jpg',1,'2025-11-28 10:00:06'),(18,'OFI-004','Tinta para Impresora (Negro)','Cartucho de tinta gen├®rico de alto rendimiento.',4,85.00,10,'/IMG/productos/tinta_negra.jpg',1,'2025-11-28 10:00:07'),(19,'ART-003','Set de 12 Acr├¡licos Profesionales','Pinturas acr├¡licas de 12 colores, 60ml cada uno.',5,110.00,5,'/IMG/productos/acrilicos.jpg',1,'2025-11-28 10:00:08'),(20,'ART-004','Bloc de Dibujo A3 (100 hojas)','Papel de alto gramaje para dibujo y t├®cnicas secas.',5,65.00,8,'/IMG/productos/bloc_a3.jpg',1,'2025-11-28 10:00:09');
/*!40000 ALTER TABLE `producto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `proveedor`
--

DROP TABLE IF EXISTS `proveedor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proveedor` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(160) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contacto` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creado_en` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proveedor`
--

LOCK TABLES `proveedor` WRITE;
/*!40000 ALTER TABLE `proveedor` DISABLE KEYS */;
/*!40000 ALTER TABLE `proveedor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sucursal`
--

DROP TABLE IF EXISTS `sucursal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sucursal` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ciudad` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `direccion` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `creado_en` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sucursal`
--

LOCK TABLES `sucursal` WRITE;
/*!40000 ALTER TABLE `sucursal` DISABLE KEYS */;
INSERT INTO `sucursal` VALUES (1,'Ballivian','La Paz','Calle Ballivián #1232 Entre\r\nColón y Plaza Murillo',1,'2025-10-27 19:57:17');
/*!40000 ALTER TABLE `sucursal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `zona` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `calle` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero_casa` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `creado_en` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `username` (`username`),
  CONSTRAINT `usuario_chk_1` CHECK ((upper(`rol`) in (_utf8mb4'ADMIN',_utf8mb4'VENDEDOR',_utf8mb4'ALMACEN')))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'Admin','admin@olimpia.com','admin','$2b$10$fwmSB5pkslYnE9jCQqvuNev2V70yhZZiKRYbaQMRAuHA10GAWHNyS','ADMIN',NULL,NULL,NULL,1,'2025-10-27 19:57:36');
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `venta`
--

DROP TABLE IF EXISTS `venta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `venta` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sucursal_id` int NOT NULL,
  `cliente_id` int DEFAULT NULL,
  `usuario_id` int NOT NULL,
  `pedido_id` int DEFAULT NULL,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'PAGADA',
  `operado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `total_neto` decimal(14,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sucursal_id` (`sucursal_id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `pedido_id` (`pedido_id`),
  KEY `operado_en` (`operado_en`),
  KEY `idx_venta_cliente` (`cliente_id`),
  CONSTRAINT `venta_ibfk_1` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursal` (`id`),
  CONSTRAINT `venta_ibfk_2` FOREIGN KEY (`cliente_id`) REFERENCES `cliente` (`id`) ON DELETE SET NULL,
  CONSTRAINT `venta_ibfk_3` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`),
  CONSTRAINT `venta_ibfk_4` FOREIGN KEY (`pedido_id`) REFERENCES `pedido` (`id`) ON DELETE SET NULL,
  CONSTRAINT `venta_chk_1` CHECK ((`estado` in (_utf8mb4'PAGADA',_utf8mb4'ANULADA'))),
  CONSTRAINT `venta_chk_2` CHECK ((`total_neto` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `venta`
--

LOCK TABLES `venta` WRITE;
/*!40000 ALTER TABLE `venta` DISABLE KEYS */;
INSERT INTO `venta` VALUES (2,1,2,1,NULL,'PAGADA','2025-09-01 10:00:00',2807.50),(3,1,1,1,NULL,'PAGADA','2025-11-20 14:30:00',532.00),(4,1,NULL,1,NULL,'PAGADA','2025-11-20 15:00:00',91.00);
/*!40000 ALTER TABLE `venta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `venta_detalle`
--

DROP TABLE IF EXISTS `venta_detalle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `venta_detalle` (
  `id` int NOT NULL AUTO_INCREMENT,
  `venta_id` int NOT NULL,
  `producto_id` int NOT NULL,
  `cantidad` decimal(12,2) NOT NULL,
  `precio_unitario` decimal(14,2) NOT NULL,
  `costo_unitario` decimal(14,4) NOT NULL,
  `importe_neto` decimal(14,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `venta_id` (`venta_id`),
  KEY `producto_id` (`producto_id`),
  CONSTRAINT `venta_detalle_ibfk_1` FOREIGN KEY (`venta_id`) REFERENCES `venta` (`id`) ON DELETE CASCADE,
  CONSTRAINT `venta_detalle_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `producto` (`id`),
  CONSTRAINT `venta_detalle_chk_1` CHECK ((`cantidad` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `venta_detalle`
--

LOCK TABLES `venta_detalle` WRITE;
/*!40000 ALTER TABLE `venta_detalle` DISABLE KEYS */;
INSERT INTO `venta_detalle` VALUES (2,2,3,10.00,280.75,200.0000,2807.50),(3,3,2,4.00,45.50,30.0000,182.00),(4,3,1,1.00,350.00,250.0000,350.00),(5,4,2,2.00,45.50,30.0000,91.00);
/*!40000 ALTER TABLE `venta_detalle` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_venta_detalle_inventario` AFTER INSERT ON `venta_detalle` FOR EACH ROW BEGIN
  DECLARE v_sucursal_id INT;
  SELECT sucursal_id INTO v_sucursal_id FROM venta WHERE id = NEW.venta_id;

  
  INSERT INTO inventario_actual (sucursal_id, producto_id, cantidad_actual, costo_promedio)
  VALUES (v_sucursal_id, NEW.producto_id, 0, NEW.costo_unitario)
  ON DUPLICATE KEY UPDATE
    cantidad_actual = cantidad_actual - NEW.cantidad,
    actualizado_en = NOW();

  
  INSERT INTO movimiento_inventario 
    (sucursal_id, producto_id, cantidad, tipo, referencia_id, operado_en, usuario_id)
  SELECT v_sucursal_id, NEW.producto_id, -NEW.cantidad, 'VENTA', NEW.venta_id, NOW(), usuario_id
  FROM venta WHERE id = NEW.venta_id;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-22 23:22:06
