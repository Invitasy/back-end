import { getPool } from '../config/dbConfig.js';

const createAdminSessionTable = async () => {
  const pool = getPool();
  if (!pool) {
    throw new Error('Database pool not initialized');
  }

  const query = `
    CREATE TABLE IF NOT EXISTS AdminSession (
      SessionID VARCHAR(36) PRIMARY KEY,
      AdminID VARCHAR(36) NOT NULL,
      EventID VARCHAR(36) NOT NULL,
      DeviceInfo VARCHAR(255),
      LastActive DATETIME DEFAULT CURRENT_TIMESTAMP,
      Token VARCHAR(500) NOT NULL,
      IsActive BOOLEAN DEFAULT true,
      CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (AdminID) REFERENCES Admin(AdminID),
      FOREIGN KEY (EventID) REFERENCES Event(EventID)
    )
  `;
  try {
    await pool.query(query);
    console.log('AdminSession table initialized successfully');
  } catch (error) {
    console.error('Error creating AdminSession table:', error);
    throw error;
  }
};

export { createAdminSessionTable };