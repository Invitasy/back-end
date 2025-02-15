import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../logger/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backupDir = path.join(__dirname, '../backups');

class DatabaseBackup {
  static async createBackup() {
    try {
      // Ensure backup directory exists
      await fs.mkdir(backupDir, { recursive: true });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `backup-${timestamp}.sql`;
      const filePath = path.join(backupDir, filename);

      const command = `mysqldump --host=${process.env.DB_HOST} \
                      --user=${process.env.DB_USER} \
                      --password=${process.env.DB_PASSWORD} \
                      ${process.env.DB_NAME} > ${filePath}`;

      return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
          if (error) {
            logger.error('Backup failed:', error);
            reject(error);
            return;
          }
          logger.info(`Backup created successfully: ${filename}`);
          resolve(filePath);
        });
      });
    } catch (error) {
      logger.error('Backup creation failed:', error);
      throw error;
    }
  }

  static async restoreBackup(backupPath) {
    try {
      const command = `mysql --host=${process.env.DB_HOST} \
                      --user=${process.env.DB_USER} \
                      --password=${process.env.DB_PASSWORD} \
                      ${process.env.DB_NAME} < ${backupPath}`;

      return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
          if (error) {
            logger.error('Restore failed:', error);
            reject(error);
            return;
          }
          logger.info('Database restored successfully');
          resolve(true);
        });
      });
    } catch (error) {
      logger.error('Restore failed:', error);
      throw error;
    }
  }

  static async listBackups() {
    try {
      const files = await fs.readdir(backupDir);
      return files.filter(file => file.endsWith('.sql'))
        .map(file => ({
          name: file,
          path: path.join(backupDir, file),
          timestamp: file.replace('backup-', '').replace('.sql', '')
        }));
    } catch (error) {
      logger.error('Failed to list backups:', error);
      throw error;
    }
  }

  static async cleanupOldBackups(retentionDays = 7) {
    try {
      const files = await this.listBackups();
      const now = new Date();
      
      for (const file of files) {
        const fileDate = new Date(file.timestamp);
        const daysDiff = (now - fileDate) / (1000 * 60 * 60 * 24);
        
        if (daysDiff > retentionDays) {
          await fs.unlink(file.path);
          logger.info(`Deleted old backup: ${file.name}`);
        }
      }
    } catch (error) {
      logger.error('Backup cleanup failed:', error);
      throw error;
    }
  }
}

// Export named functions for backup operations
export const createBackup = DatabaseBackup.createBackup;
export const cleanupOldBackups = DatabaseBackup.cleanupOldBackups;