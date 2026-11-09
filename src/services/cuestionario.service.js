import prisma from '../config/db.js';

/**
 * Iniciar un intento de cuestionario (Req. 3.1.3: exactamente 5 preguntas, 4 opciones cada una)
 */
export const iniciarIntento = async (cuestionarioId, estudianteId) => {
  const cuestionario = await prisma.cuestionario.findUnique({
    where: { id: Number(cuestionarioId) },
    include: {
      leccion: {
        include: {
          unidad: {
            include: { contenido: true }
          }
        }
      },
      preguntas: {
        orderBy: { orden: 'asc' },
        include: {
          opciones: {
            select: {
              id: true,
              texto: true
              // Se oculta intencionalmente 'esCorrecta' y 'explicacion' para evitar trampas en el cliente
            }
          }
        }
      }
    }
  });

  if (!cuestionario || !cuestionario.activo) {
    const error = new Error('Cuestionario no encontrado o inactivo');
    error.statusCode = 404;
    throw error;
  }

  if (!cuestionario.leccion.unidad.contenido.estaHabilitado) {
    const error = new Error('El contenido académico está deshabilitado');
    error.statusCode = 403;
    throw error;
  }

  // Contar intentos previos
  const totalIntentosPrevios = await prisma.intentoCuestionario.count({
    where: {
      cuestionarioId: cuestionario.id,
      estudianteId
    }
  });

  const numeroIntento = totalIntentosPrevios + 1;

  // Crear el nuevo intento en base de datos
  const nuevoIntento = await prisma.intentoCuestionario.create({
    data: {
      cuestionarioId: cuestionario.id,
      estudianteId,
      numeroIntento,
      aciertos: 0,
      calificacion: 0.00,
      aprobado: false,
      esNotaVigente: false
    }
  });

  return {
    intentoId: nuevoIntento.id,
    numeroIntento,
    tiempoLimiteSegundos: cuestionario.tiempoLimiteSegundos,
    totalPreguntas: cuestionario.preguntas.length,
    leccion: {
      id: cuestionario.leccion.id,
      titulo: cuestionario.leccion.titulo
    },
    preguntas: cuestionario.preguntas.map(p => ({
      id: p.id,
      orden: p.orden,
      enunciado: p.enunciado,
      opciones: p.opciones
    }))
  };
};

/**
 * Confirmar respuesta a una pregunta en wizard secuencial (Req. 3.1.3: inmutable + corrección inmediata)
 */
export const responderPregunta = async (intentoId, estudianteId, { preguntaId, opcionSeleccionadaId }) => {
  if (!preguntaId || !opcionSeleccionadaId) {
    const error = new Error('Se requiere preguntaId y opcionSeleccionadaId');
    error.statusCode = 400;
    throw error;
  }

  const intento = await prisma.intentoCuestionario.findUnique({
    where: { id: Number(intentoId) },
    include: {
      cuestionario: true
    }
  });

  if (!intento || intento.estudianteId !== estudianteId) {
    const error = new Error('Intento de cuestionario no encontrado o no autorizado');
    error.statusCode = 404;
    throw error;
  }

  // Verificar si ya fue respondida en este intento (Inmutabilidad)
  const yaRespondida = await prisma.respuestaEstudiante.findFirst({
    where: {
      intentoId: intento.id,
      preguntaId: Number(preguntaId)
    }
  });

  if (yaRespondida) {
    const error = new Error('Esta pregunta ya ha sido confirmada y no puede ser modificada');
    error.statusCode = 400;
    throw error;
  }

  // Obtener la opción elegida y la respuesta correcta
  const opcionElegida = await prisma.opcionRespuesta.findUnique({
    where: { id: Number(opcionSeleccionadaId) }
  });

  if (!opcionElegida || opcionElegida.preguntaId !== Number(preguntaId)) {
    const error = new Error('La opción seleccionada no pertenece a la pregunta especificada');
    error.statusCode = 400;
    throw error;
  }

  // Guardar la respuesta confirmada
  await prisma.respuestaEstudiante.create({
    data: {
      intentoId: intento.id,
      preguntaId: Number(preguntaId),
      opcionSeleccionadaId: opcionElegida.id,
      esCorrecta: opcionElegida.esCorrecta
    }
  });

  // Si fue incorrecta, obtener la explicación pedagógica y la opción correcta
  let opcionCorrecta = null;
  if (!opcionElegida.esCorrecta) {
    opcionCorrecta = await prisma.opcionRespuesta.findFirst({
      where: {
        preguntaId: Number(preguntaId),
        esCorrecta: true
      }
    });
  }

  const totalConfirmadas = await prisma.respuestaEstudiante.count({
    where: { intentoId: intento.id }
  });

  return {
    preguntaId: Number(preguntaId),
    esCorrecta: opcionElegida.esCorrecta,
    explicacion: opcionElegida.esCorrecta 
      ? (opcionElegida.explicacion || '¡Respuesta correcta!') 
      : (opcionCorrecta?.explicacion || 'Respuesta incorrecta.'),
    opcionCorrectaId: opcionElegida.esCorrecta ? opcionElegida.id : opcionCorrecta?.id,
    respuestasConfirmadas: totalConfirmadas,
    totalPreguntas: 5
  };
};

