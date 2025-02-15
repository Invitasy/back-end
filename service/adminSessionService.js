import { v4 as uuidv4 } from 'uuid';
import connectDB from '../config/dbConfig.js';
import jwt from 'jsonwebtoken';
import { secret } from '../config/jwtConfig.js';

class AdminSessionService {
  static async createSession(adminId, eventId, deviceInfo) {
    const connection = await connectDB();
    try {
      // Check admin role, device limit, and active session count
      const [adminRows] = await connection.query(
        'SELECT Role, DeviceLimit FROM Admin WHERE AdminID = ?',
        [adminId]
      );

      if (!adminRows.length) {
        throw new Error('Admin not found');
      }

      const { Role: role, DeviceLimit: deviceLimit } = adminRows[0];
      
      // Get active sessions count
      const [sessions] = await connection.query(
        'SELECT COUNT(*) as count FROM AdminSession WHERE AdminID = ? AND IsActive = true',
        [adminId]
      );

      const activeSessionCount = sessions[0].count;

      // Enforce device limits based on admin settings
      if (activeSessionCount >= deviceLimit) {
        throw new Error(`Maximum device limit reached (${deviceLimit} devices)`);
      }

      // Create new session
      const sessionId = uuidv4();
      const token = jwt.sign({ 
        adminId, 
        eventId, 
        sessionId,
        role 
      }, secret, { expiresIn: '24h' });

      await connection.query(
        `INSERT INTO AdminSession 
        (SessionID, AdminID, EventID, DeviceInfo, Token) 
        VALUES (?, ?, ?, ?, ?)`,
        [sessionId, adminId, eventId, deviceInfo, token]
      );

      return { 
        sessionId, 
        token,
        remainingSessions: deviceLimit - (activeSessionCount + 1)
      };
    } finally {
      await connection.end();
    }
  }

  static async validateSession(token) {
    const connection = await connectDB();
    try {
      const [sessions] = await connection.query(
        'SELECT * FROM AdminSession WHERE Token = ? AND IsActive = true',
        [token]
      );

      if (!sessions.length) {
        throw new Error('Invalid or expired session');
      }

      const session = sessions[0];
      
      // Update last active timestamp
      await connection.query(
        'UPDATE AdminSession SET LastActive = CURRENT_TIMESTAMP WHERE SessionID = ?',
        [session.SessionID]
      );

      return session;
    } finally {
      await connection.end();
    }
  }

  static async deactivateSession(sessionId) {
    const connection = await connectDB();
    try {
      await connection.query(
        'UPDATE AdminSession SET IsActive = false WHERE SessionID = ?',
        [sessionId]
      );
    } finally {
      await connection.end();
    }
  }

  static async getActiveSessions(adminId, eventId) {
    const connection = await connectDB();
    try {
      const [sessions] = await connection.query(
        `SELECT SessionID, DeviceInfo, LastActive, CreatedAt 
         FROM AdminSession 
         WHERE AdminID = ? AND EventID = ? AND IsActive = true`,
        [adminId, eventId]
      );
      return sessions;
    } finally {
      await connection.end();
    }
  }

  // Auto cleanup inactive sessions (can be called periodically)
  static async cleanupInactiveSessions() {
    const connection = await connectDB();
    try {
      // Deactivate sessions inactive for more than 24 hours
      await connection.query(
        `UPDATE AdminSession 
         SET IsActive = false 
         WHERE LastActive < DATE_SUB(NOW(), INTERVAL 24 HOUR)
         AND IsActive = true`
      );
    } finally {
      await connection.end();
    }
  }

  static async getRemainingSessionCount(adminId) {
    const connection = await connectDB();
    try {
      // Get admin details including device limit
      const [adminRows] = await connection.query(
        'SELECT DeviceLimit FROM Admin WHERE AdminID = ?',
        [adminId]
      );

      if (!adminRows.length) {
        throw new Error('Admin not found');
      }

      const deviceLimit = adminRows[0].DeviceLimit;
      
      // Get active sessions count
      const [sessions] = await connection.query(
        'SELECT COUNT(*) as count FROM AdminSession WHERE AdminID = ? AND IsActive = true',
        [adminId]
      );

      const activeSessionCount = sessions[0].count;

      return {
        activeSessionCount,
        maxSessions: deviceLimit,
        remainingSessions: deviceLimit - activeSessionCount
      };
    } finally {
      await connection.end();
    }
  }

  static async listActiveSessions(adminId) {
    const connection = await connectDB();
    try {
      const [sessions] = await connection.query(
        `SELECT 
          SessionID,
          DeviceInfo,
          LastActive,
          CreatedAt,
          EventID,
          (SELECT EventName FROM Event WHERE EventID = AdminSession.EventID) as EventName
         FROM AdminSession 
         WHERE AdminID = ? AND IsActive = true
         ORDER BY LastActive DESC`,
        [adminId]
      );

      const sessionCount = await this.getRemainingSessionCount(adminId);
      
      return {
        sessions,
        sessionCount
      };
    } finally {
      await connection.end();
    }
  }

