import cron from 'node-cron';
import { createBackup, cleanupOldBackups } from '../util/databaseBackup.js';
import DatabaseHealth from '../util/databaseHealth.js';
import logger from '../logger/logger.js';

// Schedule daily backup at 2 AM
const scheduleBackups = () => {
  cron.schedule('0 2 * * *', async () => {
    try {
      logger.info('Starting scheduled database backup');
      await createBackup();
      await cleanupOldBackups(7); // Keep backups for 7 days
    } catch (error) {
      logger.error('Scheduled backup failed:', error);
    }
  });
};

// Schedule health checks every 5 minutes
const scheduleHealthChecks = () => {
  cron.schedule('*/5 * * * *', async () => {
    try {
      await DatabaseHealth.checkConnection();
      await DatabaseHealth.cleanup(7); // Keep health logs for 7 days
    } catch (error) {
      logger.error('Scheduled health check failed:', error);
    }
  });
};

export { scheduleBackups, scheduleHealthChecks };