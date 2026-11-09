import prisma from '../config/db.js';

/**
 * Listar todas las materias (Contenidos Académicos)
 * Requisito 3.1.2: Mostrar Biología, Cálculo, Física, Química, Inglés e Historia
 */
export const getAllContenidos = async (user) => {
  const whereClause = {};

  // Los estudiantes solo pueden ver contenidos habilitados
  if (user.rol === 'ESTUDIANTE') {
    whereClause.estaHabilitado = true;
  }

  const contenidos = await prisma.contenido.findMany({
    where: whereClause,
    orderBy: { orden: 'asc' },
    select: {
      id: true,
      nombre: true,
      slug: true,
      resumen: true,
      estaHabilitado: true,
      orden: true
    }
  });

  return contenidos;
};

/**
 * Obtener detalle de una materia por su slug, incluyendo Unidades, Lecciones y estado del estudiante
 */
export const getContenidoBySlug = async (slug, user) => {
  const contenido = await prisma.contenido.findUnique({
    where: { slug },
    include: {
      unidades: {
        orderBy: { orden: 'asc' },
        include: {
          lecciones: {
            orderBy: { orden: 'asc' },
            include: {
              cuestionario: {
                select: { id: true, activo: true, tiempoLimiteSegundos: true }
              }
            }
          }
        }
      }
    }
  });

  if (!contenido) {
    const error = new Error('Contenido académico no encontrado');
    error.statusCode = 404;
    throw error;
  }

  // Si está deshabilitado y es estudiante, denegar acceso (Req. 3.1.2)
  if (!contenido.estaHabilitado && user.rol === 'ESTUDIANTE') {
    const error = new Error('Este contenido académico se encuentra deshabilitado');
    error.statusCode = 403;
    throw error;
  }

  // Obtener progresos del estudiante si es ESTUDIANTE
  let progresosMap = new Map();
  if (user.rol === 'ESTUDIANTE') {
    const progresos = await prisma.progresoLeccion.findMany({
      where: { estudianteId: user.id }
    });
    progresos.forEach(p => progresosMap.set(p.leccionId, p.estado));
  }

  // Formatear unidades y calcular estados
  const unidadesFormateadas = contenido.unidades.map(unidad => {
    let todasLeccionesEstudiadas = unidad.lecciones.length > 0;

    const leccionesFormateadas = unidad.lecciones.map(leccion => {
      const estado = progresosMap.get(leccion.id) || 'PENDIENTE';
      if (estado !== 'ESTUDIADO') {
        todasLeccionesEstudiadas = false;
      }

      return {
        id: leccion.id,
        titulo: leccion.titulo,
        orden: leccion.orden,
        tieneCuestionario: !!(leccion.cuestionario && leccion.cuestionario.activo),
        cuestionarioId: leccion.cuestionario?.activo ? leccion.cuestionario.id : null,
        estado: user.rol === 'ESTUDIANTE' ? estado : undefined
      };
    });

    return {
      id: unidad.id,
      titulo: unidad.titulo,
      descripcion: unidad.descripcion,
      orden: unidad.orden,
      estadoUnidad: user.rol === 'ESTUDIANTE' 
        ? (todasLeccionesEstudiadas ? 'ESTUDIADO' : 'PENDIENTE') 
        : undefined,
      totalLecciones: leccionesFormateadas.length,
      lecciones: leccionesFormateadas
    };
  });

  return {
    id: contenido.id,
    nombre: contenido.nombre,
    slug: contenido.slug,
    resumen: contenido.resumen,
    estaHabilitado: contenido.estaHabilitado,
    unidades: unidadesFormateadas
  };
};

/**
 * Obtener detalle de una lección (Req. 3.1.2: Definición máx 10.000 chars, Ejemplo máx 2.000 chars)
 */
export const getLeccionById = async (leccionId, user) => {
  const leccion = await prisma.leccion.findUnique({
    where: { id: Number(leccionId) },
    include: {
      unidad: {
        include: {
          contenido: true
        }
      },
      cuestionario: {
        select: {
          id: true,
          activo: true,
          tiempoLimiteSegundos: true
        }
      }
    }
  });

  if (!leccion) {
    const error = new Error('Lección no encontrada');
    error.statusCode = 404;
    throw error;
  }

  if (!leccion.unidad.contenido.estaHabilitado && user.rol === 'ESTUDIANTE') {
    const error = new Error('El contenido académico de esta lección está deshabilitado');
    error.statusCode = 403;
    throw error;
  }

  let estadoEstudiante = 'PENDIENTE';
  if (user.rol === 'ESTUDIANTE') {
    const progreso = await prisma.progresoLeccion.findUnique({
      where: {
        estudianteId_leccionId: {
          estudianteId: user.id,
          leccionId: leccion.id
        }
      }
    });
    if (progreso) estadoEstudiante = progreso.estado;
  }

  return {
    id: leccion.id,
    titulo: leccion.titulo,
    definicion: leccion.definicion,
    ejemplo: leccion.ejemplo,
    orden: leccion.orden,
    unidad: {
      id: leccion.unidad.id,
      titulo: leccion.unidad.titulo,
      materia: leccion.unidad.contenido.nombre,
      materiaSlug: leccion.unidad.contenido.slug
    },
    tieneCuestionario: !!(leccion.cuestionario && leccion.cuestionario.activo),
    cuestionarioId: leccion.cuestionario?.activo ? leccion.cuestionario.id : null,
    tiempoLimiteSegundos: leccion.cuestionario?.activo ? leccion.cuestionario.tiempoLimiteSegundos : null,
    estadoEstudiante: user.rol === 'ESTUDIANTE' ? estadoEstudiante : undefined
  };
};
