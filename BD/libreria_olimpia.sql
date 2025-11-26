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
  `nombre` varchar(120) NOT NULL,
  `categoria_padre_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `categoria_padre_id` (`categoria_padre_id`),
  CONSTRAINT `categoria_ibfk_1` FOREIGN KEY (`categoria_padre_id`) REFERENCES `categoria` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoria`
--

LOCK TABLES `categoria` WRITE;
/*!40000 ALTER TABLE `categoria` DISABLE KEYS */;
INSERT INTO `categoria` VALUES (1,'Libros',NULL),(2,'├Ütiles Escolares',NULL);
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
  `nombre` varchar(160) NOT NULL,
  `email` varchar(120) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `tipo_cliente` varchar(40) DEFAULT NULL,
  `nit_ci` varchar(30) DEFAULT NULL,
  `zona` varchar(120) DEFAULT NULL,
  `calle` varchar(120) DEFAULT NULL,
  `numero_casa` varchar(30) DEFAULT NULL,
  `creado_en` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  CONSTRAINT `cliente_chk_1` CHECK ((`tipo_cliente` in (_cp850'MINORISTA',_cp850'MAYORISTA')))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cliente`
--

LOCK TABLES `cliente` WRITE;
/*!40000 ALTER TABLE `cliente` DISABLE KEYS */;
INSERT INTO `cliente` VALUES (1,'Juan','juan@correo.com','$2b$12$4qvoqecKWaubwhZl8/S9DOUaZwKaP8A4OueQ0XaTtulVisSx0EJhW','MINORISTA','987654321','B. Central','Av. 6 de Agosto','123','2025-10-27 12:27:07'),(2,'Alan','alan@correo.com','$2b$12$u6lvOvgE1WCRkyb6nQM7T.8qHg7EFwHle5y36ANtHnJw8WqFWdAoO','MINORISTA',NULL,NULL,NULL,NULL,'2025-10-28 12:31:50');
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventario_actual`
--

