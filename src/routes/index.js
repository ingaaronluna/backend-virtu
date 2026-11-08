import { Router } from 'express';
import authRoutes from './auth.routes.js';

const router = Router();

// Subrutas de la API
router.use('/auth', authRoutes);

export default router;
