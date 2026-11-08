import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'virtu_secret_default';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Da formato estándar a la información del usuario según su rol (Requisito 3.1.1)
 */
const formatUserProfile = (user) => {
  const baseProfile = {
    id: user.id,
    username: user.username,
    nombreCompleto: user.nombreCompleto,
    rol: user.rol,
    colegio: user.colegio ? { id: user.colegio.id, nombre: user.colegio.nombre } : null
  };

  if (user.rol === 'ESTUDIANTE') {
    return {
      ...baseProfile,
      curso: user.curso ? { id: user.curso.id, nombre: user.curso.nombre } : null
    };
  }

  // Si es DOCENTE, retorna su lista de múltiples cursos
  return {
    ...baseProfile,
    cursos: user.cursosDocente ? user.cursosDocente.map(cd => ({ id: cd.curso.id, nombre: cd.curso.nombre })) : []
  };
};

/**
 * Autentica un usuario con username y password
 */
export const login = async (username, password) => {
  if (!username || !password) {
    const error = new Error('Se requiere nombre de usuario y contraseña');
    error.statusCode = 400;
    throw error;
  }

  const user = await prisma.usuario.findUnique({
    where: { username },
    include: {
      colegio: true,
      curso: true,
      cursosDocente: {
        include: { curso: true }
      }
    }
  });

  if (!user) {
    const error = new Error('Credenciales inválidas');
    error.statusCode = 401;
    throw error;
  }

  if (!user.activo) {
    const error = new Error('La cuenta de usuario se encuentra inactiva');
    error.statusCode = 403;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    const error = new Error('Credenciales inválidas');
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      rol: user.rol
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    token,
    usuario: formatUserProfile(user)
  };
};

/**
 * Obtiene el perfil detallado del usuario autenticado
 */
export const getProfile = async (userId) => {
  const user = await prisma.usuario.findUnique({
    where: { id: userId },
    include: {
      colegio: true,
      curso: true,
      cursosDocente: {
        include: { curso: true }
      }
    }
  });

  if (!user) {
    const error = new Error('Usuario no encontrado');
    error.statusCode = 404;
    throw error;
  }

  return formatUserProfile(user);
};

/**
 * Registra un nuevo usuario (estudiante o docente)
 */
export const register = async ({
  username,
  password,
  nombreCompleto,
  rol = 'ESTUDIANTE',
  colegioId,
  cursoId = null,
  cursosIds = []
}) => {
  if (!username || !password || !nombreCompleto || !colegioId) {
    const error = new Error('Faltan campos obligatorios (username, password, nombreCompleto, colegioId)');
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await prisma.usuario.findUnique({ where: { username } });
  if (existingUser) {
    const error = new Error('El nombre de usuario ya está en uso');
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.$transaction(async (tx) => {
    const created = await tx.usuario.create({
      data: {
        username,
        password: hashedPassword,
        nombreCompleto,
        rol,
        colegioId: Number(colegioId),
        cursoId: rol === 'ESTUDIANTE' && cursoId ? Number(cursoId) : null
      }
    });

    if (rol === 'DOCENTE' && Array.isArray(cursosIds) && cursosIds.length > 0) {
      await tx.docenteCurso.createMany({
        data: cursosIds.map(cId => ({
          docenteId: created.id,
          cursoId: Number(cId)
        }))
      });
    }

    return tx.usuario.findUnique({
      where: { id: created.id },
      include: {
        colegio: true,
        curso: true,
        cursosDocente: { include: { curso: true } }
      }
    });
  });

  return formatUserProfile(newUser);
};
