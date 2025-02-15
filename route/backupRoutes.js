import express from 'express';
import { authMiddleware, validateEventAccess } from '../middleware/authMiddleware.js';
import EventBackupService from '../service/eventBackupService.js';
import { responseSuccess, responseError } from '../util/responseUtil.js';

const router = express.Router();

// Get all backups for an event
router.get('/:eventId/backups', 
  authMiddleware,
  validateEventAccess,
  async (req, res) => {
    try {
      const { eventId } = req.params;
      const backups = await EventBackupService.listBackups(eventId);
      return responseSuccess(res, 'Event backups retrieved successfully', backups);
    } catch (error) {
      return responseError(res, error.message);
    }
});

// Trigger manual backup for an event
router.post('/:eventId/backups', 
  authMiddleware,
  validateEventAccess,
  async (req, res) => {
    try {
      const { eventId } = req.params;
      const backup = await EventBackupService.manualBackup(eventId);
      return responseSuccess(res, 'Manual backup created successfully', backup);
    } catch (error) {
      return responseError(res, error.message);
    }
});

export default router;