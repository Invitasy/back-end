import express from 'express';
import guestController from '../controller/guestController.js';
import authenticate from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (for QR code check-in)
router.post('/check-in', guestController.checkInGuest);

// Protected routes (require authentication)
router.use(authenticate);
router.post('/', guestController.addGuest);
router.get('/', guestController.getAllGuests);
router.put('/:id', guestController.updateGuest);
router.delete('/:id', guestController.deleteGuest);
router.post('/:id/manual-check-in', guestController.manualCheckIn);
router.put('/:id/souvenir-type', guestController.updateSouvenirType);
router.post('/:id/reprint-souvenir', guestController.reprintSouvenirQR);

export default router;