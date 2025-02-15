import express from 'express';
import healthController from '../controller/healthController.js';
import authenticate from '../middleware/authMiddleware.js';

const router = express.Router();

// Public health check endpoint
router.get('/check', healthController.checkHealth);

// Protected routes - only for admins
router.use(authenticate);
router.get('/history', healthController.getHealthHistory);
router.post('/cleanup', healthController.cleanupHealthHistory);

export default router;