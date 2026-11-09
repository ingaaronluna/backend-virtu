import { Router } from 'express';
import authRoutes from './auth.routes.js';
import contenidoRoutes from './contenido.routes.js';
import leccionRoutes from './leccion.routes.js';
import { cuestionarioRouter, intentoRouter } from './cuestionario.routes.js';
import estudianteRoutes from './estudiante.routes.js';
import glosarioRoutes from './glosario.routes.js';
import docenteRoutes from './docente.routes.js';

const router = Router();

// Montar subrutas de la API
router.use('/auth', authRoutes);
router.use('/contenidos', contenidoRoutes);
router.use('/lecciones', leccionRoutes);
router.use('/cuestionarios', cuestionarioRouter);
router.use('/intentos', intentoRouter);
router.use('/estudiantes', estudianteRoutes);
router.use('/glosarios', glosarioRoutes);
router.use('/docente', docenteRoutes);

export default router;
