import prisma from '../config/db.js';

// ==========================================
// 1. GESTIÓN DE COLEGIOS
// ==========================================

export const getColegios = async () => {
  return prisma.colegio.findMany({
    include: {
      _count: {
        select: { cursos: true, usuarios: true }
      }
    },
    orderBy: { id: 'asc' }
  });
};

export const createColegio = async (nombre) => {
  if (!nombre) {
    const error = new Error('El nombre del colegio es obligatorio');
    error.statusCode = 400;
    throw error;
  }
  return prisma.colegio.create({ data: { nombre } });
};

export const updateColegio = async (id, nombre) => {
  return prisma.colegio.update({
    where: { id: Number(id) },
    data: { nombre }
  });
};

export const deleteColegio = async (id) => {
  return prisma.colegio.delete({
    where: { id: Number(id) }
  });
};

// ==========================================
// 2. GESTIÓN DE CURSOS
// ==========================================

export const getCursos = async () => {
  return prisma.curso.findMany({
    include: {
      colegio: { select: { id: true, nombre: true } },
      _count: {
        select: { estudiantes: true, docentes: true }
      }
    },
    orderBy: { id: 'asc' }
  });
};

export const createCurso = async ({ nombre, colegioId }) => {
  if (!nombre || !colegioId) {
    const error = new Error('Se requiere nombre del curso y colegioId');
    error.statusCode = 400;
    throw error;
  }
  return prisma.curso.create({
    data: {
      nombre,
      colegioId: Number(colegioId)
    },
    include: { colegio: true }
  });
};

export const updateCurso = async (id, { nombre, colegioId }) => {
  const data = {};
  if (nombre) data.nombre = nombre;
  if (colegioId) data.colegioId = Number(colegioId);

  return prisma.curso.update({
    where: { id: Number(id) },
    data,
    include: { colegio: true }
  });
};

export const deleteCurso = async (id) => {
  return prisma.curso.delete({
    where: { id: Number(id) }
  });
};

// ==========================================
// 3. GESTIÓN DE CONTENIDOS ACADÉMICOS (MATERIAS)
// ==========================================

export const createContenido = async ({ nombre, slug, resumen, estaHabilitado = true, orden = 0 }) => {
  if (!nombre || !slug || !resumen) {
    const error = new Error('Faltan campos obligatorios: nombre, slug y resumen');
    error.statusCode = 400;
    throw error;
  }

  return prisma.contenido.create({
    data: {
      nombre,
      slug: slug.toLowerCase(),
      resumen,
      estaHabilitado: Boolean(estaHabilitado),
      orden: Number(orden)
    }
  });
};

export const updateContenido = async (id, data) => {
  const updateData = {};
  if (data.nombre !== undefined) updateData.nombre = data.nombre;
  if (data.slug !== undefined) updateData.slug = data.slug.toLowerCase();
  if (data.resumen !== undefined) updateData.resumen = data.resumen;
  if (data.estaHabilitado !== undefined) updateData.estaHabilitado = Boolean(data.estaHabilitado);
  if (data.orden !== undefined) updateData.orden = Number(data.orden);

  return prisma.contenido.update({
    where: { id: Number(id) },
    data: updateData
  });
};

export const deleteContenido = async (id) => {
  return prisma.contenido.delete({
    where: { id: Number(id) }
  });
};

// ==========================================
// 4. GESTIÓN DE UNIDADES
// ==========================================

export const createUnidad = async ({ contenidoId, titulo, descripcion = null, orden = 0 }) => {
  if (!contenidoId || !titulo) {
    const error = new Error('Se requiere contenidoId y titulo');
    error.statusCode = 400;
    throw error;
  }

  return prisma.unidad.create({
    data: {
      contenidoId: Number(contenidoId),
      titulo,
      descripcion,
      orden: Number(orden)
    },
    include: { contenido: { select: { nombre: true, slug: true } } }
  });
};

export const updateUnidad = async (id, data) => {
  const updateData = {};
  if (data.titulo !== undefined) updateData.titulo = data.titulo;
  if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
  if (data.orden !== undefined) updateData.orden = Number(data.orden);
  if (data.contenidoId !== undefined) updateData.contenidoId = Number(data.contenidoId);

  return prisma.unidad.update({
    where: { id: Number(id) },
    data: updateData
  });
};

export const deleteUnidad = async (id) => {
  return prisma.unidad.delete({
    where: { id: Number(id) }
  });
};

// ==========================================
// 5. GESTIÓN DE LECCIONES
// ==========================================

export const createLeccion = async ({ unidadId, titulo, definicion, ejemplo, orden = 0 }) => {
  if (!unidadId || !titulo || !definicion || !ejemplo) {
    const error = new Error('Faltan campos obligatorios: unidadId, titulo, definicion, ejemplo');
    error.statusCode = 400;
    throw error;
  }

  return prisma.leccion.create({
    data: {
      unidadId: Number(unidadId),
      titulo,
      definicion,
      ejemplo,
      orden: Number(orden)
    },
    include: { unidad: true }
  });
};

export const updateLeccion = async (id, data) => {
  const updateData = {};
  if (data.titulo !== undefined) updateData.titulo = data.titulo;
  if (data.definicion !== undefined) updateData.definicion = data.definicion;
  if (data.ejemplo !== undefined) updateData.ejemplo = data.ejemplo;
  if (data.orden !== undefined) updateData.orden = Number(data.orden);
  if (data.unidadId !== undefined) updateData.unidadId = Number(data.unidadId);

  return prisma.leccion.update({
    where: { id: Number(id) },
    data: updateData
  });
};

