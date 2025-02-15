import { getPool } from '../config/dbConfig.js';

const createCheckinTable = async () => {
  const pool = getPool();
  if (!pool) {
    throw new Error('Database pool not initialized');
  }
  const query = `
    CREATE TABLE IF NOT EXISTS CheckInLog (
      CheckInID VARCHAR(36) PRIMARY KEY,
      GuestID VARCHAR(36),
      CheckInDate DATETIME DEFAULT CURRENT_TIMESTAMP,
      CheckInMethod ENUM('qr', 'manual') NOT NULL,
      CheckInStatus ENUM('success', 'failed') DEFAULT 'success',
      FOREIGN KEY (GuestID) REFERENCES InvitedGuest(GuestID)
    )
  `;
  try {
    await pool.query(query);
    console.log('CheckInLog table initialized successfully');
  } catch (error) {
    console.error('Error creating CheckInLog table:', error);
    throw error;
  }
};

export { createCheckinTable };