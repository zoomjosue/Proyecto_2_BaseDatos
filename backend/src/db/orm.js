const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'tienda_deportes',
  process.env.DB_USER || 'proy3',
  process.env.DB_PASSWORD || 'secret',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    define: {
      freezeTableName: true,
      timestamps: false,
    },
  }
);

const Categoria = sequelize.define('CATEGORIA', {
  id_categoria: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: DataTypes.STRING,
  descripcion: DataTypes.STRING,
});

const Marca = sequelize.define('MARCA', {
  id_marca: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: DataTypes.STRING,
  pais_origen: DataTypes.STRING,
});

const Deporte = sequelize.define('DEPORTE', {
  id_deporte: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: DataTypes.STRING,
  descripcion: DataTypes.STRING,
});

const Proveedor = sequelize.define('PROVEEDOR', {
  id_proveedor: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: DataTypes.STRING,
  contacto: DataTypes.STRING,
  email: DataTypes.STRING,
  telefono: DataTypes.STRING,
});

const Producto = sequelize.define('PRODUCTO', {
  id_producto: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_categoria: DataTypes.INTEGER,
  id_proveedor: DataTypes.INTEGER,
  id_marca: DataTypes.INTEGER,
  id_deporte: DataTypes.INTEGER,
  nombre: DataTypes.STRING,
  descripcion: DataTypes.STRING,
  talla: DataTypes.STRING,
  color: DataTypes.STRING,
  precio: DataTypes.DECIMAL(10, 2),
  stock: DataTypes.INTEGER,
  stock_minimo: DataTypes.INTEGER,
});

const Cliente = sequelize.define('CLIENTE', {
  id_cliente: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: DataTypes.STRING,
  email: DataTypes.STRING,
  telefono: DataTypes.STRING,
  direccion: DataTypes.STRING,
  fecha_registro: DataTypes.DATEONLY,
});

const Usuario = sequelize.define('USUARIO', {
  id_usuario: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: DataTypes.STRING,
  email: DataTypes.STRING,
  password_hash: DataTypes.STRING,
  rol: DataTypes.STRING,
  created_at: DataTypes.DATE,
});

Producto.belongsTo(Categoria, { foreignKey: 'id_categoria', as: 'categoriaData' });
Producto.belongsTo(Marca, { foreignKey: 'id_marca', as: 'marcaData' });
Producto.belongsTo(Deporte, { foreignKey: 'id_deporte', as: 'deporteData' });
Producto.belongsTo(Proveedor, { foreignKey: 'id_proveedor', as: 'proveedorData' });

module.exports = {
  sequelize,
  Sequelize,
  Categoria,
  Marca,
  Deporte,
  Proveedor,
  Producto,
  Cliente,
  Usuario,
};
