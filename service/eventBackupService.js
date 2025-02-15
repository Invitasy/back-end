import cron from 'node-cron';
import { v4 as uuidv4 } from 'uuid';
import { saveFile } from '../config/storageConfig.js';
import connectDB from '../config/dbConfig.js';
import logger from '../logger/logger.js';

class EventBackupService {
  static async backupEventData(eventId) {
    const connection = await connectDB();
    try {
      // Get all relevant data for the event
      const [event] = await connection.query('SELECT * FROM Event WHERE EventID = ?', [eventId]);
      const [guests] = await connection.query('SELECT * FROM InvitedGuest WHERE EventID = ?', [eventId]);
      const [checkins] = await connection.query(
        `SELECT c.* FROM CheckInLog c 
         JOIN InvitedGuest g ON c.GuestID = g.GuestID 
         WHERE g.EventID = ?`, 
        [eventId]
      );
      const [souvenirs] = await connection.query(
        `SELECT s.* FROM Souvenir s 
         JOIN InvitedGuest g ON s.GuestID = g.GuestID 
         WHERE g.EventID = ?`, 
        [eventId]
      );
      const [dashboard] = await connection.query('SELECT * FROM Dashboard WHERE EventID = ?', [eventId]);

      // Prepare backup data
      const backupData = {
        timestamp: new Date().toISOString(),
        backupId: uuidv4(),
        event: event[0],
        dashboard: dashboard[0],
        guests,
        checkins,
        souvenirs
      };

      // Save to storage with unique name
      const fileName = `backup/${eventId}/${new Date().toISOString()}_backup.json`;
      await saveFile(fileName, JSON.stringify(backupData, null, 2));

      // Log successful backup
      logger.info(`Backup created for event ${eventId}: ${fileName}`);

      return {
        backupId: backupData.backupId,
        fileName,
        timestamp: backupData.timestamp
      };
    } catch (error) {
      logger.error(`Backup failed for event ${eventId}:`, error);
      throw error;
    } finally {
      await connection.end();
    }
  }

  static async scheduleEventBackups() {
    // Run every hour
    cron.schedule('0 * * * *', async () => {
      const connection = await connectDB();
      try {
        // Get all active events
        const [events] = await connection.query(
          'SELECT EventID FROM Event WHERE IsActive = true'
        );

        // Backup each event
        for (const event of events) {
          try {
            await this.backupEventData(event.EventID);
          } catch (error) {
            logger.error(`Failed to backup event ${event.EventID}:`, error);
          }
        }
      } catch (error) {
        logger.error('Failed to schedule event backups:', error);
      } finally {
        await connection.end();
      }
    });
  }

  static async manualBackup(eventId) {
    try {
      return await this.backupEventData(eventId);
    } catch (error) {
      logger.error(`Manual backup failed for event ${eventId}:`, error);
      throw error;
    }
  }

  static async listBackups(eventId) {
    try {
      // List all backup files for the event from storage
      const backupFiles = await listFiles(`backup/${eventId}/`);
      return backupFiles.map(file => ({
        fileName: file,
        timestamp: file.split('_')[0],
        url: `${process.env.STORAGE_URL}/backup/${eventId}/${file}`
      }));
    } catch (error) {
      logger.error(`Failed to list backups for event ${eventId}:`, error);
      throw error;
    }
  }
}