import express from 'express';
import guestController from '../controller/guestController.js';
import { authMiddleware, validateEventAccess } from '../middleware/authMiddleware.js';
import GuestService from '../service/guestService.js';
import { responseSuccess, responseError } from '../util/responseUtil.js';

const router = express.Router();

// Public routes (for QR code check-in)
router.post('/check-in', guestController.checkInGuest);

// Protected routes (require authentication)
router.use(authMiddleware);
router.post('/', guestController.addGuest);
router.get('/', guestController.getAllGuests);
router.put('/:id', guestController.updateGuest);
router.delete('/:id', guestController.deleteGuest);
router.post('/:id/manual-check-in', guestController.manualCheckIn);
router.put('/:id/souvenir-type', guestController.updateSouvenirType);
router.post('/:id/reprint-souvenir', guestController.reprintSouvenirQR);

// Get deleted guests for an event
router.get('/:eventId/deleted', 
  validateEventAccess,
  async (req, res) => {
    try {
      const { eventId } = req.params;
      const deletedGuests = await GuestService.getDeletedGuests(eventId);
      return responseSuccess(res, 'Deleted guests retrieved successfully', deletedGuests);
    } catch (error) {
      return responseError(res, error.message);
    }
});

// Soft delete a guest
router.delete('/:eventId/guests/:guestId', 
  validateEventAccess,
  async (req, res) => {
    try {
      const { guestId } = req.params;
      const { adminId } = req.user;
      const { reason } = req.body;
      
      await GuestService.softDeleteGuest(guestId, adminId, reason);
      return responseSuccess(res, 'Guest deleted successfully');
    } catch (error) {
      return responseError(res, error.message);
    }
});

// Restore a deleted guest
router.post('/:eventId/guests/:guestId/restore', 
  validateEventAccess,
  async (req, res) => {
    try {
      const { guestId } = req.params;
      await GuestService.restoreGuest(guestId);
      return responseSuccess(res, 'Guest restored successfully');
    } catch (error) {
      return responseError(res, error.message);
    }
});

export default router;