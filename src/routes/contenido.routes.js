import { Router } from 'express';
import * as contenidoController from '../controllers/contenido.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Todas las rutas de contenidos requieren sesión iniciada
router.use(authenticateToken);

// Listar materias disponibles (Req. 3.1.2)
router.get('/', contenidoController.getContenidos);

// Obtener detalle de materia con sus unidades y lecciones
router.get('/:slug', contenidoController.getContenidoBySlug);

export default router;
