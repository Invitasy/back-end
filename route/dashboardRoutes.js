import express from 'express';
import dashboardController from '../controller/dashboardController.js';
import authenticate from '../middleware/authMiddleware.js';

const router = express.Router();

// All dashboard routes require authentication
router.use(authenticate);

router.get('/stats', dashboardController.getDashboardStats);
router.get('/check-in-history', dashboardController.getGuestCheckInHistory);

export default router;