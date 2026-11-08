import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();

// Middlewares globales
app.use(cors({ origin: '*' }));
app.use(express.json());

// Ruta raíz informativa
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    project: 'Virtu API',
    description: 'Backend para plataforma educativa Virtu',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: {
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        register: 'POST /api/auth/register'
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
