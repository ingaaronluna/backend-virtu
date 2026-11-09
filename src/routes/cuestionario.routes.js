import { Router } from 'express';
import * as cuestionarioController from '../controllers/cuestionario.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { authorizeRole } from '../middlewares/role.middleware.js';

export const cuestionarioRouter = Router();
cuestionarioRouter.use(authenticateToken);

// Iniciar intento de cuestionario (Solo rol ESTUDIANTE)
cuestionarioRouter.post(
  '/:id/iniciar',
  authorizeRole('ESTUDIANTE'),
  cuestionarioController.iniciarIntento
);

// Ver historial de intentos del estudiante
cuestionarioRouter.get(
  '/:id/historial',
  authorizeRole('ESTUDIANTE'),
  cuestionarioController.getHistorial
);

export const intentoRouter = Router();
intentoRouter.use(authenticateToken, authorizeRole('ESTUDIANTE'));

// Responder secuencialmente una pregunta del wizard (inmutable con corrección inmediata)
intentoRouter.post('/:id/responder', cuestionarioController.responderPregunta);

// Finalizar intento, calcular nota y marcar progreso automático
intentoRouter.post('/:id/finalizar', cuestionarioController.finalizarIntento);
