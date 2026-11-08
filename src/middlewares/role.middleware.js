/**
 * Middleware para autorizar roles específicos (ESTUDIANTE, DOCENTE)
 * @param  {...string} allowedRoles
 */
export const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'No autenticado',
        message: 'Debes iniciar sesión para acceder a este recurso'
      });
    }

    if (!allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: `Permisos insuficientes. Se requiere rol: ${allowedRoles.join(' o ')}`
      });
    }

    next();
  };
};
