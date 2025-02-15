import jwt from 'jsonwebtoken';
import { secret } from '../config/jwtConfig.js';
import AdminSessionService from '../service/adminSessionService.js';

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    // First verify JWT
    const decoded = jwt.verify(token, secret);
    
    // Then validate session is still active
    const session = await AdminSessionService.validateSession(token);
    
    // Attach user and session info to request
    req.user = {
      adminId: decoded.adminId,
      eventId: decoded.eventId,
      sessionId: decoded.sessionId,
      role: decoded.role
    };
    req.session = session;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.message === 'Invalid or expired session') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Additional middleware for super admin only routes
const superAdminOnly = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Access denied. Super admin only.' });
  }
  next();
};

// Additional middleware for checking event access
const validateEventAccess = async (req, res, next) => {
  const { eventId } = req.params;
  const { adminId, role } = req.user;

  // Super admin can access all events
  if (role === 'super_admin') {
    return next();
  }

  // For event admins, verify they own the event
  if (eventId !== req.user.eventId) {
    return res.status(403).json({ message: 'Access denied. Event access not authorized.' });
  }

  next();
};

const auth = {
  authMiddleware,
  superAdminOnly,
  validateEventAccess
};

export { authMiddleware, superAdminOnly, validateEventAccess };
export default auth;