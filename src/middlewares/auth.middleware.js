import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      error: 'No autorizado',
      message: 'Token de autenticación no proporcionado'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'virtu_secret_default');
    
    // Obtener usuario con sus relaciones de curso y colegio
    const user = await prisma.usuario.findUnique({
      where: { id: decoded.id },
      include: {
        colegio: { select: { id: true, nombre: true } },
        curso: { select: { id: true, nombre: true } },
        cursosDocente: {
          include: {
            curso: { select: { id: true, nombre: true } }
          }
        }
      }
    });

    if (!user || !user.activo) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Usuario inactivo o no encontrado'
      });
    }

    // Normalizar la información del usuario en req.user
    req.user = {
      id: user.id,
      username: user.username,
      nombreCompleto: user.nombreCompleto,
      rol: user.rol,
      colegio: user.colegio,
      curso: user.rol === 'ESTUDIANTE' ? user.curso : null,
      cursos: user.rol === 'DOCENTE' ? user.cursosDocente.map(cd => cd.curso) : []
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado',
        message: 'La sesión ha expirado, por favor inicia sesión nuevamente'
      });
    }

    return res.status(403).json({
      error: 'Token inválido',
      message: 'El token proporcionado no es válido'
    });
  }
};
