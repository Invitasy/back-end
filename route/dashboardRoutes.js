import express from 'express';
import dashboardController from '../controller/dashboardController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// All dashboard routes require authentication
router.use(authMiddleware);

router.get('/stats', dashboardController.getDashboardStats);
router.get('/check-in-history', dashboardController.getGuestCheckInHistory);

export default router;