export const deleteLeccion = async (id) => {
  return prisma.leccion.delete({
    where: { id: Number(id) }
  });
};

// ==========================================
// 6. GESTIÓN DE CUESTIONARIOS Y PREGUNTAS
// ==========================================

export const createCuestionario = async ({ leccionId, tiempoLimiteSegundos = 300 }) => {
  if (!leccionId) {
    const error = new Error('Se requiere leccionId');
    error.statusCode = 400;
    throw error;
  }

  return prisma.cuestionario.create({
    data: {
      leccionId: Number(leccionId),
      tiempoLimiteSegundos: Number(tiempoLimiteSegundos),
      activo: true
    },
    include: { leccion: true }
  });
};

export const createPreguntaConOpciones = async (cuestionarioId, { enunciado, orden = 1, opciones = [] }) => {
  if (!enunciado || !Array.isArray(opciones) || opciones.length !== 4) {
    const error = new Error('Cada pregunta debe incluir su enunciado y exactamente 4 opciones de respuesta');
    error.statusCode = 400;
    throw error;
  }

  const correctas = opciones.filter(o => o.esCorrecta);
  if (correctas.length !== 1) {
    const error = new Error('Debe haber exactamente una sola opción marcada como correcta (esCorrecta: true)');
    error.statusCode = 400;
    throw error;
  }

  return prisma.pregunta.create({
    data: {
      cuestionarioId: Number(cuestionarioId),
      enunciado,
      orden: Number(orden),
      opciones: {
        create: opciones.map(o => ({
          texto: o.texto,
          esCorrecta: Boolean(o.esCorrecta),
          explicacion: o.explicacion || null
        }))
      }
    },
    include: { opciones: true }
  });
};

export const deletePregunta = async (preguntaId) => {
  return prisma.pregunta.delete({
    where: { id: Number(preguntaId) }
  });
};

// ==========================================
// 7. GESTIÓN DE GLOSARIOS MODULARES
// ==========================================

export const createGlosarioItem = async (materiaSlug, data) => {
  const contenido = await prisma.contenido.findUnique({
    where: { slug: materiaSlug.toLowerCase() }
  });

  if (!contenido) {
    const error = new Error(`Materia '${materiaSlug}' no encontrada`);
    error.statusCode = 404;
    throw error;
  }

  const contenidoId = contenido.id;

  switch (materiaSlug.toLowerCase()) {
    case 'historia':
      return prisma.glosarioHistoria.create({
        data: {
          contenidoId,
          tematica: data.tematica,
          datoHistorico: data.datoHistorico,
          definicion: data.definicion,
          lineaTiempo: data.lineaTiempo,
          esPersonaje: Boolean(data.esPersonaje),
          fechaHistorica: data.fechaHistorica,
          ordenCronologico: Number(data.ordenCronologico || 0)
        }
      });

    case 'biologia':
      return prisma.glosarioBiologia.create({
        data: {
          contenidoId,
          tematica: data.tematica,
          concepto: data.concepto,
          definicion: data.definicion,
          esFlashcard: data.esFlashcard !== undefined ? Boolean(data.esFlashcard) : true
        }
      });

    case 'calculo':
      return prisma.glosarioCalculo.create({
        data: {
          contenidoId,
          tematica: data.tematica,
          titulo: data.titulo,
          definicion: data.definicion,
          renderizacion: data.renderizacion
        }
      });

    case 'fisica':
      return prisma.glosarioFisica.create({
        data: {
          contenidoId,
          tematica: data.tematica,
          concepto: data.concepto,
          definicion: data.definicion,
          linkVideo: data.linkVideo
        }
      });

    case 'ingles':
      return prisma.glosarioIngles.create({
        data: {
          contenidoId,
          palabra: data.palabra,
          definicion: data.definicion,
          pronunciacion: data.pronunciacion,
          tiempoVerbal: data.tiempoVerbal || null,
          linkAudio: data.linkAudio,
          ejemplo: data.ejemplo
        }
      });

    case 'quimica':
      return prisma.glosarioQuimica.create({
        data: {
          contenidoId,
          elementoQuimico: data.elementoQuimico,
          nombre: data.nombre,
          simbolo: data.simbolo,
          numeroAtomico: Number(data.numeroAtomico),
          clasificacion: data.clasificacion,
          formulaEjemplo: data.formulaEjemplo
        }
      });

    default:
      throw new Error(`Materia de glosario '${materiaSlug}' no soportada`);
  }
};

export const deleteGlosarioItem = async (materiaSlug, id) => {
  const itemId = Number(id);

  switch (materiaSlug.toLowerCase()) {
    case 'historia':
      return prisma.glosarioHistoria.delete({ where: { id: itemId } });
    case 'biologia':
      return prisma.glosarioBiologia.delete({ where: { id: itemId } });
    case 'calculo':
      return prisma.glosarioCalculo.delete({ where: { id: itemId } });
    case 'fisica':
      return prisma.glosarioFisica.delete({ where: { id: itemId } });
    case 'ingles':
      return prisma.glosarioIngles.delete({ where: { id: itemId } });
    case 'quimica':
      return prisma.glosarioQuimica.delete({ where: { id: itemId } });
    default:
      throw new Error(`Materia '${materiaSlug}' no válida`);
  }
};
