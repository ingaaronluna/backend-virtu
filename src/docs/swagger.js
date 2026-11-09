export const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Virtu API - Documentación Interactiva',
    version: '1.2.0',
    description: `
API RESTful para la plataforma educativa **Virtu**.
Construida con Node.js, Express, Prisma ORM y MySQL (TiDB Cloud).

### Instrucciones de Autenticación:
1. Inicia sesión con el endpoint \`POST /api/auth/login\` usando las credenciales de prueba:
   * **Estudiante:** \`alumno1\` / \`Estudiante123!\`
   * **Docente:** \`profesor1\` / \`Docente123!\`
2. Copia el \`token\` devuelto en la respuesta.
3. Haz clic en el botón verde **Authorize** (arriba a la derecha), escribe tu token y haz clic en **Authorize**.
    `
  },
  servers: [
    {
      url: '/api',
      description: 'Servidor relativo'
    },
    {
      url: 'https://backend-virtu.onrender.com/api',
      description: 'Producción (Render)'
    },
    {
      url: 'http://localhost:3000/api',
      description: 'Desarrollo Local'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Ingresa tu token JWT obtenido en /auth/login'
      }
    }
  },
  paths: {
    '/auth/login': {
      post: {
        tags: ['Autenticación'],
        summary: 'Iniciar sesión (Estudiante o Docente)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                  username: { type: 'string', example: 'alumno1' },
                  password: { type: 'string', example: 'Estudiante123!' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Sesión iniciada exitosamente' },
          401: { description: 'Credenciales inválidas' }
        }
      }
    },
    '/auth/me': {
      get: {
        tags: ['Autenticación'],
        summary: 'Obtener datos del usuario autenticado según su rol (Req. 3.1.1)',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Datos del usuario' },
          401: { description: 'No autorizado' }
        }
      }
    },
    '/auth/register': {
      post: {
        tags: ['Autenticación'],
        summary: 'Registrar nuevo estudiante o docente',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'password', 'nombreCompleto', 'colegioId'],
                properties: {
                  username: { type: 'string', example: 'nuevo_alumno' },
                  password: { type: 'string', example: 'Pass123!' },
                  nombreCompleto: { type: 'string', example: 'Juan Pérez' },
                  rol: { type: 'string', enum: ['ESTUDIANTE', 'DOCENTE'], default: 'ESTUDIANTE' },
                  colegioId: { type: 'integer', example: 1 },
                  cursoId: { type: 'integer', example: 1 }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Usuario creado exitosamente' },
          409: { description: 'El nombre de usuario ya existe' }
        }
      }
    },
    '/contenidos': {
      get: {
        tags: ['Contenidos Académicos'],
        summary: 'Listar materias habilitadas (Biología, Cálculo, Física, Química, Inglés, Historia)',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Lista de materias con su resumen' }
        }
      }
    },
    '/contenidos/{slug}': {
      get: {
        tags: ['Contenidos Académicos'],
        summary: 'Obtener materia con sus unidades y lecciones ordenadas',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'slug', in: 'path', required: true, schema: { type: 'string', example: 'historia' } }
        ],
        responses: {
          200: { description: 'Detalle de materia con estado de avance' },
          403: { description: 'Materia deshabilitada para estudiantes' },
          404: { description: 'Materia no encontrada' }
        }
      }
    },
    '/lecciones/{id}': {
      get: {
        tags: ['Lecciones'],
        summary: 'Ver contenido de lección (Definición máx 10k chars, Ejemplo máx 2k chars)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', example: 1 } }
        ],
        responses: {
          200: { description: 'Detalle completo de la lección' },
          404: { description: 'Lección no encontrada' }
        }
      }
    },
    '/lecciones/{id}/marcar-estudiado': {
      post: {
        tags: ['Progreso Estudiante'],
        summary: 'Marcar lección manual (Req. 3.1.5 - SOLO si NO tiene cuestionario)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', example: 1 } }
        ],
        responses: {
          200: { description: 'Lección marcada como estudiada' },
          400: { description: 'Rechazado: La lección tiene cuestionario y debe aprobarse con 4/5' }
        }
      }
    },
    '/cuestionarios/{id}/iniciar': {
      post: {
        tags: ['Cuestionarios / Evaluación'],
        summary: 'Iniciar intento de evaluación (Req. 3.1.3 - 5 preguntas, 4 opciones)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', example: 1 } }
        ],
        responses: {
          201: { description: 'Intento creado con preguntas sin respuestas correctas' }
        }
      }
    },
    '/intentos/{id}/responder': {
      post: {
        tags: ['Cuestionarios / Evaluación'],
        summary: 'Confirmar respuesta secuencial paso a paso (Inmutable + Corrección inmediata)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', example: 1 } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['preguntaId', 'opcionSeleccionadaId'],
                properties: {
                  preguntaId: { type: 'integer', example: 1 },
                  opcionSeleccionadaId: { type: 'integer', example: 1 }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Resultado inmediato y explicación pedagógica' },
          400: { description: 'Respuesta ya confirmada previamente' }
        }
      }
    },
    '/intentos/{id}/finalizar': {
      post: {
        tags: ['Cuestionarios / Evaluación'],
        summary: 'Finalizar cuestionario, calcular nota y marcar lección estudiada si aprueba (>= 4/5)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', example: 1 } }
        ],
        responses: {
          200: { description: 'Calificación final, retroalimentación y avance' }
        }
      }
    },
    '/cuestionarios/{id}/historial': {
      get: {
        tags: ['Cuestionarios / Evaluación'],
        summary: 'Ver histórico de intentos del estudiante',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', example: 1 } }
        ],
        responses: {
          200: { description: 'Historial de notas del estudiante' }
        }
      }
    },
    '/estudiantes/progreso': {
      get: {
        tags: ['Progreso Estudiante'],
        summary: 'Ver porcentaje global de avance académico del estudiante logueado',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Resumen de avance global' }
        }
      }
    },
    '/glosarios/{materia}': {
      get: {
        tags: ['Glosarios Modulares'],
        summary: 'Listar o buscar en el glosario de una materia (?q=...)',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'materia',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              enum: ['historia', 'fisica', 'ingles', 'biologia', 'calculo', 'quimica'],
              example: 'historia'
            }
          },
          {
            name: 'q',
            in: 'query',
            required: false,
            schema: { type: 'string', example: 'Bastilla' },
            description: 'Texto a buscar sin distinguir mayúsculas'
          }
        ],
        responses: {
          200: { description: 'Resultados del glosario especializado' }
        }
      }
    },
    '/glosarios/historia/linea-tiempo/{id}': {
      get: {
        tags: ['Glosarios Modulares'],
        summary: 'Obtener hito histórico + 2 anteriores y 2 posteriores secuenciales (Req. 3.2.1)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', example: 1 } }
        ],
        responses: {
          200: { description: 'Línea de tiempo secuencial' }
        }
      }
    },
    '/docente/cursos': {
      get: {
        tags: ['Panel Docente'],
        summary: 'Listar cursos asignados al docente (Req. 3.1.6 - Solo lectura)',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Cursos del profesor' },
          403: { description: 'Solo rol DOCENTE' }
        }
      }
    },
    '/docente/cursos/{cursoId}/estudiantes': {
      get: {
        tags: ['Panel Docente'],
        summary: 'Listar estudiantes de un curso con su % de avance de Unidades Estudiadas',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'cursoId', in: 'path', required: true, schema: { type: 'integer', example: 1 } }
        ],
        responses: {
          200: { description: 'Listado de alumnos con porcentaje de avance y promedio' },
          403: { description: 'Sin permisos sobre el curso' }
        }
      }
    },
    '/docente/estudiantes/{estudianteId}/lecciones/{leccionId}': {
      get: {
        tags: ['Panel Docente'],
        summary: 'Ver reporte de aciertos y desaciertos por alumno y por lección',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'estudianteId', in: 'path', required: true, schema: { type: 'integer', example: 2 } },
          { name: 'leccionId', in: 'path', required: true, schema: { type: 'integer', example: 1 } }
        ],
        responses: {
          200: { description: 'Desglose detallado de aciertos y respuestas incorrectas' }
        }
      }
    }
  }
};
