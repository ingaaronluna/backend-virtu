export const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Virtu API - Documentación Interactiva y Contrato Frontend',
    version: '1.2.0',
    description: `
## 🎓 Plataforma Educativa Virtu - Backend API

Bienvenido a la documentación interactiva de la API de **Virtu**, diseñada para que el equipo de frontend desarrolle y pruebe los componentes de la aplicación.

### 🔑 Instrucciones de Autenticación Rápida:
1. En la sección **Autenticación**, abre el endpoint \`POST /auth/login\`.
2. Haz clic en **Try it out** y usa una de las cuentas de prueba precargadas:
   * **Cuenta Estudiante:** 
     * Usuario: \`alumno1\`
     * Contraseña: \`Estudiante123!\`
   * **Cuenta Docente:** 
     * Usuario: \`profesor1\`
     * Contraseña: \`Docente123!\`
3. Ejecuta la petición y copia el valor de la propiedad \`token\` devuelta en la respuesta.
4. Desplázate a la parte superior de esta página y haz clic en el botón verde **Authorize**.
5. Pega tu token en el campo de texto (sin la palabra 'Bearer') y haz clic en **Authorize**.
6. ¡Listo! Todos los endpoints que tengan el candado quedarán autorizados para probarlos directamente.

---

### 🏛️ Módulos de la Plataforma:
* **Autenticación y Sesión:** Login y control de roles (*Estudiante* pertenece a 1 curso; *Docente* a muchos cursos).
* **Contenidos Académicos:** Las 6 materias troncales (*Biología, Cálculo, Física, Química, Inglés, Historia*), organizadas en Unidades y Lecciones.
* **Lecciones:** Definición (hasta 10.000 caracteres) y ejemplos prácticos (hasta 2.000 caracteres).
* **Motor de Cuestionarios:** Formato wizard paso a paso (5 preguntas, 4 opciones), inmutabilidad de respuestas, retroalimentación inmediata, y aprobación con 4/5 aciertos.
* **Progreso Académico:** Marcado manual de lecciones (solo si no tienen cuestionario) y marcado automático al aprobar evaluaciones.
* **Glosarios Modulares:** Contenidos interactivos específicos por materia (Línea de tiempo cronológica, Flashcards, Fórmulas LaTeX, Videos, Audios y Elementos químicos).
* **Panel Docente:** Modo solo lectura para supervisar cursos, calcular el % de avance de Unidades y analizar aciertos/desaciertos por alumno.
    `
  },
  servers: [
    {
      url: '/api',
      description: 'Servidor Actual (Relativo)'
    },
    {
      url: 'https://backend-virtu.onrender.com/api',
      description: 'Servidor de Producción (Render)'
    },
    {
      url: 'http://localhost:3000/api',
      description: 'Servidor Local de Desarrollo'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Pega aquí el Token JWT obtenido al iniciar sesión en /auth/login'
      }
    }
  },
  paths: {
    // ==========================================
    // 1. AUTENTICACIÓN Y SESIÓN
    // ==========================================
    '/auth/login': {
      post: {
        tags: ['1. Autenticación y Perfil'],
        summary: 'Iniciar sesión (Estudiante o Docente)',
        description: `
Autentica al usuario mediante nombre de usuario y contraseña.

**Reglas de negocio (Req. 3.1.1):**
* Valida las credenciales con hash \`bcrypt\`.
* Si es **ESTUDIANTE**, retorna su colegio y su **único curso** (\`curso: { id, nombre }\`).
* Si es **DOCENTE**, retorna su colegio y la **lista de todos sus cursos** asignados (\`cursos: [ { id, nombre } ]\`).
* Genera un token JWT válido por 7 días necesario para todas las rutas privadas.
        `,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                  username: { 
                    type: 'string', 
                    example: 'alumno1',
                    description: 'Nombre de usuario único registrado' 
                  },
                  password: { 
                    type: 'string', 
                    example: 'Estudiante123!',
                    description: 'Contraseña de la cuenta' 
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Inicio de sesión exitoso. Retorna token y datos del usuario.',
            content: {
              'application/json': {
                example: {
                  status: 'success',
                  message: 'Inicio de sesión exitoso',
                  data: {
                    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    usuario: {
                      id: 2,
                      username: 'alumno1',
                      nombreCompleto: 'Sofía Valenzuela',
                      rol: 'ESTUDIANTE',
                      colegio: { id: 1, nombre: 'Colegio Virtu Central' },
                      curso: { id: 1, nombre: '4to Medio A' }
                    }
                  }
                }
              }
            }
          },
          400: {
            description: 'Faltan parámetros requeridos (username o password).',
            content: {
              'application/json': {
                example: {
                  error: 'Error',
                  message: 'Se requiere nombre de usuario y contraseña'
                }
              }
            }
          },
          401: {
            description: 'Credenciales inválidas (usuario o contraseña errónea).',
            content: {
              'application/json': {
                example: {
                  error: 'Error',
                  message: 'Credenciales inválidas'
                }
              }
            }
          }
        }
      }
    },
    '/auth/me': {
      get: {
        tags: ['1. Autenticación y Perfil'],
        summary: 'Consultar perfil del usuario en sesión',
        description: `
Obtiene la información estructurada del usuario logueado extrayendo su identidad desde el token JWT.

**Uso en Frontend:**
* Llamar a este endpoint cada vez que el usuario recarga la página (en el montaje de la app) para validar que el token sigue activo y recuperar su nombre, rol, colegio y cursos.
        `,
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Datos del usuario autenticado devueltos con éxito.',
            content: {
              'application/json': {
                example: {
                  status: 'success',
                  data: {
                    id: 2,
                    username: 'alumno1',
                    nombreCompleto: 'Sofía Valenzuela',
                    rol: 'ESTUDIANTE',
                    colegio: { id: 1, nombre: 'Colegio Virtu Central' },
                    curso: { id: 1, nombre: '4to Medio A' }
                  }
                }
              }
            }
          },
          401: {
            description: 'Token no proporcionado, inválido o expirado.',
            content: {
              'application/json': {
                example: {
                  error: 'No autorizado',
                  message: 'Token de autenticación no proporcionado'
                }
              }
            }
          }
        }
      }
    },
    '/auth/register': {
      post: {
        tags: ['1. Autenticación y Perfil'],
        summary: 'Registrar nuevo estudiante o docente',
        description: `
Crea un nuevo usuario en la base de datos.
* Si el rol es **ESTUDIANTE**, se vincula obligatoriamente al \`cursoId\`.
* Si el rol es **DOCENTE**, puede recibir una lista de \`cursosIds\` a los que quedará asignado.
        `,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'password', 'nombreCompleto', 'colegioId'],
                properties: {
                  username: { type: 'string', example: 'nuevo_estudiante' },
                  password: { type: 'string', example: 'ClaveSegura2026!' },
                  nombreCompleto: { type: 'string', example: 'Nicolás Morales' },
                  rol: { type: 'string', enum: ['ESTUDIANTE', 'DOCENTE'], default: 'ESTUDIANTE' },
                  colegioId: { type: 'integer', example: 1, description: 'ID del colegio existente' },
                  cursoId: { type: 'integer', example: 1, description: 'Obligatorio si el rol es ESTUDIANTE' },
                  cursosIds: { 
                    type: 'array', 
                    items: { type: 'integer' }, 
                    example: [1, 2],
                    description: 'Lista de IDs de cursos (solo si el rol es DOCENTE)' 
                  }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Usuario registrado exitosamente.',
            content: {
              'application/json': {
                example: {
                  status: 'success',
                  message: 'Usuario registrado exitosamente',
                  data: {
                    id: 3,
                    username: 'nuevo_estudiante',
                    nombreCompleto: 'Nicolás Morales',
                    rol: 'ESTUDIANTE',
                    colegio: { id: 1, nombre: 'Colegio Virtu Central' },
                    curso: { id: 1, nombre: '4to Medio A' }
                  }
                }
              }
            }
          },
          409: {
            description: 'El nombre de usuario ya se encuentra registrado.',
            content: {
              'application/json': {
                example: {
                  error: 'Error',
                  message: 'El nombre de usuario ya está en uso'
                }
              }
            }
          }
        }
      }
    },

    // ==========================================
    // 2. CONTENIDOS ACADÉMICOS
    // ==========================================
    '/contenidos': {
      get: {
        tags: ['2. Contenidos Académicos'],
        summary: 'Listar materias disponibles (Req. 3.1.2)',
        description: `
Muestra los Contenidos Académicos de la plataforma: **Biología, Cálculo, Física, Química, Inglés e Historia**.

**Reglas de negocio:**
* Incluye un resumen breve de cada materia.
* Si el usuario es **ESTUDIANTE**, solo se muestran los contenidos con \`estaHabilitado = true\`.
* Ordenados de acuerdo al campo numérico \`orden\`.
        `,
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Listado de materias obtenido exitosamente.',
            content: {
              'application/json': {
                example: {
                  status: 'success',
                  data: [
                    {
                      id: 1,
                      nombre: 'Biología',
                      slug: 'biologia',
                      resumen: 'Estudio de los seres vivos, genética, biodiversidad celular y funcionamiento de los ecosistemas.',
                      estaHabilitado: true,
                      orden: 1
                    },
                    {
                      id: 2,
                      nombre: 'Cálculo',
                      slug: 'calculo',
                      resumen: 'Estudio de las funciones matemáticas, límites, derivadas, integrales y optimización matemática.',
                      estaHabilitado: true,
                      orden: 2
                    },
                    {
                      id: 6,
                      nombre: 'Historia',
                      slug: 'historia',
                      resumen: 'Análisis de procesos históricos universales, hitos sociopolíticos, personajes clave y líneas de tiempo.',
                      estaHabilitado: true,
                      orden: 6
                    }
                  ]
                }
              }
            }
          }
        }
      }
    },
    '/contenidos/{slug}': {
      get: {
        tags: ['2. Contenidos Académicos'],
        summary: 'Obtener materia con su árbol de Unidades y Lecciones',
        description: `
Entrega la estructura jerárquica completa de la materia seleccionada: **Contenido $\\rightarrow$ Unidades $\\rightarrow$ Lecciones**.

**Comportamiento según el rol:**
* **Para Estudiantes:** 
  * Inyecta el estado de cada lección (\`estado: "PENDIENTE" | "ESTUDIADO"\`).
  * Inyecta el estado general de la unidad (\`estadoUnidad: "PENDIENTE" | "ESTUDIADO"\`), calculado automáticamente si todas las lecciones de la unidad están en \`ESTUDIADO\`.
  * Si la materia está deshabilitada (\`estaHabilitado: false\`), el sistema bloquea el acceso con código **403 Forbidden** (Req. 3.1.2).
        `,
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'slug',
            in: 'path',
            required: true,
            description: 'Identificador único de la materia (ej: historia, biologia, calculo, fisica, quimica, ingles)',
            schema: {
              type: 'string',
              enum: ['biologia', 'calculo', 'fisica', 'quimica', 'ingles', 'historia'],
              example: 'historia'
            }
          }
        ],
        responses: {
          200: {
            description: 'Estructura de la materia obtenida exitosamente.',
            content: {
              'application/json': {
                example: {
                  status: 'success',
                  data: {
                    id: 6,
                    nombre: 'Historia',
                    slug: 'historia',
                    resumen: 'Análisis de procesos históricos universales...',
                    estaHabilitado: true,
                    unidades: [
                      {
                        id: 1,
                        titulo: 'Unidad 1: Las Grandes Revoluciones',
                        descripcion: null,
                        orden: 1,
                        estadoUnidad: 'ESTUDIADO',
                        totalLecciones: 1,
                        lecciones: [
                          {
                            id: 1,
                            titulo: 'La Revolución Francesa',
                            orden: 1,
                            tieneCuestionario: true,
                            cuestionarioId: 1,
                            estado: 'ESTUDIADO'
                          }
                        ]
                      }
                    ]
                  }
                }
              }
            }
          },
          403: {
            description: 'El contenido académico se encuentra deshabilitado para estudiantes.',
            content: {
              'application/json': {
                example: {
                  error: 'Error',
                  message: 'Este contenido académico se encuentra deshabilitado'
                }
              }
            }
          },
          404: {
            description: 'Materia no encontrada.',
            content: {
              'application/json': {
                example: {
                  error: 'Error',
                  message: 'Contenido académico no encontrado'
                }
              }
            }
          }
        }
      }
    },

    // ==========================================
    // 3. LECCIONES DE ESTUDIO
    // ==========================================
    '/lecciones/{id}': {
      get: {
        tags: ['3. Lecciones de Estudio'],
        summary: 'Ver contenido y teoría de una lección (Req. 3.1.2)',
        description: `
Entrega la teoría detallada y ejemplos de la lección seleccionada.

**Especificaciones técnicas:**
* **Definición:** Texto formativo con soporte de hasta **10.000 caracteres**.
* **Ejemplo:** Caso resuelto con soporte de hasta **2.000 caracteres**.
* Indica si la lección posee cuestionario activo (\`tieneCuestionario\`) y el tiempo límite asignado en segundos.
* Muestra el estado del estudiante logueado (\`estadoEstudiante: "PENDIENTE" | "ESTUDIADO"\`).
        `,
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID numérico de la lección',
            schema: { type: 'integer', example: 1 }
          }
        ],
        responses: {
          200: {
            description: 'Detalle de la lección obtenido con éxito.',
            content: {
              'application/json': {
                example: {
                  status: 'success',
                  data: {
                    id: 1,
                    titulo: 'La Revolución Francesa',
                    definicion: 'Movimiento político, social e ideológico desarrollado en Francia desde 1789 que derrocó a la monarquía absoluta...',
                    ejemplo: 'La Toma de la Bastilla el 14 de julio de 1789 simbolizó la caída de la tiranía monárquica.',
                    orden: 1,
                    unidad: {
                      id: 1,
                      titulo: 'Unidad 1: Las Grandes Revoluciones',
                      materia: 'Historia',
                      materiaSlug: 'historia'
                    },
                    tieneCuestionario: true,
                    cuestionarioId: 1,
                    tiempoLimiteSegundos: 300,
                    estadoEstudiante: 'ESTUDIADO'
                  }
                }
              }
            }
          },
          404: {
            description: 'Lección no encontrada.',
            content: {
              'application/json': {
                example: {
                  error: 'Error',
                  message: 'Lección no encontrada'
                }
              }
            }
          }
        }
      }
    },
    '/lecciones/{id}/marcar-estudiado': {
      post: {
        tags: ['3. Lecciones de Estudio'],
        summary: 'Marcar lección manual (Req. 3.1.5 - SOLO sin cuestionario)',
        description: `
Permite a un estudiante marcar una lección como **"Estudiado"** de forma manual.

**⚠️ REGLA ESTRICTA DE NEGOCIO (Req. 3.1.5):**
* El estudiante **SOLAMENTE** puede marcar manual si la lección **NO TIENE CUESTIONARIO**.
* Si la lección tiene cuestionario, el backend devuelve **400 Bad Request** indicando que la lección se marcará de forma automática únicamente al aprobar el cuestionario con al menos 4 de 5 respuestas correctas.
        `,
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID de la lección a marcar',
            schema: { type: 'integer', example: 2 }
          }
        ],
        responses: {
          200: {
            description: 'Lección marcada como estudiada exitosamente.',
            content: {
              'application/json': {
                example: {
                  status: 'success',
                  message: 'Lección marcada como estudiada exitosamente',
                  data: {
                    leccionId: 2,
                    titulo: 'Estructura molecular del ADN',
                    estado: 'ESTUDIADO',
                    fechaCompletado: '2026-11-09T00:36:00.000Z',
                    unidadId: 2,
                    unidadCompletada: true
                  }
                }
              }
            }
          },
          400: {
            description: 'Rechazado: La lección tiene un cuestionario asignado.',
            content: {
              'application/json': {
                example: {
                  error: 'Error',
                  message: 'Esta lección posee un cuestionario. Debe aprobarse con al menos 4 aciertos de 5 para marcarse como estudiada'
                }
              }
            }
          }
        }
      }
    },

    // ==========================================
    // 4. MOTOR DE CUESTIONARIOS Y EVALUACIONES
    // ==========================================
    '/cuestionarios/{id}/iniciar': {
      post: {
        tags: ['4. Cuestionarios y Evaluaciones'],
        summary: '1. Iniciar intento de evaluación (Req. 3.1.3)',
        description: `
Crea un nuevo intento de evaluación para el estudiante y entrega las preguntas para el wizard secuencial.

**Especificaciones del cuestionario:**
* Cada cuestionario incluye exactamente **5 preguntas de opción única**, cada una con **4 opciones y una sola correcta**.
* Incluye el tiempo límite en segundos (\`tiempoLimiteSegundos\`).
* **Seguridad:** Las opciones enviadas al cliente **NO contienen** la respuesta correcta para evitar trampas en el navegador.
* El campo \`numeroIntento\` se incrementa automáticamente en cada ejecución.
        `,
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID del cuestionario',
            schema: { type: 'integer', example: 1 }
          }
        ],
        responses: {
          201: {
            description: 'Intento creado con éxito. Retorna preguntas y opciones sin respuestas.',
            content: {
              'application/json': {
                example: {
                  status: 'success',
                  message: 'Intento de cuestionario iniciado',
                  data: {
                    intentoId: 3,
                    numeroIntento: 3,
                    tiempoLimiteSegundos: 300,
                    totalPreguntas: 5,
                    leccion: { id: 1, titulo: 'La Revolución Francesa' },
                    preguntas: [
                      {
                        id: 1,
                        orden: 1,
                        enunciado: '¿En qué año comenzó la Revolución Francesa con la Toma de la Bastilla?',
                        opciones: [
                          { id: 1, texto: '1789' },
                          { id: 2, texto: '1776' },
                          { id: 3, texto: '1804' },
                          { id: 4, texto: '1815' }
                        ]
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      }
    },
    '/intentos/{id}/responder': {
      post: {
        tags: ['4. Cuestionarios y Evaluaciones'],
        summary: '2. Confirmar respuesta en el wizard (Inmutable + Corrección inmediata)',
        description: `
Permite al estudiante confirmar su respuesta a una pregunta en el asistente secuencial (pantalla a pantalla).

**Reglas de negocio (Req. 3.1.3):**
* **Inmutabilidad:** Una vez confirmada, no puede cambiarse y queda registrada en la base de datos.
* **Corrección inmediata:** El backend valida de inmediato y responde si la respuesta fue correcta (\`esCorrecta: true\`) o incorrecta (\`esCorrecta: false\`).
* **Solución pedagógica:** Si el estudiante marca una opción incorrecta, el backend le entrega la explicación y solución de la respuesta.
        `,
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID del intento en curso (intentoId obtenido al iniciar)',
            schema: { type: 'integer', example: 3 }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['preguntaId', 'opcionSeleccionadaId'],
                properties: {
                  preguntaId: { type: 'integer', example: 1, description: 'ID de la pregunta respondida' },
                  opcionSeleccionadaId: { type: 'integer', example: 1, description: 'ID de la opción elegida por el alumno' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Respuesta registrada y corregida con retroalimentación inmediata.',
            content: {
              'application/json': {
                example: {
                  status: 'success',
                  data: {
                    preguntaId: 1,
                    esCorrecta: true,
                    explicacion: 'La toma de la fortaleza de la Bastilla ocurrió el 14 de julio de 1789.',
                    opcionCorrectaId: 1,
                    respuestasConfirmadas: 1,
                    totalPreguntas: 5
                  }
                }
              }
            }
          },
          400: {
            description: 'La pregunta ya fue confirmada previamente o parámetros inválidos.',
            content: {
              'application/json': {
                example: {
                  error: 'Error',
                  message: 'Esta pregunta ya ha sido confirmada y no puede ser modificada'
                }
              }
            }
          }
        }
      }
    },
    '/intentos/{id}/finalizar': {
      post: {
        tags: ['4. Cuestionarios y Evaluaciones'],
        summary: '3. Finalizar cuestionario, calcular nota y marcar avance automático',
        description: `
Cierra el intento de cuestionario tras responder la quinta pregunta o al agotarse el tiempo.

**Reglas de negocio (Req. 3.1.3 y 3.1.5):**
* **Cálculo de aciertos:** Muestra el resultado final (número de aciertos sobre 5) y la nota.
* **Aprobación:** La lección se aprueba si el alumno acierta al menos **4 de las 5 preguntas** (\`aciertos >= 4\`).
* **Progreso automático:** Al aprobar, el sistema marca automáticamente la lección como **"ESTUDIADO"**. Si todas las lecciones de la unidad quedan estudiadas, la Unidad se marca como estudiada.
* **Reemplazo de nota oficial:** Cada nuevo intento reemplaza a la nota anterior para la evaluación general vista por el docente (\`esNotaVigente: true\`).
* **Reintentos ilimitados:** Si no aprueba, puede reintentar el cuestionario sin límite de intentos.
        `,
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID del intento a finalizar',
            schema: { type: 'integer', example: 3 }
          }
        ],
        responses: {
          200: {
            description: 'Cuestionario calificado con retroalimentación completa de aciertos y desaciertos.',
            content: {
              'application/json': {
                example: {
                  status: 'success',
                  message: 'Cuestionario finalizado exitosamente',
                  data: {
                    intentoId: 3,
                    numeroIntento: 3,
                    aciertos: 5,
                    totalPreguntas: 5,
                    calificacion: 7.0,
                    aprobado: true,
                    leccionCompletada: true,
                    unidadCompletada: true,
                    fechaEjecucion: '2026-11-09T00:36:00.000Z',
                    retroalimentacion: [
                      {
                        preguntaId: 1,
                        enunciado: '¿En qué año comenzó la Revolución Francesa?',
                        opcionSeleccionadaId: 1,
                        opcionSeleccionadaTexto: '1789',
                        opcionCorrectaId: 1,
                        opcionCorrectaTexto: '1789',
                        acerto: true,
                        solucion: 'La toma de la Bastilla ocurrió el 14 de julio de 1789.'
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      }
    },
    '/cuestionarios/{id}/historial': {
      get: {
        tags: ['4. Cuestionarios y Evaluaciones'],
        summary: 'Ver histórico de intentos del estudiante',
        description: `
Permite al estudiante consultar todas las veces que ha realizado el cuestionario, mostrando número de intento, aciertos, calificación obtenida, fecha y cuál es la nota vigente para el docente.
        `,
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID del cuestionario',
            schema: { type: 'integer', example: 1 }
          }
        ],
        responses: {
          200: {
            description: 'Historial de notas obtenido con éxito.',
            content: {
              'application/json': {
                example: {
                  status: 'success',
                  data: [
                    {
                      id: 3,
                      numeroIntento: 2,
                      aciertos: 5,
                      calificacion: 7.0,
                      aprobado: true,
                      esNotaVigente: true,
                      fechaEjecucion: '2026-11-09T00:36:00.000Z'
                    },
                    {
                      id: 1,
                      numeroIntento: 1,
                      aciertos: 3,
                      calificacion: 4.6,
                      aprobado: false,
                      esNotaVigente: false,
                      fechaEjecucion: '2026-11-08T15:20:00.000Z'
                    }
                  ]
                }
              }
            }
          }
        }
      }
    },
    '/estudiantes/progreso': {
      get: {
        tags: ['4. Cuestionarios y Evaluaciones'],
        summary: 'Consultar porcentaje global de avance académico',
        description: `
Calcula el porcentaje de avance general del estudiante autenticado en la plataforma sobre el total de lecciones del plan curricular.
        `,
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Resumen global de progreso del estudiante.',
            content: {
              'application/json': {
                example: {
                  status: 'success',
                  data: {
                    totalLecciones: 6,
                    totalEstudiadas: 2,
                    porcentajeGlobal: 33.3,
                    leccionesEstudiadasIds: [1, 2]
                  }
                }
              }
            }
          }
        }
      }
    },

    // ==========================================
    // 5. GLOSARIOS MODULARES POR MATERIA
    // ==========================================
    '/glosarios/{materia}': {
      get: {
        tags: ['5. Glosarios Modulares'],
        summary: 'Listar o buscar en el glosario de una materia (?q=...) (Req. 3.1.4 y 3.2)',
        description: `
Retorna los elementos del glosario especializado para la materia solicitada.

**Comportamiento modular por materia:**
* **Historia:** Líneas de tiempo, fechas históricas y personajes (\`esPersonaje: boolean\`).
* **Física:** Videos de la lección con enlaces externos (\`linkVideo\`).
* **Inglés:** Vocabulario con palabra, definición, pronunciación, conjugación/tiempo verbal, audio (\`linkAudio\`) y ejemplo.
* **Biología:** Conceptos en formato Flashcard (\`esFlashcard: true\`) para mostrar en tarjetas y revelar su definición mediante botón CTA.
* **Cálculo:** Fórmulas matemáticas en formato LaTeX (\`renderizacion\`) para visualización matemática.
* **Química:** Fichas de elementos químicos (nombre, símbolo, número atómico, clasificación y fórmula).

**Búsqueda textual (?q=texto):**
* Busca en cualquier campo de texto sin distinguir entre mayúsculas y minúsculas.
* Si no hay coincidencias, devuelve el mensaje: *"No se encontraron coincidencias"* con array vacío (Req. 3.1.4).
        `,
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'materia',
            in: 'path',
            required: true,
            description: 'Nombre de la materia',
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
            description: 'Texto de búsqueda (no distingue mayúsculas)',
            schema: { type: 'string', example: 'Bastilla' }
          }
        ],
        responses: {
          200: {
            description: 'Términos del glosario encontrados.',
            content: {
              'application/json': {
                example: {
                  status: 'success',
                  materia: 'Historia',
                  slug: 'historia',
                  totalResultados: 1,
                  data: [
                    {
                      id: 1,
                      tematica: 'Revolución Francesa',
                      datoHistorico: 'Toma de la Bastilla',
                      definicion: 'Asalto popular a la fortaleza medieval de la Bastilla en París.',
                      lineaTiempo: 'Inicio de la Revolución',
                      esPersonaje: false,
                      fechaHistorica: '14 de Julio de 1789',
                      ordenCronologico: 1789
                    }
                  ]
                }
              }
            }
          }
        }
      }
    },
    '/glosarios/historia/linea-tiempo/{id}': {
      get: {
        tags: ['5. Glosarios Modulares'],
        summary: 'Línea de tiempo secuencial de Historia (Req. 3.2.1)',
        description: `
Permite visualizar la secuencia cronológica de un hecho o personaje histórico.

**Regla de negocio (Req. 3.2.1):**
Entrega el acontecimiento seleccionado junto con **los 2 acontecimientos anteriores** y **los 2 acontecimientos posteriores** secuenciales según sus fechas históricas.
        `,
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID del término histórico',
            schema: { type: 'integer', example: 1 }
          }
        ],
        responses: {
          200: {
            description: 'Acontecimientos secuenciales de la línea de tiempo.',
            content: {
              'application/json': {
                example: {
                  status: 'success',
                  data: {
                    eventoActual: {
                      id: 1,
                      tematica: 'Revolución Francesa',
                      datoHistorico: 'Toma de la Bastilla',
                      fechaHistorica: '14 de Julio de 1789',
                      ordenCronologico: 1789
                    },
                    anteriores: [],
                    posteriores: [
                      {
                        id: 2,
                        tematica: 'Revolución Francesa',
                        datoHistorico: 'Líder del Comité de Salvación Pública',
                        fechaHistorica: '6 de Mayo de 1758 - 28 de Julio de 1794',
                        ordenCronologico: 1794
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      }
    },

    // ==========================================
    // 6. PANEL DE SUPERVISIÓN DOCENTE
    // ==========================================
    '/docente/cursos': {
      get: {
        tags: ['6. Panel de Supervisión Docente'],
        summary: 'Listar cursos asignados al docente (Req. 3.1.6)',
        description: `
Permite al profesor consultar la lista de cursos que tiene a su cargo en modo solo lectura, mostrando el colegio y el total de alumnos inscritos en cada uno.

**Seguridad:** Exclusivo para usuarios con rol **DOCENTE**.
        `,
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Cursos asignados al profesor.',
            content: {
              'application/json': {
                example: {
                  status: 'success',
                  data: [
                    {
                      id: 1,
                      nombre: '4to Medio A',
                      colegio: { id: 1, nombre: 'Colegio Virtu Central' },
                      totalEstudiantes: 1
                    },
                    {
                      id: 2,
                      nombre: '4to Medio B',
                      colegio: { id: 1, nombre: 'Colegio Virtu Central' },
                      totalEstudiantes: 0
                    }
                  ]
                }
              }
            }
          },
          403: {
            description: 'Acceso denegado: se requiere rol DOCENTE.',
            content: {
              'application/json': {
                example: {
                  error: 'Acceso denegado',
                  message: 'Permisos insuficientes. Se requiere rol: DOCENTE'
                }
              }
            }
          }
        }
      }
    },
    '/docente/cursos/{cursoId}/estudiantes': {
      get: {
        tags: ['6. Panel de Supervisión Docente'],
        summary: 'Listar estudiantes con % de avance de Unidades de Estudio (Req. 3.1.6)',
        description: `
Permite al profesor seleccionar un curso y visualizar el listado de todos sus alumnos.

**Métricas calculadas:**
* **Porcentaje de avance en Unidades:** Calcula el porcentaje de avance considerando todos los temas en estado "Estudiado" (una unidad cuenta como completada únicamente cuando todas sus lecciones están estudiadas).
* **Promedio de notas:** Promedio general de las notas vigentes obtenidas en los cuestionarios.
        `,
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'cursoId',
            in: 'path',
            required: true,
            description: 'ID del curso asignado al docente',
            schema: { type: 'integer', example: 1 }
          }
        ],
        responses: {
          200: {
            description: 'Listado de alumnos con avance académico.',
            content: {
              'application/json': {
                example: {
                  status: 'success',
                  data: {
                    curso: { id: 1, nombre: '4to Medio A' },
                    totalEstudiantes: 1,
                    estudiantes: [
                      {
                        estudianteId: 2,
                        nombreCompleto: 'Sofía Valenzuela',
                        username: 'alumno1',
                        totalUnidades: 6,
                        unidadesEstudiadas: 2,
                        porcentajeAvance: 33.3,
                        promedioNotas: 7.0
                      }
                    ]
                  }
                }
              }
            }
          },
          403: {
            description: 'El docente no tiene asignado este curso.',
            content: {
              'application/json': {
                example: {
                  error: 'Error',
                  message: 'No tienes permisos de supervisión sobre este curso'
                }
              }
            }
          }
        }
      }
    },
    '/docente/estudiantes/{estudianteId}/lecciones/{leccionId}': {
      get: {
        tags: ['6. Panel de Supervisión Docente'],
        summary: 'Reporte de aciertos y desaciertos por alumno y lección (Req. 3.1.6)',
        description: `
Permite al docente auditar el rendimiento exacto de un alumno en una lección específica.

**Información detallada:**
* Estado de la lección (\`ESTUDIADO\` o \`PENDIENTE\`).
* Calificación oficial vigente obtenida por el alumno.
* Conteo de **aciertos totales** y **desaciertos totales** sobre las 5 preguntas.
* Desglose pregunta por pregunta con la respuesta seleccionada por el estudiante, la opción correcta y la explicación pedagógica.
        `,
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'estudianteId',
            in: 'path',
            required: true,
            description: 'ID del estudiante',
            schema: { type: 'integer', example: 2 }
          },
          {
            name: 'leccionId',
            in: 'path',
            required: true,
            description: 'ID de la lección a consultar',
            schema: { type: 'integer', example: 1 }
          }
        ],
        responses: {
          200: {
            description: 'Auditoría detallada de aciertos y desaciertos.',
            content: {
              'application/json': {
                example: {
                  status: 'success',
                  data: {
                    estudiante: {
                      id: 2,
                      nombreCompleto: 'Sofía Valenzuela',
                      username: 'alumno1'
                    },
                    leccion: {
                      id: 1,
                      titulo: 'La Revolución Francesa'
                    },
                    tieneCuestionario: true,
                    estadoLeccion: 'ESTUDIADO',
                    notaVigente: 7.0,
                    aprobado: true,
                    aciertosTotales: 5,
                    desaciertosTotales: 0,
                    fechaEjecucion: '2026-11-09T00:36:00.000Z',
                    detallePreguntas: [
                      {
                        preguntaId: 1,
                        orden: 1,
                        enunciado: '¿En qué año comenzó la Revolución Francesa con la Toma de la Bastilla?',
                        acerto: true,
                        respuestaDadaTexto: '1789',
                        respuestaCorrectaTexto: '1789',
                        solucionExplicacion: 'La toma de la fortaleza de la Bastilla ocurrió el 14 de julio de 1789.'
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};
