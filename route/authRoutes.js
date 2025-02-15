import express from 'express';
import { login, logout, createAdmin, getAllAdmins, deleteAdmin } from '../controller/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', login);

// Protected routes
router.use(authMiddleware);
router.post('/logout', logout);

// Superadmin only routes
router.post('/admin', createAdmin);
router.get('/admin', getAllAdmins);
router.delete('/admin/:id', deleteAdmin);

export default router;