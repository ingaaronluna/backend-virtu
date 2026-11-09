import { Router } from 'express';
import * as progresoController from '../controllers/progreso.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { authorizeRole } from '../middlewares/role.middleware.js';

const router = Router();

router.use(authenticateToken, authorizeRole('ESTUDIANTE'));

// Obtener progreso global del estudiante logueado
router.get('/progreso', progresoController.getProgresoGlobal);

export default router;
