import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Rutas públicas de autenticación
router.post('/login', authController.login);
router.post('/register', authController.register);

// Ruta protegida de perfil (Requisito 3.1.1: información del estudiante o docente)
router.get('/me', authenticateToken, authController.getMe);

export default router;
