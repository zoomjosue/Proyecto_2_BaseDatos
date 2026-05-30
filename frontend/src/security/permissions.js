export const permissionsByRole = {
  rol_admin: ['*'],
  rol_gerente: ['dashboard:view', 'productos:view', 'clientes:view', 'ventas:view', 'reportes:view', 'stock:view'],
  rol_vendedor: ['productos:view', 'clientes:view', 'clientes:create', 'ventas:view', 'ventas:create'],
  rol_inventario: ['productos:view', 'productos:create', 'productos:update', 'productos:delete', 'stock:view'],
  rol_consulta: ['dashboard:view', 'productos:view', 'stock:view', 'reportes:basic'],
};

export function can(user, permission) {
  const permissions = permissionsByRole[user?.rol] || [];
  return permissions.includes('*') || permissions.includes(permission);
}
