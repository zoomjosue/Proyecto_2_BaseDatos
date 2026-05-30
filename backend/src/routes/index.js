const express = require('express');
const router = express.Router();

const { requireAuth, requirePermission, requireRole } = require('../middleware/auth');
const authCtrl = require('../controllers/authController');
const productoCtrl = require('../controllers/productoController');
const clienteCtrl = require('../controllers/clienteController');
const ventaCtrl = require('../controllers/ventaController');
const { categoriaCtrl, marcaCtrl, deporteCtrl, proveedorCtrl, getEmpleados } =
  require('../controllers/catalogoController');

router.post('/auth/login', authCtrl.login);
router.post('/auth/logout', authCtrl.logout);
router.get('/auth/me', authCtrl.me);

router.use(requireAuth);

router.get('/usuarios', requireRole('rol_admin'), authCtrl.getUsuarios);
router.post('/usuarios', requireRole('rol_admin'), authCtrl.registerUser);

router.get('/productos/stock-bajo', requirePermission('stock:view'), productoCtrl.getStockBajo);
router.get('/productos/mas-vendidos', requirePermission('productos:view'), productoCtrl.getMasVendidos);
router.get('/productos/sin-ventas', requirePermission('reportes:view'), productoCtrl.getSinVentas);
router.get('/productos', requirePermission('productos:view'), productoCtrl.getAll);
router.get('/productos/:id', requirePermission('productos:view'), productoCtrl.getById);
router.post('/productos', requirePermission('productos:create'), productoCtrl.create);
router.put('/productos/:id', requirePermission('productos:update'), productoCtrl.update);
router.put('/productos/:id/stock', requirePermission('stock:update'), productoCtrl.updateStock);
router.delete('/productos/:id', requirePermission('productos:delete'), productoCtrl.remove);

router.get('/clientes/historial', requirePermission('clientes:view'), clienteCtrl.getConHistorial);
router.get('/clientes/por-deporte/:id_deporte', requirePermission('clientes:view'), clienteCtrl.getPorDeporte);
router.get('/clientes', requirePermission('clientes:view'), clienteCtrl.getAll);
router.get('/clientes/:id', requirePermission('clientes:view'), clienteCtrl.getById);
router.post('/clientes', requirePermission('clientes:create'), clienteCtrl.create);
router.put('/clientes/:id', requireRole('rol_admin'), clienteCtrl.update);
router.delete('/clientes/:id', requireRole('rol_admin'), clienteCtrl.remove);

router.get('/ventas/reporte', requirePermission('reportes:view'), ventaCtrl.getReporte);
router.get('/ventas', requirePermission('ventas:view'), ventaCtrl.getAll);
router.get('/ventas/:id', requirePermission('ventas:view'), ventaCtrl.getById);
router.post('/ventas', requirePermission('ventas:create'), ventaCtrl.create);
router.put('/ventas/:id/anular', requireRole('rol_admin', 'rol_gerente'), ventaCtrl.anular);

router.get('/categorias', requirePermission('productos:view'), categoriaCtrl.getAll);
router.post('/categorias', requirePermission('categorias:manage'), categoriaCtrl.create);
router.put('/categorias/:id', requirePermission('categorias:manage'), categoriaCtrl.update);
router.delete('/categorias/:id', requirePermission('categorias:manage'), categoriaCtrl.remove);

router.get('/marcas', requirePermission('productos:view'), marcaCtrl.getAll);
router.post('/marcas', requirePermission('marcas:manage'), marcaCtrl.create);
router.put('/marcas/:id', requirePermission('marcas:manage'), marcaCtrl.update);
router.delete('/marcas/:id', requirePermission('marcas:manage'), marcaCtrl.remove);

router.get('/deportes', requirePermission('productos:view'), deporteCtrl.getAll);
router.post('/deportes', requirePermission('deportes:manage'), deporteCtrl.create);
router.put('/deportes/:id', requirePermission('deportes:manage'), deporteCtrl.update);
router.delete('/deportes/:id', requirePermission('deportes:manage'), deporteCtrl.remove);

router.get('/proveedores', requirePermission('productos:view'), proveedorCtrl.getAll);
router.post('/proveedores', requirePermission('proveedores:manage'), proveedorCtrl.create);
router.put('/proveedores/:id', requirePermission('proveedores:manage'), proveedorCtrl.update);
router.delete('/proveedores/:id', requirePermission('proveedores:manage'), proveedorCtrl.remove);

router.get('/empleados', requirePermission('ventas:create'), getEmpleados);

module.exports = router;
