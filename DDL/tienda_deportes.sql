-- Adminer 5.4.2 MariaDB 11.8.6-MariaDB-ubu2404 dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

DROP TABLE IF EXISTS `CATEGORIA`;
CREATE TABLE `CATEGORIA` (
  `id_categoria` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(80) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_categoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `CLIENTE`;
CREATE TABLE `CLIENTE` (
  `id_cliente` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `direccion` varchar(200) DEFAULT NULL,
  `fecha_registro` date NOT NULL DEFAULT curdate(),
  PRIMARY KEY (`id_cliente`),
  UNIQUE KEY `uq_cliente_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `DEPORTE`;
CREATE TABLE `DEPORTE` (
  `id_deporte` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(80) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_deporte`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `DETALLE_VENTA`;
CREATE TABLE `DETALLE_VENTA` (
  `id_detalle` int(11) NOT NULL AUTO_INCREMENT,
  `id_venta` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_detalle`),
  KEY `fk_detalle_producto` (`id_producto`),
  KEY `idx_detalle_venta` (`id_venta`),
  CONSTRAINT `fk_detalle_producto` FOREIGN KEY (`id_producto`) REFERENCES `PRODUCTO` (`id_producto`) ON UPDATE CASCADE,
  CONSTRAINT `fk_detalle_venta` FOREIGN KEY (`id_venta`) REFERENCES `VENTA` (`id_venta`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `EMPLEADO`;
CREATE TABLE `EMPLEADO` (
  `id_empleado` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `direccion` varchar(200) DEFAULT NULL,
  `fecha_contrato` date NOT NULL,
  PRIMARY KEY (`id_empleado`),
  UNIQUE KEY `uq_empleado_usuario` (`id_usuario`),
  CONSTRAINT `fk_empleado_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `USUARIO` (`id_usuario`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `MARCA`;
CREATE TABLE `MARCA` (
  `id_marca` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `pais_origen` varchar(80) DEFAULT NULL,
  PRIMARY KEY (`id_marca`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `PRODUCTO`;
CREATE TABLE `PRODUCTO` (
  `id_producto` int(11) NOT NULL AUTO_INCREMENT,
  `id_categoria` int(11) NOT NULL,
  `id_proveedor` int(11) NOT NULL,
  `id_marca` int(11) NOT NULL,
  `id_deporte` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `talla` varchar(10) DEFAULT NULL,
  `color` varchar(40) DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `stock_minimo` int(11) NOT NULL DEFAULT 5,
  PRIMARY KEY (`id_producto`),
  KEY `fk_producto_proveedor` (`id_proveedor`),
  KEY `fk_producto_deporte` (`id_deporte`),
  KEY `idx_producto_categoria` (`id_categoria`),
  KEY `idx_producto_marca` (`id_marca`),
  CONSTRAINT `fk_producto_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `CATEGORIA` (`id_categoria`) ON UPDATE CASCADE,
  CONSTRAINT `fk_producto_deporte` FOREIGN KEY (`id_deporte`) REFERENCES `DEPORTE` (`id_deporte`) ON UPDATE CASCADE,
  CONSTRAINT `fk_producto_marca` FOREIGN KEY (`id_marca`) REFERENCES `MARCA` (`id_marca`) ON UPDATE CASCADE,
  CONSTRAINT `fk_producto_proveedor` FOREIGN KEY (`id_proveedor`) REFERENCES `PROVEEDOR` (`id_proveedor`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `PROVEEDOR`;
CREATE TABLE `PROVEEDOR` (
  `id_proveedor` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `contacto` varchar(100) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_proveedor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `USUARIO`;
CREATE TABLE `USUARIO` (
  `id_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `rol` enum('admin','empleado') NOT NULL DEFAULT 'empleado',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `uq_usuario_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `VENTA`;
CREATE TABLE `VENTA` (
  `id_venta` int(11) NOT NULL AUTO_INCREMENT,
  `id_cliente` int(11) NOT NULL,
  `id_empleado` int(11) NOT NULL,
  `fecha_venta` datetime NOT NULL DEFAULT current_timestamp(),
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `estado` enum('pendiente','completada','anulada') NOT NULL DEFAULT 'pendiente',
  PRIMARY KEY (`id_venta`),
  KEY `fk_venta_empleado` (`id_empleado`),
  KEY `idx_venta_fecha` (`fecha_venta`),
  KEY `idx_venta_cliente` (`id_cliente`),
  CONSTRAINT `fk_venta_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `CLIENTE` (`id_cliente`) ON UPDATE CASCADE,
  CONSTRAINT `fk_venta_empleado` FOREIGN KEY (`id_empleado`) REFERENCES `EMPLEADO` (`id_empleado`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP VIEW IF EXISTS `vista_stock_bajo`;
CREATE TABLE `vista_stock_bajo` (`id_producto` int(11), `nombre` varchar(150), `talla` varchar(10), `color` varchar(40), `stock` int(11), `stock_minimo` int(11), `marca` varchar(100), `deporte` varchar(80), `categoria` varchar(80), `proveedor` varchar(100));


DROP VIEW IF EXISTS `vista_ventas_detalle`;
CREATE TABLE `vista_ventas_detalle` (`id_venta` int(11), `fecha_venta` datetime, `total` decimal(10,2), `estado` enum('pendiente','completada','anulada'), `nombre_cliente` varchar(100), `email_cliente` varchar(150), `nombre_empleado` varchar(100), `nombre_producto` varchar(150), `talla` varchar(10), `color` varchar(40), `marca` varchar(100), `deporte` varchar(80), `categoria` varchar(80), `cantidad` int(11), `precio_unitario` decimal(10,2), `subtotal` decimal(10,2));


DROP TABLE IF EXISTS `vista_stock_bajo`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vista_stock_bajo` AS select `p`.`id_producto` AS `id_producto`,`p`.`nombre` AS `nombre`,`p`.`talla` AS `talla`,`p`.`color` AS `color`,`p`.`stock` AS `stock`,`p`.`stock_minimo` AS `stock_minimo`,`m`.`nombre` AS `marca`,`d`.`nombre` AS `deporte`,`cat`.`nombre` AS `categoria`,`pr`.`nombre` AS `proveedor` from ((((`PRODUCTO` `p` join `MARCA` `m` on(`p`.`id_marca` = `m`.`id_marca`)) join `DEPORTE` `d` on(`p`.`id_deporte` = `d`.`id_deporte`)) join `CATEGORIA` `cat` on(`p`.`id_categoria` = `cat`.`id_categoria`)) join `PROVEEDOR` `pr` on(`p`.`id_proveedor` = `pr`.`id_proveedor`)) where `p`.`stock` < `p`.`stock_minimo`;

DROP TABLE IF EXISTS `vista_ventas_detalle`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vista_ventas_detalle` AS select `v`.`id_venta` AS `id_venta`,`v`.`fecha_venta` AS `fecha_venta`,`v`.`total` AS `total`,`v`.`estado` AS `estado`,`c`.`nombre` AS `nombre_cliente`,`c`.`email` AS `email_cliente`,`u`.`nombre` AS `nombre_empleado`,`p`.`nombre` AS `nombre_producto`,`p`.`talla` AS `talla`,`p`.`color` AS `color`,`m`.`nombre` AS `marca`,`d`.`nombre` AS `deporte`,`cat`.`nombre` AS `categoria`,`dv`.`cantidad` AS `cantidad`,`dv`.`precio_unitario` AS `precio_unitario`,`dv`.`subtotal` AS `subtotal` from ((((((((`VENTA` `v` join `CLIENTE` `c` on(`v`.`id_cliente` = `c`.`id_cliente`)) join `EMPLEADO` `e` on(`v`.`id_empleado` = `e`.`id_empleado`)) join `USUARIO` `u` on(`e`.`id_usuario` = `u`.`id_usuario`)) join `DETALLE_VENTA` `dv` on(`v`.`id_venta` = `dv`.`id_venta`)) join `PRODUCTO` `p` on(`dv`.`id_producto` = `p`.`id_producto`)) join `MARCA` `m` on(`p`.`id_marca` = `m`.`id_marca`)) join `DEPORTE` `d` on(`p`.`id_deporte` = `d`.`id_deporte`)) join `CATEGORIA` `cat` on(`p`.`id_categoria` = `cat`.`id_categoria`));

-- 2026-04-21 02:49:26 UTC
