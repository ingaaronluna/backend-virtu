import { Router } from 'express';
import * as contenidoController from '../controllers/contenido.controller.js';
import * as progresoController from '../controllers/progreso.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { authorizeRole } from '../middlewares/role.middleware.js';

const router = Router();

router.use(authenticateToken);

// Ver detalle de una lección (Definición máx 10.000 chars, Ejemplo máx 2.000 chars)
router.get('/:id', contenidoController.getLeccionById);

// Marcar lección como Estudiado manualmente (Solo estudiantes y SOLO si NO tiene cuestionario)
router.post(
  '/:id/marcar-estudiado',
  authorizeRole('ESTUDIANTE'),
  progresoController.marcarLeccionManual
);

export default router;
