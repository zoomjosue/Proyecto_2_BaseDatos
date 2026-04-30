const express  = require('express');
const router   = express.Router();

const { authMiddleware, adminOnly } = require('../middleware/auth');
const { login }        = require('../controllers/authController');
const productoCtrl     = require('../controllers/productoController');
const clienteCtrl      = require('../controllers/clienteController');
const ventaCtrl        = require('../controllers/ventaController');
const { categoriaCtrl, marcaCtrl, deporteCtrl, proveedorCtrl, getEmpleados } =
  require('../controllers/catalogoController');

router.post('/auth/login', login);

router.use(authMiddleware);

// Productos
router.get('/productos/stock-bajo',   productoCtrl.getStockBajo);
router.get('/productos/mas-vendidos', productoCtrl.getMasVendidos);
router.get('/productos/sin-ventas',   productoCtrl.getSinVentas);
router.get('/productos',              productoCtrl.getAll);
router.get('/productos/:id',          productoCtrl.getById);
router.post('/productos',             productoCtrl.create);
router.put('/productos/:id',          productoCtrl.update);
router.delete('/productos/:id',       productoCtrl.remove);

// Clientes
router.get('/clientes/historial',             clienteCtrl.getConHistorial);
router.get('/clientes/por-deporte/:id_deporte', clienteCtrl.getPorDeporte);
router.get('/clientes',                       clienteCtrl.getAll);
router.get('/clientes/:id',                   clienteCtrl.getById);
router.post('/clientes',                      clienteCtrl.create);
router.put('/clientes/:id',                   clienteCtrl.update);
router.delete('/clientes/:id',                clienteCtrl.remove);

// Ventas
router.get('/ventas/reporte',      ventaCtrl.getReporte);
router.get('/ventas',              ventaCtrl.getAll);
router.get('/ventas/:id',          ventaCtrl.getById);
router.post('/ventas',             ventaCtrl.create);
router.put('/ventas/:id/anular',   ventaCtrl.anular);

// Catálogos 
router.get('/categorias',          categoriaCtrl.getAll);
router.post('/categorias',         categoriaCtrl.create);
router.put('/categorias/:id',      categoriaCtrl.update);
router.delete('/categorias/:id',   categoriaCtrl.remove);

router.get('/marcas',              marcaCtrl.getAll);
router.post('/marcas',             marcaCtrl.create);
router.put('/marcas/:id',          marcaCtrl.update);
router.delete('/marcas/:id',       marcaCtrl.remove);

router.get('/deportes',            deporteCtrl.getAll);
router.post('/deportes',           deporteCtrl.create);
router.put('/deportes/:id',        deporteCtrl.update);
router.delete('/deportes/:id',     deporteCtrl.remove);

router.get('/proveedores',         proveedorCtrl.getAll);
router.post('/proveedores',        proveedorCtrl.create);
router.put('/proveedores/:id',     proveedorCtrl.update);
router.delete('/proveedores/:id',  proveedorCtrl.remove);

router.get('/empleados',           getEmpleados);

module.exports = router;
