--  Tienda de Deportes 
--  Usuario: proy2 | Contraseña: secret

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

-- Tablas

DROP TABLE IF EXISTS `DETALLE_VENTA`;
DROP TABLE IF EXISTS `VENTA`;
DROP TABLE IF EXISTS `PRODUCTO`;
DROP TABLE IF EXISTS `EMPLEADO`;
DROP TABLE IF EXISTS `USUARIO`;
DROP TABLE IF EXISTS `CLIENTE`;
DROP TABLE IF EXISTS `CATEGORIA`;
DROP TABLE IF EXISTS `MARCA`;
DROP TABLE IF EXISTS `DEPORTE`;
DROP TABLE IF EXISTS `PROVEEDOR`;

CREATE TABLE `CATEGORIA` (
  `id_categoria` int(11) NOT NULL AUTO_INCREMENT,
  `nombre`       varchar(80)  NOT NULL,
  `descripcion`  varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_categoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `DEPORTE` (
  `id_deporte`  int(11) NOT NULL AUTO_INCREMENT,
  `nombre`      varchar(80)  NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_deporte`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `MARCA` (
  `id_marca`    int(11) NOT NULL AUTO_INCREMENT,
  `nombre`      varchar(100) NOT NULL,
  `pais_origen` varchar(80)  DEFAULT NULL,
  PRIMARY KEY (`id_marca`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `PROVEEDOR` (
  `id_proveedor` int(11) NOT NULL AUTO_INCREMENT,
  `nombre`       varchar(100) NOT NULL,
  `contacto`     varchar(100) DEFAULT NULL,
  `email`        varchar(150) DEFAULT NULL,
  `telefono`     varchar(20)  DEFAULT NULL,
  PRIMARY KEY (`id_proveedor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `CLIENTE` (
  `id_cliente`      int(11) NOT NULL AUTO_INCREMENT,
  `nombre`          varchar(100) NOT NULL,
  `email`           varchar(150) DEFAULT NULL,
  `telefono`        varchar(20)  DEFAULT NULL,
  `direccion`       varchar(200) DEFAULT NULL,
  `fecha_registro`  date NOT NULL DEFAULT (curdate()),
  PRIMARY KEY (`id_cliente`),
  UNIQUE KEY `uq_cliente_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `USUARIO` (
  `id_usuario`    int(11) NOT NULL AUTO_INCREMENT,
  `nombre`        varchar(100) NOT NULL,
  `email`         varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `rol`           enum('admin','empleado') NOT NULL DEFAULT 'empleado',
  `created_at`    datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `uq_usuario_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `EMPLEADO` (
  `id_empleado`    int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario`     int(11) NOT NULL,
  `telefono`       varchar(20)  DEFAULT NULL,
  `direccion`      varchar(200) DEFAULT NULL,
  `fecha_contrato` date NOT NULL,
  PRIMARY KEY (`id_empleado`),
  UNIQUE KEY `uq_empleado_usuario` (`id_usuario`),
  CONSTRAINT `fk_empleado_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `USUARIO` (`id_usuario`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `PRODUCTO` (
  `id_producto`  int(11) NOT NULL AUTO_INCREMENT,
  `id_categoria` int(11) NOT NULL,
  `id_proveedor` int(11) NOT NULL,
  `id_marca`     int(11) NOT NULL,
  `id_deporte`   int(11) NOT NULL,
  `nombre`       varchar(150) NOT NULL,
  `descripcion`  varchar(255) DEFAULT NULL,
  `talla`        varchar(10)  DEFAULT NULL,
  `color`        varchar(40)  DEFAULT NULL,
  `precio`       decimal(10,2) NOT NULL,
  `stock`        int(11) NOT NULL DEFAULT 0,
  `stock_minimo` int(11) NOT NULL DEFAULT 5,
  PRIMARY KEY (`id_producto`),
  KEY `fk_producto_proveedor` (`id_proveedor`),
  KEY `fk_producto_deporte`   (`id_deporte`),
  KEY `idx_producto_categoria`(`id_categoria`),
  KEY `idx_producto_marca`    (`id_marca`),
  CONSTRAINT `fk_producto_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `CATEGORIA` (`id_categoria`) ON UPDATE CASCADE,
  CONSTRAINT `fk_producto_deporte`   FOREIGN KEY (`id_deporte`)   REFERENCES `DEPORTE`   (`id_deporte`)   ON UPDATE CASCADE,
  CONSTRAINT `fk_producto_marca`     FOREIGN KEY (`id_marca`)     REFERENCES `MARCA`     (`id_marca`)     ON UPDATE CASCADE,
  CONSTRAINT `fk_producto_proveedor` FOREIGN KEY (`id_proveedor`) REFERENCES `PROVEEDOR` (`id_proveedor`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `VENTA` (
  `id_venta`    int(11) NOT NULL AUTO_INCREMENT,
  `id_cliente`  int(11) NOT NULL,
  `id_empleado` int(11) NOT NULL,
  `fecha_venta` datetime NOT NULL DEFAULT current_timestamp(),
  `total`       decimal(10,2) NOT NULL DEFAULT 0.00,
  `estado`      enum('pendiente','completada','anulada') NOT NULL DEFAULT 'pendiente',
  PRIMARY KEY (`id_venta`),
  KEY `fk_venta_empleado` (`id_empleado`),
  KEY `idx_venta_fecha`   (`fecha_venta`),
  KEY `idx_venta_cliente` (`id_cliente`),
  CONSTRAINT `fk_venta_cliente`   FOREIGN KEY (`id_cliente`)  REFERENCES `CLIENTE`  (`id_cliente`)  ON UPDATE CASCADE,
  CONSTRAINT `fk_venta_empleado`  FOREIGN KEY (`id_empleado`) REFERENCES `EMPLEADO` (`id_empleado`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `DETALLE_VENTA` (
  `id_detalle`     int(11) NOT NULL AUTO_INCREMENT,
  `id_venta`       int(11) NOT NULL,
  `id_producto`    int(11) NOT NULL,
  `cantidad`       int(11) NOT NULL,
  `precio_unitario`decimal(10,2) NOT NULL,
  `subtotal`       decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_detalle`),
  KEY `fk_detalle_producto` (`id_producto`),
  KEY `idx_detalle_venta`   (`id_venta`),
  CONSTRAINT `fk_detalle_producto` FOREIGN KEY (`id_producto`) REFERENCES `PRODUCTO` (`id_producto`) ON UPDATE CASCADE,
  CONSTRAINT `fk_detalle_venta`    FOREIGN KEY (`id_venta`)    REFERENCES `VENTA`    (`id_venta`)    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices adicionales justificados 
-- Acelera búsquedas de productos por precio reportes de rango de precio
CREATE INDEX `idx_producto_precio` ON `PRODUCTO`(`precio`);
-- Acelera filtrado de ventas por estado reportes de ventas pendientes/completadas
CREATE INDEX `idx_venta_estado` ON `VENTA`(`estado`);
-- Acelera búsquedas de clientes por nombre
CREATE INDEX `idx_cliente_nombre` ON `CLIENTE`(`nombre`);

-- Vistas
DROP VIEW IF EXISTS `vista_stock_bajo`;
CREATE VIEW `vista_stock_bajo` AS
  SELECT p.id_producto, p.nombre, p.talla, p.color,
         p.stock, p.stock_minimo,
         m.nombre   AS marca,
         d.nombre   AS deporte,
         cat.nombre AS categoria,
         pr.nombre  AS proveedor
  FROM PRODUCTO p
  JOIN MARCA     m   ON p.id_marca     = m.id_marca
  JOIN DEPORTE   d   ON p.id_deporte   = d.id_deporte
  JOIN CATEGORIA cat ON p.id_categoria = cat.id_categoria
  JOIN PROVEEDOR pr  ON p.id_proveedor = pr.id_proveedor
  WHERE p.stock < p.stock_minimo;

DROP VIEW IF EXISTS `vista_ventas_detalle`;
CREATE VIEW `vista_ventas_detalle` AS
  SELECT v.id_venta, v.fecha_venta, v.total, v.estado,
         c.nombre  AS nombre_cliente,  c.email AS email_cliente,
         u.nombre  AS nombre_empleado,
         p.nombre  AS nombre_producto, p.talla, p.color,
         m.nombre  AS marca,
         d.nombre  AS deporte,
         cat.nombre AS categoria,
         dv.cantidad, dv.precio_unitario, dv.subtotal
  FROM VENTA v
  JOIN CLIENTE      c   ON v.id_cliente   = c.id_cliente
  JOIN EMPLEADO     e   ON v.id_empleado  = e.id_empleado
  JOIN USUARIO      u   ON e.id_usuario   = u.id_usuario
  JOIN DETALLE_VENTA dv ON v.id_venta     = dv.id_venta
  JOIN PRODUCTO     p   ON dv.id_producto = p.id_producto
  JOIN MARCA        m   ON p.id_marca     = m.id_marca
  JOIN DEPORTE      d   ON p.id_deporte   = d.id_deporte
  JOIN CATEGORIA    cat ON p.id_categoria = cat.id_categoria;

--  Datos de prueba 
INSERT INTO CATEGORIA (nombre, descripcion) VALUES
  ('Calzado','Zapatos, tenis y botas deportivas'),
  ('Ropa','Camisetas, pantalones y shorts'),
  ('Accesorios','Gorras, guantes y muñequeras'),
  ('Equipamiento','Balones, raquetas y otros implementos'),
  ('Protección','Cascos, rodilleras y coderas'),
  ('Hidratación','Termos y botellas deportivas'),
  ('Nutrición','Suplementos y bebidas energéticas'),
  ('Electrónica','Relojes, GPS y monitores de ritmo');

INSERT INTO DEPORTE (nombre, descripcion) VALUES
  ('Fútbol','Deporte de equipo con balón redondo'),
  ('Baloncesto','Deporte de equipo con canasta'),
  ('Natación','Deporte acuático'),
  ('Ciclismo','Deporte con bicicleta'),
  ('Tenis','Deporte de raqueta'),
  ('Running','Atletismo de fondo'),
  ('Gimnasio','Entrenamiento con pesas y máquinas'),
  ('Voleibol','Deporte de equipo con red'),
  ('Béisbol','Deporte con bate y pelota'),
  ('Artes Marciales','Lucha y defensa personal');

INSERT INTO MARCA (nombre, pais_origen) VALUES
  ('Nike','Estados Unidos'),
  ('Adidas','Alemania'),
  ('Puma','Alemania'),
  ('Under Armour','Estados Unidos'),
  ('New Balance','Estados Unidos'),
  ('Asics','Japón'),
  ('Mizuno','Japón'),
  ('Reebok','Reino Unido'),
  ('Umbro','Reino Unido'),
  ('Speedo','Australia');

INSERT INTO PROVEEDOR (nombre, contacto, email, telefono) VALUES
  ('Deportes Centrales S.A.','Carlos Méndez','contacto@deportescentrales.com','2222-1111'),
  ('Sport Supply Co.','Ana García','info@sportsupply.com','2333-2222'),
  ('Athletic Imports','Roberto Pérez','ventas@athleticimports.com','2444-3333'),
  ('ProSport Guatemala','María López','proveedor@prosportgt.com','2555-4444'),
  ('Distribuidora Olímpica','Juan Herrera','olimpica@deportes.com','2666-5555');

-- USUARIO y EMPLEADO son creados por el backend al primer arranque

INSERT INTO CLIENTE (nombre, email, telefono, direccion) VALUES
  ('Pedro Alvarado','pedro@gmail.com','5001-0001','Zona 1, Guatemala'),
  ('Marta Sánchez','marta@gmail.com','5001-0002','Zona 2, Guatemala'),
  ('Jorge Flores','jorge@gmail.com','5001-0003','Zona 3, Guatemala'),
  ('Claudia Morales','claudia@gmail.com','5001-0004','Zona 5, Guatemala'),
  ('Ernesto Vega','ernesto@gmail.com','5001-0005','Zona 6, Guatemala'),
  ('Laura Jiménez','laura@gmail.com','5001-0006','Zona 7, Guatemala'),
  ('Andrés Méndez','andres@gmail.com','5001-0007','Zona 9, Guatemala'),
  ('Fernanda Cruz','fernanda@gmail.com','5001-0008','Zona 11, Guatemala'),
  ('Ricardo Ortiz','ricardo@gmail.com','5001-0009','Zona 12, Guatemala'),
  ('Gabriela Lima','gabriela@gmail.com','5001-0010','Zona 13, Guatemala'),
  ('Héctor Paz','hector@gmail.com','5001-0011','Mixco'),
  ('Irene Godoy','irene@gmail.com','5001-0012','Villa Nueva'),
  ('Manuel Cifuentes','manuel@gmail.com','5001-0013','Quetzaltenango'),
  ('Patricia Leiva','patricia@gmail.com','5001-0014','Antigua Guatemala'),
  ('Santiago Batz','santiago@gmail.com','5001-0015','Zona 16, Guatemala');

INSERT INTO PRODUCTO (id_categoria, id_proveedor, id_marca, id_deporte, nombre, descripcion, talla, color, precio, stock, stock_minimo) VALUES
  (1,1,1,1,'Tenis Nike Mercurial','Tenis para fútbol sala','42','Rojo/Blanco',850.00,15,5),
  (1,1,2,1,'Adidas Predator','Zapato de fútbol con tacos','41','Negro/Dorado',920.00,10,5),
  (2,2,1,6,'Camiseta Nike Dri-FIT','Camiseta de running transpirable','M','Azul',250.00,30,8),
  (2,2,2,1,'Playera Adidas Climacool','Camiseta para fútbol','L','Verde',220.00,25,8),
  (4,3,9,1,'Balón Umbro Liga','Balón de fútbol tamaño 5','5','Blanco/Negro',180.00,20,5),
  (1,1,6,6,'Asics Gel-Nimbus','Zapato de running con amortiguación','43','Blanco/Plata',1100.00,8,4),
  (3,2,4,7,'Guantes UA Training','Guantes para gimnasio','L','Negro',120.00,3,5),
  (1,3,7,6,'Mizuno Wave Rider','Zapatilla de running','40','Azul/Verde',980.00,12,5),
  (2,4,3,2,'Short Puma Basketball','Short para baloncesto','M','Negro',190.00,18,6),
  (4,5,10,3,'Gafas Speedo Vanquisher','Gafas de natación','Única','Azul',95.00,22,5),
  (5,2,4,4,'Casco Ciclismo UA','Casco ligero para ciclismo','M','Rojo',450.00,7,3),
  (6,3,5,6,'Botella New Balance','Botella deportiva 750ml','Única','Negro',85.00,35,10),
  (4,1,2,5,'Raqueta Adidas Pro','Raqueta de tenis profesional','Única','Blanco',750.00,6,3),
  (2,4,8,7,'Leggings Reebok','Leggings para entrenamiento','S','Gris',280.00,20,6),
  (3,5,1,6,'Gorra Nike Running','Gorra con ventilación','Única','Blanco',95.00,2,5),
  (1,2,2,2,'Zapatilla Adidas Hoops','Zapatilla de baloncesto','44','Blanco/Azul',620.00,14,5),
  (4,3,1,8,'Balón Voleibol Nike','Balón oficial de voleibol','5','Amarillo/Azul',210.00,11,5),
  (2,1,3,10,'Kimono Puma Judo','Kimono para artes marciales','L','Blanco',380.00,9,4),
  (7,4,4,7,'Proteína UA Whey','Proteína en polvo 2kg','Única','Chocolate',520.00,16,5),
  (8,5,5,6,'Reloj GPS New Balance','Reloj con GPS para running','Única','Negro',1800.00,5,2),
  (1,1,1,6,'Nike Air Zoom Pegasus','Zapato de running clásico','41','Naranja',950.00,13,5),
  (2,2,6,3,'Traje de Baño Asics','Traje de baño competitivo','M','Azul marino',320.00,10,4),
  (4,3,2,9,'Bate Adidas Baseball','Bate de aluminio','Única','Plateado',420.00,8,3),
  (5,4,8,4,'Rodilleras Reebok','Set de rodilleras para ciclismo','M','Negro',150.00,6,4),
  (3,5,3,5,'Muñequeras Puma','Set de muñequeras','Única','Blanco',55.00,30,8),
  (1,1,2,1,'Adidas Copa Mundial','Clásico zapato de fútbol','43','Negro/Blanco',1050.00,9,4),
  (2,3,7,7,'Camiseta Mizuno Gym','Camiseta para entrenamiento','XL','Gris',195.00,22,6),
  (4,2,10,3,'Tabla de Nado Speedo','Tabla flotadora para natación','Única','Verde',75.00,25,8),
  (6,4,4,4,'Termo UA Bicicleta','Termo para porta-bidón','Única','Rojo',110.00,18,5),
  (8,5,5,1,'Monitor Frecuencia New Balance','Monitor cardíaco','Única','Negro',950.00,4,2);

SET foreign_key_checks = 1;

-- VENTA y DETALLE_VENTA son insertados por el backend 
