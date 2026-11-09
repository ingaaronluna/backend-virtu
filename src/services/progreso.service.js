import prisma from '../config/db.js';

/**
 * Marcar lección como Estudiado manualmente (Req. 3.1.5)
 * Regla: SOLAMENTE si la lección NO TIENE CUESTIONARIO.
 */
export const marcarLeccionManual = async (leccionId, estudianteId) => {
  const leccion = await prisma.leccion.findUnique({
    where: { id: Number(leccionId) },
    include: {
      cuestionario: true,
      unidad: {
        include: {
          lecciones: { select: { id: true } }
        }
      }
    }
  });

  if (!leccion) {
    const error = new Error('Lección no encontrada');
    error.statusCode = 404;
    throw error;
  }

  // Regla estricta Requisito 3.1.5
  if (leccion.cuestionario && leccion.cuestionario.activo) {
    const error = new Error(
      'Esta lección posee un cuestionario. Debe aprobarse con al menos 4 aciertos de 5 para marcarse como estudiada'
    );
    error.statusCode = 400;
    throw error;
  }

  // Upsert progreso de la lección
  const progreso = await prisma.progresoLeccion.upsert({
    where: {
      estudianteId_leccionId: {
        estudianteId,
        leccionId: leccion.id
      }
    },
    update: {
      estado: 'ESTUDIADO',
      fechaCompletado: new Date()
    },
    create: {
      estudianteId,
      leccionId: leccion.id,
      estado: 'ESTUDIADO',
      fechaCompletado: new Date()
    }
  });

  // Verificar si la unidad completa pasó a estado ESTUDIADO (Req. 3.1.5)
  const todasLeccionesIds = leccion.unidad.lecciones.map(l => l.id);
  const totalEstudiadas = await prisma.progresoLeccion.count({
    where: {
      estudianteId,
      leccionId: { in: todasLeccionesIds },
      estado: 'ESTUDIADO'
    }
  });

  const unidadCompletada = totalEstudiadas === todasLeccionesIds.length;

  return {
    leccionId: leccion.id,
    titulo: leccion.titulo,
    estado: progreso.estado,
    fechaCompletado: progreso.fechaCompletado,
    unidadId: leccion.unidadId,
    unidadCompletada
  };
};

/**
 * Obtener resumen de progreso global del estudiante logueado
 */
export const getProgresoGlobal = async (estudianteId) => {
  const todasLecciones = await prisma.leccion.findMany({
    include: {
      unidad: {
        include: {
          contenido: true
        }
      }
    }
  });

  const progresos = await prisma.progresoLeccion.findMany({
    where: {
      estudianteId,
      estado: 'ESTUDIADO'
    }
  });

  const estudiadasIds = new Set(progresos.map(p => p.leccionId));
  const totalLecciones = todasLecciones.length;
  const totalEstudiadas = progresos.length;
  const porcentajeGlobal = totalLecciones > 0 
    ? Number(((totalEstudiadas / totalLecciones) * 100).toFixed(1)) 
    : 0;

  return {
    totalLecciones,
    totalEstudiadas,
    porcentajeGlobal,
    leccionesEstudiadasIds: Array.from(estudiadasIds)
  };
};
