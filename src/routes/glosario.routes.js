import { Router } from 'express';
import * as glosarioController from '../controllers/glosario.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

// Consulta secuencial de línea de tiempo de historia (2 antes y 2 después)
router.get('/historia/linea-tiempo/:id', glosarioController.getLineaTiempoSecuencial);

// Listar o buscar en el glosario de una materia (?q=...)
router.get('/:materia', glosarioController.getGlosarioByMateria);

export default router;
