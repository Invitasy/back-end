import connectDB from '../config/dbConfig.js';
import logger from '../logger/logger.js';
import { v4 as uuidv4 } from 'uuid';

class MetricsCollector {
  static async recordMetric(category, name, value, metadata = {}) {
    const connection = await connectDB();
    try {
      await connection.query(
        `INSERT INTO SystemMetrics (
          MetricID, Category, Name, 
          Value, Metadata, Timestamp
        ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [uuidv4(), category, name, value, JSON.stringify(metadata)]
      );
    } catch (error) {
      logger.error('Failed to record metric:', error);
    } finally {
      await connection.end();
    }
  }

  static async getMetricsSummary(timeRange = '24h') {
    const connection = await connectDB();
    try {
      const interval = timeRange === '24h' ? 'HOUR' : 'DAY';
      const [metrics] = await connection.query(
        `SELECT 
          Category,
          Name,
          AVG(Value) as AverageValue,
          MAX(Value) as MaxValue,
          MIN(Value) as MinValue,
          COUNT(*) as SampleCount,
          DATE_FORMAT(Timestamp, '%Y-%m-%d %H:00:00') as TimeBlock
         FROM SystemMetrics
         WHERE Timestamp >= DATE_SUB(NOW(), INTERVAL 1 ${interval})
         GROUP BY Category, Name, TimeBlock
         ORDER BY TimeBlock DESC`
      );
      return metrics;
    } finally {
      await connection.end();
    }
  }

  static async getMetricsByCategory(category, timeRange = '24h') {
    const connection = await connectDB();
    try {
      const [metrics] = await connection.query(
        `SELECT * FROM SystemMetrics
         WHERE Category = ?
         AND Timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
         ORDER BY Timestamp DESC`,
        [category, timeRange === '24h' ? 24 : timeRange * 24]
      );
      return metrics;
    } finally {
      await connection.end();
    }
  }

  // Pre-defined metric categories
  static get CATEGORIES() {
    return {
      PERFORMANCE: 'performance',
      SECURITY: 'security',
      USAGE: 'usage',
      ERROR: 'error'
    };
  }

  // Common metric collectors
  static async recordResponseTime(endpoint, responseTime) {
    await this.recordMetric(
      this.CATEGORIES.PERFORMANCE,
      'api_response_time',
      responseTime,
      { endpoint }
    );
  }

  static async recordLoginAttempt(success, metadata = {}) {
    await this.recordMetric(
      this.CATEGORIES.SECURITY,
      'login_attempt',
      success ? 1 : 0,
      metadata
    );
  }

  static async recordActiveUsers(count, eventId = null) {
    await this.recordMetric(
      this.CATEGORIES.USAGE,
      'active_users',
      count,
      { eventId }
    );
  }

  static async recordError(errorType, details = {}) {
    await this.recordMetric(
      this.CATEGORIES.ERROR,
      errorType,
      1,
      details
    );
  }
}

export default MetricsCollector;