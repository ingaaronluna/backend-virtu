import prisma from '../config/db.js';

/**
 * Obtener cursos asignados al docente (Req. 3.1.6)
 */
export const getCursosDocente = async (docenteId) => {
  const docenteCursos = await prisma.docenteCurso.findMany({
    where: { docenteId },
    include: {
      curso: {
        include: {
          colegio: { select: { id: true, nombre: true } },
          _count: {
            select: { estudiantes: true }
          }
        }
      }
    }
  });

  return docenteCursos.map(dc => ({
    id: dc.curso.id,
    nombre: dc.curso.nombre,
    colegio: dc.curso.colegio,
    totalEstudiantes: dc.curso._count.estudiantes
  }));
};

/**
 * Listar estudiantes de un curso con su porcentaje de avance de Unidades de Estudio (Req. 3.1.6)
 */
export const getEstudiantesCurso = async (cursoId, docenteId) => {
  // Validar que el docente tenga asignado este curso
  const asignacion = await prisma.docenteCurso.findUnique({
    where: {
      docenteId_cursoId: {
        docenteId,
        cursoId: Number(cursoId)
      }
    },
    include: {
      curso: true
    }
  });

  if (!asignacion) {
    const error = new Error('No tienes permisos de supervisión sobre este curso');
    error.statusCode = 403;
    throw error;
  }

  // Obtener todas las unidades y sus lecciones para calcular el total
  const unidades = await prisma.unidad.findMany({
    include: {
      lecciones: { select: { id: true } }
    }
  });

  const totalUnidades = unidades.length;

  // Obtener estudiantes del curso
  const estudiantes = await prisma.usuario.findMany({
    where: {
      cursoId: Number(cursoId),
      rol: 'ESTUDIANTE',
      activo: true
    },
    include: {
      progresos: {
        where: { estado: 'ESTUDIADO' }
      },
      intentos: {
        where: { esNotaVigente: true }
      }
    },
    orderBy: { nombreCompleto: 'asc' }
  });

  const listaEstudiantes = estudiantes.map(est => {
    const leccionesEstudiadasIds = new Set(est.progresos.map(p => p.leccionId));

    // Contar cuántas unidades tienen TODAS sus lecciones en 'ESTUDIADO'
    let unidadesEstudiadasCount = 0;
    unidades.forEach(u => {
      if (u.lecciones.length > 0) {
        const todasCompletadas = u.lecciones.every(l => leccionesEstudiadasIds.has(l.id));
        if (todasCompletadas) unidadesEstudiadasCount++;
      }
    });

    const porcentajeAvance = totalUnidades > 0
      ? Number(((unidadesEstudiadasCount / totalUnidades) * 100).toFixed(1))
      : 0;

    // Promedio de notas vigentes en evaluaciones
    let promedioNotas = null;
    if (est.intentos.length > 0) {
      const suma = est.intentos.reduce((acc, curr) => acc + Number(curr.calificacion), 0);
      promedioNotas = Number((suma / est.intentos.length).toFixed(2));
    }

    return {
      estudianteId: est.id,
      nombreCompleto: est.nombreCompleto,
      username: est.username,
      totalUnidades,
      unidadesEstudiadas: unidadesEstudiadasCount,
      porcentajeAvance,
      promedioNotas
    };
  });

  return {
    curso: {
      id: asignacion.curso.id,
      nombre: asignacion.curso.nombre
    },
    totalEstudiantes: listaEstudiantes.length,
    estudiantes: listaEstudiantes
  };
};

/**
 * Ver aciertos y desaciertos de un estudiante por lección (Req. 3.1.6)
 */
