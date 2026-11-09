import prisma from '../config/db.js';

/**
 * Módulo de Glosario de Términos (Req. 3.1.4 y 3.2)
 * Búsqueda textual no distingue mayúsculas en cualquier campo de contenido.
 */
export const getGlosarioByMateria = async (materiaSlug, queryText = '') => {
  const slug = materiaSlug.toLowerCase();
  const q = queryText.trim();

  // Validar que la materia exista y esté habilitada
  const contenido = await prisma.contenido.findUnique({
    where: { slug }
  });

  if (!contenido) {
    const error = new Error(`Materia '${materiaSlug}' no encontrada`);
    error.statusCode = 404;
    throw error;
  }

  let resultados = [];
  const contenidoId = contenido.id;

  switch (slug) {
    case 'historia': {
      const where = { contenidoId };
      if (q) {
        where.OR = [
          { tematica: { contains: q } },
          { datoHistorico: { contains: q } },
          { definicion: { contains: q } },
          { lineaTiempo: { contains: q } },
          { fechaHistorica: { contains: q } }
        ];
      }
      resultados = await prisma.glosarioHistoria.findMany({
        where,
        orderBy: { ordenCronologico: 'asc' }
      });
      break;
    }

    case 'fisica': {
      const where = { contenidoId };
      if (q) {
        where.OR = [
          { tematica: { contains: q } },
          { concepto: { contains: q } },
          { definicion: { contains: q } }
        ];
      }
      resultados = await prisma.glosarioFisica.findMany({
        where,
        orderBy: { id: 'asc' }
      });
      break;
    }

    case 'ingles': {
      const where = { contenidoId };
      if (q) {
        where.OR = [
          { palabra: { contains: q } },
          { definicion: { contains: q } },
          { pronunciacion: { contains: q } },
          { tiempoVerbal: { contains: q } },
          { ejemplo: { contains: q } }
        ];
      }
      resultados = await prisma.glosarioIngles.findMany({
        where,
        orderBy: { palabra: 'asc' }
      });
      break;
    }

    case 'biologia': {
      const where = { contenidoId };
      if (q) {
        where.OR = [
          { tematica: { contains: q } },
          { concepto: { contains: q } },
          { definicion: { contains: q } }
        ];
      }
      resultados = await prisma.glosarioBiologia.findMany({
        where,
        orderBy: { id: 'asc' }
      });
      break;
    }

    case 'calculo': {
      const where = { contenidoId };
      if (q) {
        where.OR = [
          { tematica: { contains: q } },
          { titulo: { contains: q } },
          { definicion: { contains: q } },
          { renderizacion: { contains: q } }
        ];
      }
      resultados = await prisma.glosarioCalculo.findMany({
        where,
        orderBy: { id: 'asc' }
      });
      break;
    }

    case 'quimica': {
      const where = { contenidoId };
      if (q) {
        where.OR = [
          { elementoQuimico: { contains: q } },
          { nombre: { contains: q } },
          { simbolo: { contains: q } },
          { clasificacion: { contains: q } },
          { formulaEjemplo: { contains: q } }
        ];
      }
      resultados = await prisma.glosarioQuimica.findMany({
        where,
        orderBy: { numeroAtomico: 'asc' }
      });
      break;
    }

    default: {
      const error = new Error(`No existe glosario modular configurado para '${materiaSlug}'`);
      error.statusCode = 400;
      throw error;
    }
  }

  return {
    materia: contenido.nombre,
    slug: contenido.slug,
    totalResultados: resultados.length,
    mensaje: resultados.length === 0 ? 'No se encontraron coincidencias' : undefined,
    data: resultados
  };
};

/**
 * Obtener acontecimiento histórico junto con los 2 anteriores y 2 posteriores secuenciales (Req. 3.2.1)
 */
export const getLineaTiempoSecuencial = async (itemId) => {
  const eventoActual = await prisma.glosarioHistoria.findUnique({
    where: { id: Number(itemId) }
  });

  if (!eventoActual) {
    const error = new Error('Acontecimiento histórico no encontrado');
    error.statusCode = 404;
    throw error;
  }

  // 2 acontecimientos anteriores en la línea de tiempo
  const anteriores = await prisma.glosarioHistoria.findMany({
    where: {
      contenidoId: eventoActual.contenidoId,
      ordenCronologico: { lt: eventoActual.ordenCronologico }
    },
    orderBy: { ordenCronologico: 'desc' },
    take: 2
  });

  // 2 acontecimientos posteriores en la línea de tiempo
  const posteriores = await prisma.glosarioHistoria.findMany({
    where: {
      contenidoId: eventoActual.contenidoId,
      ordenCronologico: { gt: eventoActual.ordenCronologico }
    },
    orderBy: { ordenCronologico: 'asc' },
    take: 2
  });

  return {
    eventoActual,
    anteriores: anteriores.reverse(), // Orden cronológico natural
    posteriores
  };
};
