import { Router } from 'express';
import * as docenteController from '../controllers/docente.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { authorizeRole } from '../middlewares/role.middleware.js';

const router = Router();

// Todas las rutas de docente requieren rol DOCENTE (Req. 3.1.6)
router.use(authenticateToken, authorizeRole('DOCENTE'));

// Listar cursos asignados al docente
router.get('/cursos', docenteController.getCursosDocente);

// Listar estudiantes de un curso con su % de avance de Unidades de Estudio
router.get('/cursos/:cursoId/estudiantes', docenteController.getEstudiantesCurso);

// Ver aciertos y desaciertos por alumno y por lección
router.get(
  '/estudiantes/:estudianteId/lecciones/:leccionId',
  docenteController.getDesempenoEstudianteLeccion
);

export default router;
