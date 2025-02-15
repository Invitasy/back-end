import { getPool } from '../config/dbConfig.js';

const createSouvenirTable = async () => {
  const pool = getPool();
  if (!pool) {
    throw new Error('Database pool not initialized');
  }
  const query = `
    CREATE TABLE IF NOT EXISTS Souvenir (
      SouvenirID VARCHAR(36) PRIMARY KEY,
      GuestID VARCHAR(36),
      SouvenirQRCode VARCHAR(255) UNIQUE,
      PickupStatus ENUM('pending', 'picked-up') DEFAULT 'pending',
      CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (GuestID) REFERENCES InvitedGuest(GuestID)
    )
  `;
  try {
    await pool.query(query);
    console.log('Souvenir table initialized successfully');
  } catch (error) {
    console.error('Error creating Souvenir table:', error);
    throw error;
  }
};

export { createSouvenirTable };