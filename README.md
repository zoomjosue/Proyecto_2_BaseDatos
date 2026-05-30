# Proyecto 3 - Tienda de Inventario y Ventas

Sistema full-stack para inventario, productos, categorias, proveedores, clientes, empleados, ventas, detalle de ventas, stock y reportes. Esta version extiende el Proyecto 2 con seguridad real en MariaDB, roles del DBMS, sesiones, autorizacion por rol, ORM Sequelize, stored procedures y transacciones explicitas.

## Tecnologias utilizadas

- MariaDB 11
- Node.js 20, Express, express-session
- Sequelize ORM + mysql2
- React 18 + Vite
- Docker Compose

## Requisitos previos

- Docker Desktop o Docker Engine con Compose V2
- Puerto `3306`, `3000` y `5173` libres, o ajustar `.env`

## Como levantar desde cero

```bash
docker compose down -v
docker compose up --build
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:3000/health`  
Base de datos: `localhost:3306`

## Credenciales obligatorias

Base de datos:

- Usuario: `proy3`
- Contrasena: `secret`
- Base: `tienda_deportes`

Variables principales en `.env.example`:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER=proy3`
- `DB_PASSWORD=secret`
- `SESSION_SECRET`
- `BACKEND_PORT`
- `FRONTEND_PORT`

## Usuarios de prueba por rol

Todos usan contrasena `secret`.

| Email | Rol de aplicacion |
| --- | --- |
| `admin@tienda.com` | `rol_admin` |
| `gerente@tienda.com` | `rol_gerente` |
| `vendedor@tienda.com` | `rol_vendedor` |
| `inventario@tienda.com` | `rol_inventario` |
| `consulta@tienda.com` | `rol_consulta` |

## Roles reales del DBMS

El script `database/schema.sql` crea exactamente estos roles con `CREATE ROLE`:

1. `rol_admin`
2. `rol_gerente`
3. `rol_vendedor`
4. `rol_inventario`
5. `rol_consulta`

Tambien aplica `REVOKE`, `GRANT` granular por tabla/procedure y asigna `rol_admin` como rol por defecto al usuario DB `proy3` para que la aplicacion pueda operar.

## Tabla de permisos por rol

`rol_admin` tiene `ALL PRIVILEGES` sobre `tienda_deportes.*`, por lo que puede ejecutar cualquier operacion de lectura, escritura, administracion y ejecucion de procedures dentro del esquema del proyecto.

| Rol DBMS | Tabla o vista | SELECT | INSERT | UPDATE | DELETE | EXECUTE |
| --- | --- | --- | --- | --- | --- | --- |
| `rol_admin` | `tienda_deportes.*` | Si | Si | Si | Si | Si |
| `rol_gerente` | `PRODUCTO` | Si | No | No | No | No |
| `rol_gerente` | `CATEGORIA` | Si | No | No | No | No |
| `rol_gerente` | `MARCA` | Si | No | No | No | No |
| `rol_gerente` | `DEPORTE` | Si | No | No | No | No |
| `rol_gerente` | `PROVEEDOR` | Si | No | No | No | No |
| `rol_gerente` | `CLIENTE` | Si | No | No | No | No |
| `rol_gerente` | `VENTA` | Si | No | No | No | No |
| `rol_gerente` | `DETALLE_VENTA` | Si | No | No | No | No |
| `rol_gerente` | `vista_stock_bajo` | Si | No | No | No | No |
| `rol_gerente` | `vista_ventas_detalle` | Si | No | No | No | No |
| `rol_vendedor` | `PRODUCTO` | Si | No | No | No | No |
| `rol_vendedor` | `CATEGORIA` | Si | No | No | No | No |
| `rol_vendedor` | `MARCA` | Si | No | No | No | No |
| `rol_vendedor` | `DEPORTE` | Si | No | No | No | No |
| `rol_vendedor` | `CLIENTE` | Si | Si | No | No | No |
| `rol_vendedor` | `VENTA` | Si | Si | Si | No | No |
| `rol_vendedor` | `DETALLE_VENTA` | Si | Si | No | No | No |
| `rol_vendedor` | `EMPLEADO` | Si | No | No | No | No |
| `rol_vendedor` | `USUARIO` | Si | No | No | No | No |
| `rol_inventario` | `PRODUCTO` | Si | Si | Si | Si | No |
| `rol_inventario` | `CATEGORIA` | Si | Si | Si | Si | No |
| `rol_inventario` | `MARCA` | Si | Si | Si | Si | No |
| `rol_inventario` | `DEPORTE` | Si | Si | Si | Si | No |
| `rol_inventario` | `PROVEEDOR` | Si | Si | Si | Si | No |
| `rol_inventario` | `vista_stock_bajo` | Si | No | No | No | No |
| `rol_consulta` | `PRODUCTO` | Si | No | No | No | No |
| `rol_consulta` | `CATEGORIA` | Si | No | No | No | No |
| `rol_consulta` | `MARCA` | Si | No | No | No | No |
| `rol_consulta` | `DEPORTE` | Si | No | No | No | No |
| `rol_consulta` | `vista_stock_bajo` | Si | No | No | No | No |

Permisos de ejecucion de stored procedures por rol:

| Rol DBMS | Stored procedure | EXECUTE |
| --- | --- | --- |
| `rol_admin` | Todos los procedures de `tienda_deportes.*` | Si |
| `rol_gerente` | `sp_reporte_ventas_por_fecha` | Si |
| `rol_gerente` | `sp_producto_mas_vendido` | Si |
| `rol_vendedor` | `sp_registrar_venta` | Si |
| `rol_inventario` | `sp_actualizar_stock` | Si |
| `rol_inventario` | `sp_crear_producto_seguro` | Si |
| `rol_consulta` | `sp_producto_mas_vendido` | Si |

## Stored procedures implementados

| Procedure | Uso desde backend |
| --- | --- |
| `sp_registrar_venta` | `POST /api/ventas`; valida stock, inserta venta/detalle, descuenta stock |
| `sp_actualizar_stock` | `PUT /api/productos/:id/stock` y edicion de producto |
| `sp_reporte_ventas_por_fecha` | `GET /api/ventas/reporte` |
| `sp_producto_mas_vendido` | `GET /api/productos/mas-vendidos` |
| `sp_crear_producto_seguro` | `POST /api/productos` |

`sp_registrar_venta` usa `START TRANSACTION`, `COMMIT`, `ROLLBACK`, `FOR UPDATE` y un handler de excepciones. `sp_registrar_venta` y `sp_crear_producto_seguro` tienen parametros de entrada y salida.

## Operaciones CRUD que usan ORM

- Listar productos: `Producto.findAll` con asociaciones Sequelize.
- Editar producto: `Producto.findByPk` y `producto.update`.
- Crear cliente: `Cliente.create`.
- Registrar usuario: `Usuario.create`.

## Endpoints principales

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET|POST|PUT|DELETE /api/productos`
- `PUT /api/productos/:id/stock`
- `GET|POST|PUT|DELETE /api/clientes`
- `GET|POST /api/ventas`
- `PUT /api/ventas/:id/anular`
- `GET /api/ventas/reporte`
- `GET|POST /api/usuarios` solo admin
- `GET|POST|PUT|DELETE /api/categorias`, `/marcas`, `/deportes`, `/proveedores`

