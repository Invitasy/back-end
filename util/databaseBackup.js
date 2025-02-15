import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../logger/logger.js';
import { saveFile } from '../config/storageConfig.js';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backupDir = path.join(__dirname, '../backups');

class DatabaseBackup {
  static async createBackup(eventId = null) {
    try {
      // Ensure backup directory exists
      await fs.mkdir(backupDir, { recursive: true });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupId = uuidv4();
      const filename = eventId ? 
        `backup-${eventId}-${timestamp}.sql` : 
        `backup-full-${timestamp}.sql`;
      const filePath = path.join(backupDir, filename);

      // Build mysqldump command
      let command = `mysqldump --host=${process.env.DB_HOST} \
                    --user=${process.env.DB_USER} \
                    --password=${process.env.DB_PASSWORD} \
                    --set-gtid-purged=OFF \
                    --triggers \
                    --routines \
                    --single-transaction \
                    ${process.env.DB_NAME}`;

      // If eventId is provided, only backup that event's data
      if (eventId) {
        command += ` --where="EventID='${eventId}'" \
                    InvitedGuest CheckInLog Souvenir Dashboard`;
      }

      command += ` > ${filePath}`;

      const result = await new Promise((resolve, reject) => {
        exec(command, async (error, stdout, stderr) => {
          if (error) {
            logger.error('Backup failed:', error);
            reject(error);
            return;
          }

          try {
            // Upload to cloud storage
            const fileContent = await fs.readFile(filePath);
            const cloudPath = `backups/${filename}`;
            const url = await saveFile(cloudPath, fileContent);

            // Record backup metadata
            const connection = await connectDB();
            await connection.query(
              `INSERT INTO BackupHistory (
                BackupID, EventID, FileName, 
                CloudURL, BackupType, Status
              ) VALUES (?, ?, ?, ?, ?, ?)`,
              [
                backupId,
                eventId,
                filename,
                url,
                eventId ? 'event' : 'full',
                'completed'
              ]
            );
            await connection.end();

            // Clean up local file
            await fs.unlink(filePath);

            resolve({
              backupId,
              filename,
              url,
              timestamp: new Date().toISOString()
            });
          } catch (uploadError) {
            reject(uploadError);
          }
        });
      });

      logger.info(`Backup created successfully: ${filename}`);
      return result;
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

  static async listBackups(eventId = null) {
    const connection = await connectDB();
    try {
      let query = `
        SELECT 
          BackupID,
          EventID,
          FileName,
          CloudURL,
          BackupType,
          Status,
          CreatedAt,
          (SELECT EventName FROM Event WHERE EventID = BackupHistory.EventID) as EventName
        FROM BackupHistory
        WHERE Status = 'completed'
      `;

      if (eventId) {
        query += ' AND EventID = ?';
        const [backups] = await connection.query(query, [eventId]);
        return backups;
      }

      const [backups] = await connection.query(query);
      return backups;
    } finally {
      await connection.end();
    }
  }

  static async cleanupOldBackups(retentionDays = 7) {
    const connection = await connectDB();
    try {
      // Get old backups
      const [oldBackups] = await connection.query(
        `SELECT BackupID, CloudURL, FileName 
         FROM BackupHistory
         WHERE CreatedAt < DATE_SUB(NOW(), INTERVAL ? DAY)
         AND Status = 'completed'`,
        [retentionDays]
      );

      for (const backup of oldBackups) {
        try {
          // Delete from cloud storage
          const cloudPath = `backups/${backup.FileName}`;
          await deleteFile(cloudPath);

          // Update status in database
          await connection.query(
            'UPDATE BackupHistory SET Status = ? WHERE BackupID = ?',
            ['deleted', backup.BackupID]
          );

          logger.info(`Deleted old backup: ${backup.FileName}`);
        } catch (error) {
          logger.error(`Failed to delete backup ${backup.FileName}:`, error);
        }
      }
    } finally {
      await connection.end();
    }
  }
}

// Export named functions for backup operations
export const createBackup = DatabaseBackup.createBackup;
export const listBackups = DatabaseBackup.listBackups;
export const cleanupOldBackups = DatabaseBackup.cleanupOldBackups;