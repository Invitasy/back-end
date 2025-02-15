import express from 'express';
import qrController from '../controller/qrController.js';
import authenticate from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route for QR scanning
router.post('/scan', qrController.scanQR);

// Protected routes
router.use(authenticate);
router.post('/verify', qrController.verifyQR);
router.post('/generate/:guestId', qrController.generateQR);

export default router;