LOCK TABLES `inventario_actual` WRITE;
/*!40000 ALTER TABLE `inventario_actual` DISABLE KEYS */;
INSERT INTO `inventario_actual` VALUES (1,1,1,98.00,250.0000,'2025-10-27 13:06:01'),(2,1,2,100.00,30.0000,'2025-10-27 13:06:01'),(3,1,3,100.00,200.0000,'2025-10-27 13:06:01');
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
  `tipo` varchar(20) NOT NULL,
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
  CONSTRAINT `movimiento_inventario_chk_1` CHECK ((`tipo` in (_cp850'COMPRA',_cp850'VENTA',_cp850'AJUSTE')))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimiento_inventario`
--

LOCK TABLES `movimiento_inventario` WRITE;
/*!40000 ALTER TABLE `movimiento_inventario` DISABLE KEYS */;
INSERT INTO `movimiento_inventario` VALUES (1,1,1,-2.00,'VENTA',1,'2025-10-27 13:06:01',1);
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
  `estado` varchar(20) DEFAULT 'PENDIENTE',
  `fecha_pedido` datetime DEFAULT CURRENT_TIMESTAMP,
  `total_neto` decimal(14,2) NOT NULL,
  `direccion_envio` varchar(255) DEFAULT NULL COMMENT 'Direcci├│n de env├¡o completa',
  PRIMARY KEY (`id`),
  KEY `sucursal_id` (`sucursal_id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `idx_pedido_cliente` (`cliente_id`),
  CONSTRAINT `pedido_ibfk_1` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursal` (`id`),
  CONSTRAINT `pedido_ibfk_2` FOREIGN KEY (`cliente_id`) REFERENCES `cliente` (`id`),
  CONSTRAINT `pedido_ibfk_3` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`),
  CONSTRAINT `pedido_chk_1` CHECK ((`estado` in (_utf8mb4'PENDIENTE',_utf8mb4'ENTREGADO',_utf8mb4'CANCELADO'))),
  CONSTRAINT `pedido_chk_2` CHECK ((`total_neto` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedido`
--

LOCK TABLES `pedido` WRITE;
/*!40000 ALTER TABLE `pedido` DISABLE KEYS */;
INSERT INTO `pedido` VALUES (1,1,1,1,'ENTREGADO','2025-10-27 13:06:01',700.00,'Calle Falsa 123, Zona Centro, La Paz'),(2,1,1,1,'PENDIENTE','2025-10-27 13:06:01',508.25,'Av. Principal 456, Edificio Azul');
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedido_detalle`
--

LOCK TABLES `pedido_detalle` WRITE;
/*!40000 ALTER TABLE `pedido_detalle` DISABLE KEYS */;
INSERT INTO `pedido_detalle` VALUES (1,1,1,2.00,350.00,700.00),(2,2,2,5.00,45.50,227.50),(3,2,3,1.00,280.75,280.75);
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
  `categoria_id` int DEFAULT NULL,
  `precio_venta` decimal(14,2) DEFAULT '0.00',
  `stock_minimo` int DEFAULT '0',
  `imagen_url` varchar(255) DEFAULT NULL COMMENT 'Ruta o URL de la imagen del producto',
  `activo` tinyint(1) DEFAULT '1',
  `creado_en` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `categoria_id` (`categoria_id`),
  CONSTRAINT `producto_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categoria` (`id`) ON DELETE SET NULL,
  CONSTRAINT `chk_precio` CHECK ((`precio_venta` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `producto`
--

LOCK TABLES `producto` WRITE;
/*!40000 ALTER TABLE `producto` DISABLE KEYS */;
INSERT INTO `producto` VALUES (1,'LIB-001','El Se├▒or de los Anillos',1,350.00,10,'url_anillos.jpg',1,'2025-10-27 13:06:01'),(2,'UTIL-005','Set de bol├¡grafos de gel',2,45.50,50,'url_boligrafos.jpg',1,'2025-10-27 13:06:01'),(3,'LIB-002','Cien a├▒os de soledad',1,280.75,5,'url_cien_anios.jpg',1,'2025-10-27 13:06:01');
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
  `nombre` varchar(160) NOT NULL,
  `contacto` varchar(120) DEFAULT NULL,
  `creado_en` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `nombre` varchar(120) NOT NULL,
  `ciudad` varchar(80) NOT NULL,
  `direccion` varchar(200) NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `creado_en` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sucursal`
--

LOCK TABLES `sucursal` WRITE;
/*!40000 ALTER TABLE `sucursal` DISABLE KEYS */;
INSERT INTO `sucursal` VALUES (1,'Sucursal Central','La Paz','Av. 16 de Julio #1234',1,'2025-10-27 12:25:16');
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
  `nombre` varchar(120) NOT NULL,
  `email` varchar(120) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `rol` varchar(40) NOT NULL,
  `zona` varchar(120) DEFAULT NULL,
  `calle` varchar(120) DEFAULT NULL,
  `numero_casa` varchar(30) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `creado_en` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `username` (`username`),
  CONSTRAINT `usuario_chk_1` CHECK ((upper(`rol`) in (_cp850'ADMIN',_cp850'VENDEDOR',_cp850'ALMACEN')))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'Admin','admin@olimpia.com','admin','$2b$10$rZ8qF7xK3mN2pL9wV1tXxO8YhJ4nM6sT7uK2pL9wV1tXxO8YhJ4nM','ADMIN','Sopocachi','Av. 20 de Octubre','1234',1,'2025-10-27 12:25:16');
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
  `estado` varchar(20) DEFAULT 'PAGADA',
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `venta`
--

LOCK TABLES `venta` WRITE;
/*!40000 ALTER TABLE `venta` DISABLE KEYS */;
INSERT INTO `venta` VALUES (1,1,1,1,1,'PAGADA','2025-10-27 13:06:01',700.00);
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `venta_detalle`
--

LOCK TABLES `venta_detalle` WRITE;
/*!40000 ALTER TABLE `venta_detalle` DISABLE KEYS */;
INSERT INTO `venta_detalle` VALUES (1,1,1,2.00,350.00,250.0000,700.00);
/*!40000 ALTER TABLE `venta_detalle` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
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

-- Dump completed on 2025-10-28 19:20:11
