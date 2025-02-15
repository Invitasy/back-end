import { getPool } from '../config/dbConfig.js';

const createEventTable = async () => {
  const pool = getPool();
  if (!pool) {
    throw new Error('Database pool not initialized');
  }

  const query = `
    CREATE TABLE IF NOT EXISTS Event (
      EventID VARCHAR(36) PRIMARY KEY,
      AdminID VARCHAR(36) NOT NULL,
      EventName VARCHAR(255) NOT NULL,
      EventDate DATE NOT NULL,
      EventTime TIME,
      Location TEXT,
      IsActive BOOLEAN DEFAULT true,
      CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (AdminID) REFERENCES Admin(AdminID)
    )
  `;
  try {
    await pool.query(query);
    console.log('Event table initialized successfully');
  } catch (error) {
    console.error('Error creating Event table:', error);
    throw error;
  }
};

export { createEventTable };