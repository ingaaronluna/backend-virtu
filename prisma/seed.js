import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando carga de datos iniciales (Seed de Virtu)...');

  // 1. Crear Colegio
  let colegio = await prisma.colegio.findFirst({
    where: { nombre: 'Colegio Virtu Central' }
  });

  if (!colegio) {
    colegio = await prisma.colegio.create({
      data: {
        nombre: 'Colegio Virtu Central'
      }
    });
    console.log(`✅ Colegio creado: ${colegio.nombre}`);
  }

  // 2. Crear Cursos
  let cursoA = await prisma.curso.findFirst({
    where: { nombre: '4to Medio A', colegioId: colegio.id }
  });

  if (!cursoA) {
    cursoA = await prisma.curso.create({
      data: {
        nombre: '4to Medio A',
        colegioId: colegio.id
      }
    });
    console.log(`✅ Curso creado: ${cursoA.nombre}`);
  }

  let cursoB = await prisma.curso.findFirst({
    where: { nombre: '4to Medio B', colegioId: colegio.id }
  });

  if (!cursoB) {
    cursoB = await prisma.curso.create({
      data: {
        nombre: '4to Medio B',
        colegioId: colegio.id
      }
    });
    console.log(`✅ Curso creado: ${cursoB.nombre}`);
  }

  // 3. Crear Usuarios de prueba
  // Docente: profesor1 (Password: Docente123!)
  const passwordDocente = await bcrypt.hash('Docente123!', 10);
  let docente = await prisma.usuario.findUnique({
    where: { username: 'profesor1' }
  });

  if (!docente) {
    docente = await prisma.usuario.create({
      data: {
        username: 'profesor1',
        password: passwordDocente,
        nombreCompleto: 'Prof. Carlos Mendoza',
        rol: 'DOCENTE',
        colegioId: colegio.id,
        activo: true
      }
    });

    // Asignar docente a ambos cursos (4to Medio A y 4to Medio B)
    await prisma.docenteCurso.createMany({
      data: [
        { docenteId: docente.id, cursoId: cursoA.id },
        { docenteId: docente.id, cursoId: cursoB.id }
      ],
      skipDuplicates: true
    });
    console.log(`✅ Docente creado: ${docente.nombreCompleto} asignado a ${cursoA.nombre} y ${cursoB.nombre}`);
  }

  // Estudiante: alumno1 (Password: Estudiante123!)
  const passwordEstudiante = await bcrypt.hash('Estudiante123!', 10);
  let estudiante = await prisma.usuario.findUnique({
    where: { username: 'alumno1' }
  });

  if (!estudiante) {
    estudiante = await prisma.usuario.create({
      data: {
        username: 'alumno1',
        password: passwordEstudiante,
        nombreCompleto: 'Sofía Valenzuela',
        rol: 'ESTUDIANTE',
        colegioId: colegio.id,
        cursoId: cursoA.id,
        activo: true
      }
    });
    console.log(`✅ Estudiante creado: ${estudiante.nombreCompleto} asignado a ${cursoA.nombre}`);
  }

  // 4. Crear los 6 Contenidos Académicos Core (Requisito 3.1.2)
  const materias = [
    {
      nombre: 'Biología',
      slug: 'biologia',
      resumen: 'Estudio de los seres vivos, genética, biodiversidad celular y funcionamiento de los ecosistemas.',
      orden: 1,
      unidad: {
        titulo: 'Unidad 1: Fundamentos de Genética',
        leccion: {
          titulo: 'Estructura molecular del ADN',
          definicion: 'El ADN (ácido desoxirribonucleico) es la molécula que contiene las instrucciones genéticas utilizadas en el desarrollo y funcionamiento de todos los seres vivos. Está compuesto por dos cadenas de nucleótidos unidas por puentes de hidrógeno formando una doble hélice.',
          ejemplo: 'En los seres humanos, el genoma está compuesto por aproximadamente 3.000 millones de pares de bases organizadas en 23 pares de cromosomas.'
        }
      }
    },
    {
      nombre: 'Cálculo',
      slug: 'calculo',
      resumen: 'Estudio de las funciones matemáticas, límites, derivadas, integrales y optimización matemática.',
      orden: 2,
      unidad: {
        titulo: 'Unidad 1: Derivadas y Razón de Cambio',
        leccion: {
          titulo: 'La Regla de la Cadena',
          definicion: 'La regla de la cadena es una fórmula fundamental para calcular la derivada de la composición de dos o más funciones diferenciables.',
          ejemplo: 'Para la función f(x) = (3x + 2)^2, aplicamos la regla de la cadena multiplicando la derivada exterior por la interior: f\'(x) = 2(3x + 2) * 3 = 18x + 12.'
        }
      }
    },
    {
      nombre: 'Física',
      slug: 'fisica',
      resumen: 'Comprensión de las leyes fundamentales del universo: mecánica clásica, leyes de movimiento, energía y ondas.',
      orden: 3,
      unidad: {
        titulo: 'Unidad 1: Dinámica Clásica',
        leccion: {
          titulo: 'Segunda Ley de Newton',
          definicion: 'La aceleración que experimenta un cuerpo es directamente proporcional a la fuerza neta que actúa sobre él e inversamente proporcional a su masa (F = m * a).',
          ejemplo: 'Si aplicas una fuerza de 100 Newtons sobre una caja de 20 kg, la aceleración producida será a = 100 N / 20 kg = 5 m/s².'
        }
      }
    },
    {
      nombre: 'Química',
      slug: 'quimica',
      resumen: 'Exploración de la estructura atómica, enlaces moleculares, estequiometría y reacciones químicas.',
      orden: 4,
      unidad: {
        titulo: 'Unidad 1: Estructura Atómica y Enlaces',
        leccion: {
          titulo: 'Enlaces Covalentes e Iónicos',
          definicion: 'Los enlaces químicos son fuerzas que mantienen unidos los átomos. El enlace iónico implica la transferencia completa de electrones, mientras que el covalente se basa en compartir electrones.',
          ejemplo: 'El cloruro de sodio (sal común, NaCl) es un enlace iónico, mientras que la molécula de agua (H2O) está unida mediante enlaces covalentes.'
        }
      }
    },
    {
      nombre: 'Inglés',
      slug: 'ingles',
      resumen: 'Desarrollo de competencias lingüísticas: gramática, vocabulario contextual, comprensión auditiva y lectora.',
      orden: 5,
      unidad: {
        titulo: 'Unit 1: Everyday Life and Routines',
        leccion: {
          titulo: 'Present Simple and Habits',
          definicion: 'The Present Simple tense is used to describe routine habits, universal truths, and permanent situations.',
          ejemplo: 'He always studies biology at the library before his calculus lecture.'
        }
      }
    },
    {
      nombre: 'Historia',
      slug: 'historia',
      resumen: 'Análisis de procesos históricos universales, hitos sociopolíticos, personajes clave y líneas de tiempo.',
      orden: 6,
      unidad: {
        titulo: 'Unidad 1: Las Grandes Revoluciones',
        leccion: {
          titulo: 'La Revolución Francesa',
          definicion: 'Movimiento político, social e ideológico desarrollado en Francia desde 1789 que derrocó a la monarquía absoluta del Antiguo Régimen e impulsó los ideales de libertad, igualdad y fraternidad.',
          ejemplo: 'La Toma de la Bastilla el 14 de julio de 1789 simbolizó la caída de la tiranía monárquica.'
        }
      }
    }
  ];

  for (const m of materias) {
    let contenido = await prisma.contenido.findUnique({
      where: { slug: m.slug }
    });

    if (!contenido) {
      contenido = await prisma.contenido.create({
        data: {
          nombre: m.nombre,
          slug: m.slug,
          resumen: m.resumen,
          orden: m.orden,
          estaHabilitado: true
        }
      });
      console.log(`✅ Contenido creado: ${contenido.nombre}`);
    }

    // Crear o buscar Unidad
    let unidad = await prisma.unidad.findFirst({
      where: { contenidoId: contenido.id, titulo: m.unidad.titulo }
    });

    if (!unidad) {
      unidad = await prisma.unidad.create({
        data: {
          contenidoId: contenido.id,
          titulo: m.unidad.titulo,
          orden: 1
        }
      });
      console.log(`  └─ Unidad creada: ${unidad.titulo}`);
    }

    // Crear o buscar Lección
    let leccion = await prisma.leccion.findFirst({
      where: { unidadId: unidad.id, titulo: m.unidad.leccion.titulo }
    });

    if (!leccion) {
      leccion = await prisma.leccion.create({
        data: {
          unidadId: unidad.id,
          titulo: m.unidad.leccion.titulo,
          definicion: m.unidad.leccion.definicion,
          ejemplo: m.unidad.leccion.ejemplo,
          orden: 1
        }
      });
      console.log(`     └─ Lección creada: ${leccion.titulo}`);
    }

    // 5. Crear Cuestionario de 5 preguntas de prueba para Historia (Requisito 3.1.3)
    if (m.slug === 'historia') {
      const cuestionarioExistente = await prisma.cuestionario.findUnique({
        where: { leccionId: leccion.id }
      });

      if (!cuestionarioExistente) {
        const cuestionario = await prisma.cuestionario.create({
          data: {
            leccionId: leccion.id,
            tiempoLimiteSegundos: 300,
            activo: true
          }
        });

        const preguntasData = [
          {
            enunciado: '¿En qué año comenzó la Revolución Francesa con la Toma de la Bastilla?',
            orden: 1,
            opciones: [
              { texto: '1789', esCorrecta: true, explicacion: 'La toma de la fortaleza de la Bastilla ocurrió el 14 de julio de 1789.' },
              { texto: '1776', esCorrecta: false, explicacion: '1776 corresponde a la Declaración de Independencia de los Estados Unidos.' },
              { texto: '1804', esCorrecta: false, explicacion: '1804 fue la coronación de Napoleón Bonaparte como emperador.' },
              { texto: '1815', esCorrecta: false, explicacion: '1815 fue la batalla de Waterloo.' }
            ]
          },
          {
            enunciado: '¿Cuál era el lema principal de la Revolución Francesa?',
            orden: 2,
            opciones: [
              { texto: 'Libertad, Igualdad, Fraternidad', esCorrecta: true, explicacion: 'Liberté, Égalité, Fraternité fue el lema emblemático.' },
              { texto: 'Orden y Progreso', esCorrecta: false, explicacion: 'Orden y Progreso es el lema positivista de la bandera de Brasil.' },
              { texto: 'Paz, Pan y Tierra', esCorrecta: false, explicacion: 'Paz, Pan y Tierra fue la consigna bolchevique de 1917.' },
              { texto: 'Dios, Patria y Rey', esCorrecta: false, explicacion: 'Esa consigna era lema de movimientos absolutistas monárquicos.' }
            ]
          },
          {
            enunciado: '¿Qué monarca gobernaba Francia al estallar la revolución?',
            orden: 3,
            opciones: [
              { texto: 'Luis XVI', esCorrecta: true, explicacion: 'Luis XVI era el rey junto a su esposa María Antonieta.' },
              { texto: 'Luis XIV', esCorrecta: false, explicacion: 'Luis XIV fue el Rey Sol (reinó en el siglo XVII e inicios del XVIII).' },
              { texto: 'Napoleón III', esCorrecta: false, explicacion: 'Napoleón III gobernó en el Segundo Imperio (siglo XIX).' },
              { texto: 'Carlos X', esCorrecta: false, explicacion: 'Carlos X gobernó durante la Restauración Borbónica.' }
            ]
          },
          {
            enunciado: '¿Cuál fue el documento fundamental aprobado por la Asamblea Nacional en 1789?',
            orden: 4,
            opciones: [
              { texto: 'Declaración de los Derechos del Hombre y del Ciudadano', esCorrecta: true, explicacion: 'Aprobada el 26 de agosto de 1789, consagró derechos naturales e inalienables.' },
              { texto: 'Carta Magna', esCorrecta: false, explicacion: 'La Carta Magna fue firmada en Inglaterra en 1215.' },
              { texto: 'Tratado de Versalles', esCorrecta: false, explicacion: 'El Tratado de Versalles puso fin a la Primera Guerra Mundial en 1919.' },
              { texto: 'Código Hammurabi', esCorrecta: false, explicacion: 'Es un código legal de la antigua Mesopotamia.' }
            ]
          },
          {
            enunciado: '¿Qué líder jacobino encabezó el período conocido como "El Terror"?',
            orden: 5,
            opciones: [
              { texto: 'Maximilien Robespierre', esCorrecta: true, explicacion: 'Robespierre lideró el Comité de Salvación Pública durante El Terror (1793-1794).' },
              { texto: 'Jean-Jacques Rousseau', esCorrecta: false, explicacion: 'Rousseau fue un filósofo ilustrado que murió antes de la revolución.' },
              { texto: 'Voltaire', esCorrecta: false, explicacion: 'Voltaire fue filósofo de la Ilustración fallecido en 1778.' },
              { texto: 'Marqués de La Fayette', esCorrecta: false, explicacion: 'La Fayette fue un noble liberal de la primera etapa moderada.' }
            ]
          }
        ];

        for (const p of preguntasData) {
          const preguntaCreada = await prisma.pregunta.create({
            data: {
              cuestionarioId: cuestionario.id,
              enunciado: p.enunciado,
              orden: p.orden
            }
          });

          await prisma.opcionRespuesta.createMany({
            data: p.opciones.map(opt => ({
              preguntaId: preguntaCreada.id,
              texto: opt.texto,
              esCorrecta: opt.esCorrecta,
              explicacion: opt.explicacion
            }))
          });
        }
        console.log(`     └─ Cuestionario creado con 5 preguntas para: ${leccion.titulo}`);
      }
    }

    // 6. Glosarios Modulares de muestra (Requisito 3.2)
    if (m.slug === 'historia') {
      const gItem = await prisma.glosarioHistoria.findFirst({ where: { contenidoId: contenido.id } });
      if (!gItem) {
        await prisma.glosarioHistoria.createMany({
          data: [
            {
              contenidoId: contenido.id,
              tematica: 'Revolución Francesa',
              datoHistorico: 'Toma de la Bastilla',
              definicion: 'Asalto popular a la fortaleza medieval de la Bastilla en París.',
              lineaTiempo: 'Inicio de la Revolución',
              esPersonaje: false,
              fechaHistorica: '14 de Julio de 1789',
              ordenCronologico: 1789
            },
            {
              contenidoId: contenido.id,
              tematica: 'Revolución Francesa',
              datoHistorico: 'Líder del Comité de Salvación Pública',
              definicion: 'Abogado y figura máxima del periodo del terror revolucionario.',
              lineaTiempo: 'Periodo del Terror',
              esPersonaje: true,
              fechaHistorica: '6 de Mayo de 1758 - 28 de Julio de 1794',
              ordenCronologico: 1794
            }
          ]
        });
        console.log(`     └─ Glosario de Historia poblado`);
      }
    }

    if (m.slug === 'biologia') {
      const gItem = await prisma.glosarioBiologia.findFirst({ where: { contenidoId: contenido.id } });
      if (!gItem) {
        await prisma.glosarioBiologia.create({
          data: {
            contenidoId: contenido.id,
            tematica: 'Genética',
            concepto: 'Genotipo',
            definicion: 'Conjunto de los genes y la información genética que posee un individuo en su ADN.',
            esFlashcard: true
          }
        });
        console.log(`     └─ Glosario de Biología poblado (Flashcard)`);
      }
    }

    if (m.slug === 'calculo') {
      const gItem = await prisma.glosarioCalculo.findFirst({ where: { contenidoId: contenido.id } });
      if (!gItem) {
        await prisma.glosarioCalculo.create({
          data: {
            contenidoId: contenido.id,
            tematica: 'Cálculo Diferencial',
            titulo: 'Definición formal de Derivada',
            definicion: 'Límite del cociente incremental cuando el incremento tiende a cero.',
            renderizacion: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}"
          }
        });
        console.log(`     └─ Glosario de Cálculo poblado (Fórmula LaTeX)`);
      }
    }

    if (m.slug === 'fisica') {
      const gItem = await prisma.glosarioFisica.findFirst({ where: { contenidoId: contenido.id } });
      if (!gItem) {
        await prisma.glosarioFisica.create({
          data: {
            contenidoId: contenido.id,
            tematica: 'Dinámica',
            concepto: 'Fuerza Centrípeta',
            definicion: 'Fuerza neta que actúa sobre un objeto para mantenerlo en una trayectoria circular.',
            linkVideo: 'https://www.youtube.com/watch?v=sample-video-fisica'
          }
        });
        console.log(`     └─ Glosario de Física poblado (Video)`);
      }
    }

    if (m.slug === 'ingles') {
      const gItem = await prisma.glosarioIngles.findFirst({ where: { contenidoId: contenido.id } });
      if (!gItem) {
        await prisma.glosarioIngles.create({
          data: {
            contenidoId: contenido.id,
            palabra: 'Achieve',
            definicion: 'Successfully reach a desired goal, result, or objective through hard work.',
            pronunciacion: '/əˈtʃiːv/',
            tiempoVerbal: 'Verb (Regular)',
            linkAudio: 'https://assets.virtu.edu/audio/achieve.mp3',
            ejemplo: 'The students worked very hard to achieve high scores in their evaluations.'
          }
        });
        console.log(`     └─ Glosario de Inglés poblado (Audio/Vocabulario)`);
      }
    }

    if (m.slug === 'quimica') {
      const gItem = await prisma.glosarioQuimica.findFirst({ where: { contenidoId: contenido.id } });
      if (!gItem) {
        await prisma.glosarioQuimica.create({
          data: {
            contenidoId: contenido.id,
            elementoQuimico: 'Oxígeno',
            nombre: 'Oxígeno',
            simbolo: 'O',
            numeroAtomico: 8,
            clasificacion: 'No metal',
            formulaEjemplo: 'H2O'
          }
        });
        console.log(`     └─ Glosario de Química poblado (Elemento Químico)`);
      }
    }
  }

  console.log('🎉 Seed de Virtu completado exitosamente.');
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