/**
 * Finalizar intento de cuestionario y calcular nota oficial
 * Reglas Req. 3.1.3 & 3.1.5:
 * - Aprobado con >= 4/5 aciertos.
 * - Lección se marca automáticamente como 'ESTUDIADO'.
 * - Cada nuevo intento reemplaza la nota vigente vista por el docente.
 */
export const finalizarIntento = async (intentoId, estudianteId) => {
  const intento = await prisma.intentoCuestionario.findUnique({
    where: { id: Number(intentoId) },
    include: {
      cuestionario: {
        include: {
          leccion: {
            include: { unidad: true }
          },
          preguntas: {
            include: {
              opciones: true
            }
          }
        }
      },
      respuestas: true
    }
  });

  if (!intento || intento.estudianteId !== estudianteId) {
    const error = new Error('Intento de cuestionario no encontrado');
    error.statusCode = 404;
    throw error;
  }

  // Calcular número de aciertos
  const aciertos = intento.respuestas.filter(r => r.esCorrecta).length;
  const totalPreguntas = intento.cuestionario.preguntas.length || 5;
  const aprobado = aciertos >= 4;

  // Calificación en escala 1.0 a 7.0 (o sobre 5)
  // Con 0 aciertos = 1.0, con 5 aciertos = 7.0
  const calificacion = Number((1.0 + (aciertos / totalPreguntas) * 6.0).toFixed(2));

  // Transacción: actualizar intentos anteriores y este intento
  const resultado = await prisma.$transaction(async (tx) => {
    // 1. Quitar vigencia de notas anteriores de este alumno en este cuestionario
    await tx.intentoCuestionario.updateMany({
      where: {
        cuestionarioId: intento.cuestionarioId,
        estudianteId,
        id: { not: intento.id }
      },
      data: { esNotaVigente: false }
    });

    // 2. Marcar este intento como la nota vigente
    const intentoActualizado = await tx.intentoCuestionario.update({
      where: { id: intento.id },
      data: {
        aciertos,
        calificacion,
        aprobado,
        esNotaVigente: true,
        fechaEjecucion: new Date()
      }
    });

    // 3. Si aprobó (>= 4 aciertos), marcar lección como ESTUDIADO automáticamente (Req. 3.1.5)
    let leccionActualizada = false;
    let unidadCompletada = false;

    if (aprobado) {
      await tx.progresoLeccion.upsert({
        where: {
          estudianteId_leccionId: {
            estudianteId,
            leccionId: intento.cuestionario.leccionId
          }
        },
        update: {
          estado: 'ESTUDIADO',
          fechaCompletado: new Date()
        },
        create: {
          estudianteId,
          leccionId: intento.cuestionario.leccionId,
          estado: 'ESTUDIADO',
          fechaCompletado: new Date()
        }
      });
      leccionActualizada = true;

      // Verificar si la unidad completa pasó a estado ESTUDIADO
      const todasLeccionesUnidad = await tx.leccion.findMany({
        where: { unidadId: intento.cuestionario.leccion.unidadId },
        select: { id: true }
      });

      const progresosEstudiados = await tx.progresoLeccion.count({
        where: {
          estudianteId,
          leccionId: { in: todasLeccionesUnidad.map(l => l.id) },
          estado: 'ESTUDIADO'
        }
      });

      unidadCompletada = progresosEstudiados === todasLeccionesUnidad.length;
    }

    return {
      intento: intentoActualizado,
      leccionActualizada,
      unidadCompletada
    };
  }, {
    maxWait: 10000,
    timeout: 20000
  });

  // Armar retroalimentación completa
  const retroalimentacion = intento.cuestionario.preguntas.map(pregunta => {
    const respuestaDada = intento.respuestas.find(r => r.preguntaId === pregunta.id);
    const opcionCorrecta = pregunta.opciones.find(o => o.esCorrecta);
    const opcionSeleccionada = pregunta.opciones.find(o => o.id === respuestaDada?.opcionSeleccionadaId);

    return {
      preguntaId: pregunta.id,
      enunciado: pregunta.enunciado,
      opcionSeleccionadaId: opcionSeleccionada ? opcionSeleccionada.id : null,
      opcionSeleccionadaTexto: opcionSeleccionada ? opcionSeleccionada.texto : null,
      opcionCorrectaId: opcionCorrecta ? opcionCorrecta.id : null,
      opcionCorrectaTexto: opcionCorrecta ? opcionCorrecta.texto : null,
      acerto: !!respuestaDada?.esCorrecta,
      solucion: opcionCorrecta?.explicacion || ''
    };
  });

  return {
    intentoId: resultado.intento.id,
    numeroIntento: resultado.intento.numeroIntento,
    aciertos,
    totalPreguntas,
    calificacion,
    aprobado,
    leccionCompletada: resultado.leccionActualizada,
    unidadCompletada: resultado.unidadCompletada,
    fechaEjecucion: resultado.intento.fechaEjecucion,
    retroalimentacion
  };
};

/**
 * Obtener historial de intentos de un estudiante en un cuestionario
 */
export const getHistorial = async (cuestionarioId, estudianteId) => {
  const intentos = await prisma.intentoCuestionario.findMany({
    where: {
      cuestionarioId: Number(cuestionarioId),
      estudianteId
    },
    orderBy: { numeroIntento: 'desc' },
    select: {
      id: true,
      numeroIntento: true,
      aciertos: true,
      calificacion: true,
      aprobado: true,
      esNotaVigente: true,
      fechaEjecucion: true
    }
  });

  return intentos;
};
