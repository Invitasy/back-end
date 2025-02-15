import { getPool } from '../config/dbConfig.js';

const createGuestTable = async () => {
  const pool = getPool();
  if (!pool) {
    throw new Error('Database pool not initialized');
  }

  const query = `
    CREATE TABLE IF NOT EXISTS InvitedGuest (
      GuestID VARCHAR(36) PRIMARY KEY,
      AdminID VARCHAR(36),
      Name VARCHAR(255) NOT NULL,
      Address TEXT,
      CheckInStatus ENUM('pending', 'checked-in', 'absent') DEFAULT 'pending',
      GuestQRCode VARCHAR(255) UNIQUE,
      GuestType ENUM('regular', 'vip', 'family') DEFAULT 'regular',
      SouvenirType ENUM('type1', 'type2', 'type3') DEFAULT 'type1',
      SouvenirStatus ENUM('pending', 'collected') DEFAULT 'pending',
      CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (AdminID) REFERENCES Admin(AdminID)
    )
  `;
  try {
    await pool.query(query);
    console.log('InvitedGuest table initialized successfully');
  } catch (error) {
    console.error('Error creating InvitedGuest table:', error);
    throw error;
  }
};

export { createGuestTable };