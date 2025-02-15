import connectDB from '../config/dbConfig.js';

const createCheckinTable = async () => {
  const connection = await connectDB();
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
  await connection.query(query);
  await connection.end();
};

export { createCheckinTable };