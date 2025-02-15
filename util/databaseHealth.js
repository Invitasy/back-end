import connectDB from '../config/dbConfig.js';
import logger from '../logger/logger.js';
import { v4 as uuidv4 } from 'uuid';

class DatabaseHealth {
  static async checkConnection() {
    const startTime = Date.now();
    let status = 'healthy';
    let message = 'Database connection successful';
    let responseTime = 0;
    let connectionCount = 0;

    try {
      const pool = await connectDB();
      const connection = await pool.getConnection();
      
      // Test connection
      await connection.query('SELECT 1');
      responseTime = Date.now() - startTime;

      // Get active connections count
      const [connectionStats] = await connection.query(
        'SHOW STATUS WHERE Variable_name = "Threads_connected"'
      );
      connectionCount = connectionStats[0]?.Value || 0;

      // Check if response time is above threshold
      if (responseTime > 1000) {
        status = 'degraded';
        message = 'Database response time is high';
      }

      connection.release();
    } catch (error) {
      status = 'unhealthy';
      message = error.message;
      responseTime = Date.now() - startTime;
      logger.error('Database health check failed:', error);
    }

    // Record health check
    await this.recordHealthCheck({
      status,
      message,
      responseTime,
      connectionCount
    });

    return {
      status,
      message,
      responseTime,
      connectionCount,
      timestamp: new Date().toISOString()
    };
  }

  static async recordHealthCheck(data) {
    try {
      const connection = await connectDB();
      await connection.query(
        `INSERT INTO DatabaseHealth (
          HealthID, Status, ResponseTime, 
          ConnectionCount, ErrorMessage
        ) VALUES (?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          data.status,
          data.responseTime,
          data.connectionCount,
          data.message
        ]
      );
      await connection.end();
    } catch (error) {
      logger.error('Failed to record health check:', error);
    }
  }

  static async getHealthHistory(days = 1) {
    const connection = await connectDB();
    try {
      const [history] = await connection.query(
        `SELECT * FROM DatabaseHealth 
         WHERE LastChecked >= DATE_SUB(NOW(), INTERVAL ? DAY)
         ORDER BY LastChecked DESC`,
        [days]
      );
      return history;
    } finally {
      await connection.end();
    }
  }

  static async cleanup(retentionDays = 7) {
    const connection = await connectDB();
    try {
      await connection.query(
        `DELETE FROM DatabaseHealth 
         WHERE LastChecked < DATE_SUB(NOW(), INTERVAL ? DAY)`,
        [retentionDays]
      );
      logger.info(`Cleaned up health history older than ${retentionDays} days`);
    } catch (error) {
      logger.error('Failed to cleanup health history:', error);
    } finally {
      await connection.end();
    }
  }

  static async getHealthSummary() {
    const connection = await connectDB();
    try {
      const [summary] = await connection.query(
        `SELECT 
          Status,
          COUNT(*) as Count,
          AVG(ResponseTime) as AvgResponseTime,
          MAX(ResponseTime) as MaxResponseTime
         FROM DatabaseHealth
         WHERE LastChecked >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
         GROUP BY Status`
      );
      return summary;
    } finally {
      await connection.end();
    }
  }
}

export default DatabaseHealth;