## Evidencia de transacciones y ROLLBACK

En `database/schema.sql`, `sp_registrar_venta` ejecuta:

```sql
START TRANSACTION;
-- valida cliente, empleado, detalle y stock con FOR UPDATE
-- inserta VENTA y DETALLE_VENTA
-- descuenta stock
COMMIT;
```

El handler:

```sql
DECLARE EXIT HANDLER FOR SQLEXCEPTION
BEGIN
  ROLLBACK;
  RESIGNAL;
END;
```

Si se intenta vender mas unidades que el stock disponible, el procedure lanza error y revierte la venta completa.

## Como probar cada rol

- Admin: iniciar sesion como `admin@tienda.com`, verificar que ve todo, puede crear productos, clientes, ventas, reportes y usuarios por API.
- Gerente: iniciar como `gerente@tienda.com`, verificar ventas/reportes/dashboard sin botones administrativos.
- Vendedor: iniciar como `vendedor@tienda.com`, registrar una venta y crear cliente; no debe ver reportes ni administrar productos.
- Inventario: iniciar como `inventario@tienda.com`, crear/editar/eliminar productos y consultar stock; no debe registrar ventas.
- Consulta: iniciar como `consulta@tienda.com`, solo debe ver dashboard de consulta, productos, stock bajo y reportes basicos, sin botones de escritura.

