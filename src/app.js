import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { swaggerDocument } from './docs/swagger.js';

const app = express();

// Middlewares globales
app.use(cors({ origin: '*' }));
app.use(express.json());

// Documentación interactiva Swagger UI en /docs y /api/docs
const swaggerOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Virtu API Docs'
};

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));

// Endpoint para descargar o consultar el esquema OpenAPI en JSON
app.get('/api/docs-json', (req, res) => {
  res.json(swaggerDocument);
});

// Ruta raíz informativa
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    project: 'Virtu API',
    description: 'Backend para plataforma educativa Virtu',
    version: '1.2.0',
    documentation: {
      swaggerUI: '/docs',
      openApiJson: '/api/docs-json'
    },
    endpoints: {
      health: '/api/health',
      auth: {
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        register: 'POST /api/auth/register'
      },
      contenidos: {
        listar: 'GET /api/contenidos',
        detallePorSlug: 'GET /api/contenidos/:slug'
      },
      lecciones: {
        detalle: 'GET /api/lecciones/:id',
        marcarEstudiadoManual: 'POST /api/lecciones/:id/marcar-estudiado'
      },
      cuestionarios: {
        iniciarIntento: 'POST /api/cuestionarios/:id/iniciar',
        responderSecuencial: 'POST /api/intentos/:id/responder',
        finalizarIntento: 'POST /api/intentos/:id/finalizar',
        historialEstudiante: 'GET /api/cuestionarios/:id/historial'
      },
      estudiantes: {
        progresoGlobal: 'GET /api/estudiantes/progreso'
      },
      glosarios: {
        porMateria: 'GET /api/glosarios/:materia?q=',
        lineaTiempoHistoria: 'GET /api/glosarios/historia/linea-tiempo/:id'
      },
      docente: {
        cursos: 'GET /api/docente/cursos',
        estudiantesCurso: 'GET /api/docente/cursos/:cursoId/estudiantes',
        aciertosDesaciertosAlumno: 'GET /api/docente/estudiantes/:estudianteId/lecciones/:leccionId'
      }
    }
  });
});

// Ruta de healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Montar todas las rutas bajo el prefijo /api
app.use('/api', apiRoutes);

// Manejo de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Manejo global de errores centralizado
app.use(errorHandler);

export default app;
