import express from 'express';
import { authMiddleware, superAdminOnly } from '../middleware/authMiddleware.js';
import AdminSessionService from '../service/adminSessionService.js';
import { responseSuccess, responseError } from '../util/responseUtil.js';

const router = express.Router();

// Get all active sessions for current admin
router.get('/sessions', authMiddleware, async (req, res) => {
  try {
    const { adminId } = req.user;
    const sessionInfo = await AdminSessionService.listActiveSessions(adminId);
    return responseSuccess(res, 'Active sessions retrieved', sessionInfo);
  } catch (error) {
    return responseError(res, error.message);
  }
});

// Get remaining session count
router.get('/sessions/remaining', authMiddleware, async (req, res) => {
  try {
    const { adminId } = req.user;
    const sessionCount = await AdminSessionService.getRemainingSessionCount(adminId);
    return responseSuccess(res, 'Session count retrieved', sessionCount);
  } catch (error) {
    return responseError(res, error.message);
  }
});

// Deactivate a specific session
router.delete('/sessions/:sessionId', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;
    await AdminSessionService.deactivateSession(sessionId);
    return responseSuccess(res, 'Session deactivated successfully');
  } catch (error) {
    return responseError(res, error.message);
  }
});

// Deactivate all other sessions except current
router.delete('/sessions/all/except-current', authMiddleware, async (req, res) => {
  try {
    const { adminId } = req.user;
    const { sessionId } = req.session;
    await AdminSessionService.deactivateAllExceptCurrent(adminId, sessionId);
    return responseSuccess(res, 'All other sessions deactivated successfully');
  } catch (error) {
    return responseError(res, error.message);
  }
});

// Superadmin routes for managing event admin sessions
router.get('/event-admin/sessions', 
  authMiddleware, 
  superAdminOnly, 
  async (req, res) => {
    try {
      const sessions = await AdminSessionService.listAllEventAdminSessions();
      return responseSuccess(res, 'Event admin sessions retrieved', sessions);
    } catch (error) {
      return responseError(res, error.message);
    }
});

router.get('/event-admin/:adminId/sessions', 
  authMiddleware, 
  superAdminOnly, 
  async (req, res) => {
    try {
      const { adminId } = req.params;
      const sessionDetails = await AdminSessionService.getEventAdminSessionDetails(adminId);
      return responseSuccess(res, 'Event admin session details retrieved', sessionDetails);
    } catch (error) {
      return responseError(res, error.message);
    }
});

router.delete('/event-admin/:adminId/sessions/:sessionId', 
  authMiddleware, 
  superAdminOnly, 
  async (req, res) => {
    try {
      const { adminId, sessionId } = req.params;
      await AdminSessionService.deactivateEventAdminSession(adminId, sessionId);
      return responseSuccess(res, 'Event admin session deactivated successfully');
    } catch (error) {
      return responseError(res, error.message);
    }
});

router.delete('/event-admin/:adminId/sessions', 
  authMiddleware, 
  superAdminOnly, 
  async (req, res) => {
    try {
      const { adminId } = req.params;
      await AdminSessionService.deactivateAllEventAdminSessions(adminId);
      return responseSuccess(res, 'All event admin sessions deactivated successfully');
    } catch (error) {
      return responseError(res, error.message);
    }
});

// Superadmin route to update event admin device limits
router.put('/event-admin/:adminId/device-limit', 
  authMiddleware, 
  superAdminOnly, 
  async (req, res) => {
    try {
      const { adminId } = req.params;
      const { deviceLimit } = req.body;

      if (!deviceLimit || deviceLimit < 1) {
        return responseError(res, 'Invalid device limit');
      }

      await AdminSessionService.updateDeviceLimit(adminId, deviceLimit);
      return responseSuccess(res, 'Device limit updated successfully');
    } catch (error) {
      return responseError(res, error.message);
    }
});

// Get event admin's current device limit and usage
router.get('/event-admin/:adminId/device-limit', 
  authMiddleware, 
  superAdminOnly, 
  async (req, res) => {
    try {
      const { adminId } = req.params;
      const sessionInfo = await AdminSessionService.getRemainingSessionCount(adminId);
      return responseSuccess(res, 'Device limit info retrieved', sessionInfo);
    } catch (error) {
      return responseError(res, error.message);
    }
});

export default router;