  static async listAllEventAdminSessions() {
    const connection = await connectDB();
    try {
      const [sessions] = await connection.query(
        `SELECT 
          AdminSession.*,
          Admin.Name as AdminName,
          Admin.Email as AdminEmail,
          Event.EventName,
          Event.EventDate
         FROM AdminSession 
         JOIN Admin ON AdminSession.AdminID = Admin.AdminID
         JOIN Event ON AdminSession.EventID = Event.EventID
         WHERE Admin.Role = 'event_admin' AND AdminSession.IsActive = true
         ORDER BY LastActive DESC`
      );

      return sessions;
    } finally {
      await connection.end();
    }
  }

  static async getEventAdminSessionDetails(adminId) {
    const connection = await connectDB();
    try {
      // Get admin details and their sessions
      const [adminDetails] = await connection.query(
        `SELECT 
          Admin.Name,
          Admin.Email,
          Admin.Role,
          COUNT(DISTINCT AdminSession.SessionID) as ActiveSessions,
          GROUP_CONCAT(DISTINCT Event.EventName) as Events
         FROM Admin
         LEFT JOIN AdminSession ON Admin.AdminID = AdminSession.AdminID AND AdminSession.IsActive = true
         LEFT JOIN Event ON AdminSession.EventID = Event.EventID
         WHERE Admin.AdminID = ? AND Admin.Role = 'event_admin'
         GROUP BY Admin.AdminID`,
        [adminId]
      );

      if (!adminDetails.length) {
        throw new Error('Event admin not found');
      }

      // Get detailed session information
      const [sessions] = await connection.query(
        `SELECT 
          SessionID,
          DeviceInfo,
          LastActive,
          CreatedAt,
          EventID,
          (SELECT EventName FROM Event WHERE EventID = AdminSession.EventID) as EventName
         FROM AdminSession 
         WHERE AdminID = ? AND IsActive = true
         ORDER BY LastActive DESC`,
        [adminId]
      );

      return {
        adminInfo: adminDetails[0],
        sessions
      };
    } finally {
      await connection.end();
    }
  }

  static async deactivateEventAdminSession(adminId, sessionId) {
    const connection = await connectDB();
    try {
      // Verify it's an event admin session
      const [session] = await connection.query(
        `SELECT AdminSession.* FROM AdminSession 
         JOIN Admin ON AdminSession.AdminID = Admin.AdminID
         WHERE Admin.Role = 'event_admin' 
         AND AdminSession.SessionID = ? 
         AND AdminSession.AdminID = ?`,
        [sessionId, adminId]
      );

      if (!session.length) {
        throw new Error('Invalid event admin session');
      }

      await connection.query(
        'UPDATE AdminSession SET IsActive = false WHERE SessionID = ?',
        [sessionId]
      );

      return true;
    } finally {
      await connection.end();
    }
  }

  static async deactivateAllEventAdminSessions(adminId) {
    const connection = await connectDB();
    try {
      await connection.query(
        `UPDATE AdminSession 
         SET IsActive = false 
         WHERE AdminID = ? 
         AND AdminID IN (SELECT AdminID FROM Admin WHERE Role = 'event_admin')`,
        [adminId]
      );
    } finally {
      await connection.end();
    }
  }

  static async updateDeviceLimit(adminId, newLimit) {
    const connection = await connectDB();
    try {
      // Only allow updating event admin limits
      const [admin] = await connection.query(
        'SELECT Role FROM Admin WHERE AdminID = ?',
        [adminId]
      );

      if (!admin.length || admin[0].Role === 'super_admin') {
        throw new Error('Cannot modify super admin device limit');
      }

      await connection.query(
        'UPDATE Admin SET DeviceLimit = ? WHERE AdminID = ?',
        [newLimit, adminId]
      );

      // If new limit is lower than current active sessions, deactivate excess sessions
      const [sessions] = await connection.query(
        `SELECT SessionID FROM AdminSession 
         WHERE AdminID = ? AND IsActive = true 
         ORDER BY LastActive DESC 
         LIMIT 18446744073709551615 OFFSET ?`,
        [adminId, newLimit]
      );

      if (sessions.length > 0) {
        const sessionIds = sessions.map(s => s.SessionID);
        await connection.query(
          'UPDATE AdminSession SET IsActive = false WHERE SessionID IN (?)',
          [sessionIds]
        );
      }
    } finally {
      await connection.end();
    }
  }
}

export default AdminSessionService;