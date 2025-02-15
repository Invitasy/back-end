import { getPool } from '../config/dbConfig.js';

const createAdminTable = async () => {
  const pool = getPool();
  if (!pool) {
    throw new Error('Database pool not initialized');
  }

  const query = `
    CREATE TABLE IF NOT EXISTS Admin (
      AdminID VARCHAR(36) PRIMARY KEY,
      Name VARCHAR(255) NOT NULL,
      Username VARCHAR(255) UNIQUE NOT NULL,
      Email VARCHAR(255) UNIQUE NOT NULL,
      Password VARCHAR(255) NOT NULL,
      CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  try {
    await pool.query(query);
    console.log('Admin table initialized successfully');
  } catch (error) {
    console.error('Error creating Admin table:', error);
    throw error;
  }
};

export { createAdminTable };