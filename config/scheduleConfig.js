import cron from 'node-cron';
import { createBackup, cleanupOldBackups } from '../util/databaseBackup.js';
import DatabaseHealth from '../util/databaseHealth.js';
import AdminSessionService from '../service/adminSessionService.js';
import logger from '../logger/logger.js';
import connectDB from '../config/dbConfig.js';

// Schedule daily full backup at 2 AM
const scheduleFullBackup = () => {
  cron.schedule('0 2 * * *', async () => {
    try {
      logger.info('Starting scheduled full database backup');
      await createBackup();
      await cleanupOldBackups(7); // Keep backups for 7 days
    } catch (error) {
      logger.error('Scheduled full backup failed:', error);
    }
  });
};

// Schedule event-specific backups every 6 hours
const scheduleEventBackups = () => {
  cron.schedule('0 */6 * * *', async () => {
    try {
      const connection = await connectDB();
      // Get active events
      const [events] = await connection.query(
        'SELECT EventID FROM Event WHERE IsActive = true'
      );
      
      for (const event of events) {
        try {
          logger.info(`Starting backup for event: ${event.EventID}`);
          await createBackup(event.EventID);
        } catch (error) {
          logger.error(`Backup failed for event ${event.EventID}:`, error);
        }
      }
      await connection.end();
    } catch (error) {
      logger.error('Event backup schedule failed:', error);
    }
  });
};

// Schedule health checks every 5 minutes
const scheduleHealthChecks = () => {
  cron.schedule('*/5 * * * *', async () => {
    try {
      await DatabaseHealth.checkConnection();
      // Cleanup old health records after 7 days
      await DatabaseHealth.cleanup(7);
    } catch (error) {
      logger.error('Scheduled health check failed:', error);
    }
  });
};

// Schedule inactive session cleanup every hour
const scheduleSessionCleanup = () => {
  cron.schedule('0 * * * *', async () => {
    try {
      await AdminSessionService.cleanupInactiveSessions();
      logger.info('Inactive sessions cleanup completed');
    } catch (error) {
      logger.error('Session cleanup failed:', error);
    }
  });
};

export { 
  scheduleFullBackup, 
  scheduleEventBackups,
  scheduleHealthChecks,
  scheduleSessionCleanup 
};