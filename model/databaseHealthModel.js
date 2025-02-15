import { getPool } from '../config/dbConfig.js';

const createDatabaseHealthTable = async () => {
  const pool = getPool();
  if (!pool) {
    throw new Error('Database pool not initialized');
  }
  const query = `
    CREATE TABLE IF NOT EXISTS DatabaseHealth (
      HealthID VARCHAR(36) PRIMARY KEY,
      Status ENUM('healthy', 'unhealthy', 'degraded') DEFAULT 'healthy',
      LastChecked DATETIME DEFAULT CURRENT_TIMESTAMP,
      ResponseTime INT DEFAULT 0,
      ConnectionCount INT DEFAULT 0,
      ErrorMessage TEXT,
      CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  try {
    await pool.query(query);
    console.log('DatabaseHealth table initialized successfully');
  } catch (error) {
    console.error('Error creating DatabaseHealth table:', error);
    throw error;
  }
};

export { createDatabaseHealthTable };