export const getDesempenoEstudianteLeccion = async (estudianteId, leccionId, docenteId) => {
  // Validar permisos del docente sobre el estudiante
  const estudiante = await prisma.usuario.findUnique({
    where: { id: Number(estudianteId) },
    include: {
      curso: true
    }
  });

  if (!estudiante || estudiante.rol !== 'ESTUDIANTE') {
    const error = new Error('Estudiante no encontrado');
    error.statusCode = 404;
    throw error;
  }

  const tienePermiso = await prisma.docenteCurso.findUnique({
    where: {
      docenteId_cursoId: {
        docenteId,
        cursoId: estudiante.cursoId
      }
    }
  });

  if (!tienePermiso) {
    const error = new Error('No tienes asignado el curso de este estudiante');
    error.statusCode = 403;
    throw error;
  }

  // Obtener la lección
  const leccion = await prisma.leccion.findUnique({
    where: { id: Number(leccionId) },
    include: {
      cuestionario: {
        include: {
          preguntas: {
            orderBy: { orden: 'asc' },
            include: { opciones: true }
          }
        }
      }
    }
  });

  if (!leccion) {
    const error = new Error('Lección no encontrada');
    error.statusCode = 404;
    throw error;
  }

  // Obtener progreso de la lección
  const progreso = await prisma.progresoLeccion.findUnique({
    where: {
      estudianteId_leccionId: {
        estudianteId: estudiante.id,
        leccionId: leccion.id
      }
    }
  });

  // Si la lección no tiene cuestionario
  if (!leccion.cuestionario) {
    return {
      estudiante: {
        id: estudiante.id,
        nombreCompleto: estudiante.nombreCompleto,
        username: estudiante.username
      },
      leccion: {
        id: leccion.id,
        titulo: leccion.titulo
      },
      tieneCuestionario: false,
      estadoLeccion: progreso ? progreso.estado : 'PENDIENTE',
      fechaCompletado: progreso?.fechaCompletado || null
    };
  }

  // Obtener el último intento vigente del estudiante en este cuestionario
  const intentoVigente = await prisma.intentoCuestionario.findFirst({
    where: {
      cuestionarioId: leccion.cuestionario.id,
      estudianteId: estudiante.id,
      esNotaVigente: true
    },
    include: {
      respuestas: true
    }
  });

  if (!intentoVigente) {
    return {
      estudiante: {
        id: estudiante.id,
        nombreCompleto: estudiante.nombreCompleto,
        username: estudiante.username
      },
      leccion: {
        id: leccion.id,
        titulo: leccion.titulo
      },
      tieneCuestionario: true,
      estadoLeccion: progreso ? progreso.estado : 'PENDIENTE',
      intentosRealizados: 0,
      mensaje: 'El estudiante aún no ha rendido este cuestionario'
    };
  }

  // Desglosar preguntas, aciertos y desaciertos (Req. 3.1.6)
  const detallePreguntas = leccion.cuestionario.preguntas.map(pregunta => {
    const respuestaDada = intentoVigente.respuestas.find(r => r.preguntaId === pregunta.id);
    const opcionCorrecta = pregunta.opciones.find(o => o.esCorrecta);
    const opcionSeleccionada = pregunta.opciones.find(o => o.id === respuestaDada?.opcionSeleccionadaId);

    return {
      preguntaId: pregunta.id,
      orden: pregunta.orden,
      enunciado: pregunta.enunciado,
      acerto: !!respuestaDada?.esCorrecta,
      respuestaDadaTexto: opcionSeleccionada ? opcionSeleccionada.texto : 'Sin responder',
      respuestaCorrectaTexto: opcionCorrecta ? opcionCorrecta.texto : null,
      solucionExplicacion: opcionCorrecta?.explicacion || ''
    };
  });

  const desaciertosTotales = 5 - intentoVigente.aciertos;

  return {
    estudiante: {
      id: estudiante.id,
      nombreCompleto: estudiante.nombreCompleto,
      username: estudiante.username
    },
    leccion: {
      id: leccion.id,
      titulo: leccion.titulo
    },
    tieneCuestionario: true,
    estadoLeccion: progreso ? progreso.estado : 'PENDIENTE',
    notaVigente: Number(intentoVigente.calificacion),
    aprobado: intentoVigente.aprobado,
    aciertosTotales: intentoVigente.aciertos,
    desaciertosTotales,
    fechaEjecucion: intentoVigente.fechaEjecucion,
    detallePreguntas
  };
};
