const { hasPermission } = require('../security/permissions');

function requireAuth(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Sesion requerida' });
  }
  req.user = req.session.user;
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.rol)) {
      return res.status(403).json({ error: 'Rol sin autorizacion para esta accion' });
    }
    next();
  };
}

function requirePermission(permission) {
  return (req, res, next) => {
    if (!hasPermission(req.user?.rol, permission)) {
      return res.status(403).json({ error: 'Permiso denegado' });
    }
    next();
  };
}

const authMiddleware = requireAuth;
const adminOnly = requireRole('rol_admin');

module.exports = { requireAuth, requireRole, requirePermission, authMiddleware, adminOnly };
