import connectDB from '../config/dbConfig.js';

const createSouvenirTable = async () => {
  const connection = await connectDB();
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
  await connection.query(query);
  await connection.end();
};

export { createSouvenirTable };