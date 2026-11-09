import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { authorizeRole } from '../middlewares/role.middleware.js';

const router = Router();

// Todas las rutas de administración requieren autenticación de docente
router.use(authenticateToken, authorizeRole('DOCENTE'));

// 1. Colegios
router.get('/colegios', adminController.getColegios);
router.post('/colegios', adminController.createColegio);
router.put('/colegios/:id', adminController.updateColegio);
router.delete('/colegios/:id', adminController.deleteColegio);

// 2. Cursos
router.get('/cursos', adminController.getCursos);
router.post('/cursos', adminController.createCurso);
router.put('/cursos/:id', adminController.updateCurso);
router.delete('/cursos/:id', adminController.deleteCurso);

// 3. Contenidos (Materias)
router.post('/contenidos', adminController.createContenido);
router.put('/contenidos/:id', adminController.updateContenido);
router.delete('/contenidos/:id', adminController.deleteContenido);

// 4. Unidades
router.post('/unidades', adminController.createUnidad);
router.put('/unidades/:id', adminController.updateUnidad);
router.delete('/unidades/:id', adminController.deleteUnidad);

// 5. Lecciones
router.post('/lecciones', adminController.createLeccion);
router.put('/lecciones/:id', adminController.updateLeccion);
router.delete('/lecciones/:id', adminController.deleteLeccion);

// 6. Cuestionarios y Preguntas
router.post('/cuestionarios', adminController.createCuestionario);
router.post('/cuestionarios/:id/preguntas', adminController.createPregunta);
router.delete('/preguntas/:id', adminController.deletePregunta);

// 7. Glosarios Modulares
router.post('/glosarios/:materia', adminController.createGlosarioItem);
router.delete('/glosarios/:materia/:id', adminController.deleteGlosarioItem);

export default router;
