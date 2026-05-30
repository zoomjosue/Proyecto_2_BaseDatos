const ROLES = {
  ADMIN: 'rol_admin',
  GERENTE: 'rol_gerente',
  VENDEDOR: 'rol_vendedor',
  INVENTARIO: 'rol_inventario',
  CONSULTA: 'rol_consulta',
};

const permissionsByRole = {
  [ROLES.ADMIN]: ['*'],
  [ROLES.GERENTE]: [
    'dashboard:view',
    'productos:view',
    'clientes:view',
    'proveedores:view',
    'ventas:view',
    'reportes:view',
    'stock:view',
  ],
  [ROLES.VENDEDOR]: [
    'productos:view',
    'clientes:view',
    'clientes:create',
    'ventas:view',
    'ventas:create',
  ],
  [ROLES.INVENTARIO]: [
    'productos:view',
    'productos:create',
    'productos:update',
    'productos:delete',
    'categorias:manage',
    'marcas:manage',
    'deportes:manage',
    'proveedores:manage',
    'stock:view',
    'stock:update',
  ],
  [ROLES.CONSULTA]: [
    'dashboard:view',
    'productos:view',
    'categorias:view',
    'reportes:basic',
    'stock:view',
  ],
};

function hasPermission(role, permission) {
  const permissions = permissionsByRole[role] || [];
  return permissions.includes('*') || permissions.includes(permission);
}

module.exports = { ROLES, permissionsByRole, hasPermission };
