import connectDB from '../config/dbConfig.js';

class DatabaseHealth {
  static async checkConnection() {
    const startTime = Date.now();
    let status = 'healthy';
    let message = 'Database connection successful';
    let responseTime = 0;

    try {
      const pool = await connectDB();
      const connection = await pool.getConnection();
      
      // Test a simple query
      await connection.query('SELECT 1');
      responseTime = Date.now() - startTime;
      
      connection.release();

    } catch (error) {
      status = 'failed';
      message = error.message;
      responseTime = Date.now() - startTime;
    }

    // Record health check
    try {
      const pool = await connectDB();
      await pool.execute(
        'INSERT INTO DatabaseHealth (status, message, responseTime) VALUES (?, ?, ?)',
        [status, message, responseTime]
      );
    } catch (error) {
      console.error('Failed to record health check:', error);
    }

    return {
      status,
      message,
      responseTime,
      timestamp: new Date().toISOString()
    };
  }

  static async getHealthHistory(limit = 10) {
    try {
      const pool = await connectDB();
      const [rows] = await pool.query(
        'SELECT * FROM DatabaseHealth ORDER BY checkTime DESC LIMIT ?',
        [limit]
      );
      return rows;
    } catch (error) {
      console.error('Failed to get health history:', error);
      throw error;
    }
  }

  static async cleanup(retentionDays = 7) {
    try {
      const pool = await connectDB();
      await pool.execute(
        'DELETE FROM DatabaseHealth WHERE checkTime < DATE_SUB(NOW(), INTERVAL ? DAY)',
        [retentionDays]
      );
    } catch (error) {
      console.error('Failed to cleanup health history:', error);
      throw error;
    }
  }
}

export default DatabaseHealth;