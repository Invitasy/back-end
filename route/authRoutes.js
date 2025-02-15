import express from 'express';
import authController from '../controller/authController.js';
import authenticate from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', authController.login);

// Protected routes
router.use(authenticate);
router.post('/logout', authController.logout);

// Superadmin only routes
router.post('/admin', authController.createAdmin);
router.get('/admin', authController.getAllAdmins);
router.delete('/admin/:id', authController.deleteAdmin);

export default router;