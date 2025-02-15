import connectDB from '../config/dbConfig.js';

const createSouvenirTable = async () => {
  const connection = await connectDB();
  const query = `
    CREATE TABLE IF NOT EXISTS Souvenirs (
      id VARCHAR(36) PRIMARY KEY,
      familyId VARCHAR(36),
      qrCode VARCHAR(255) UNIQUE,
      type ENUM('individual', 'family') NOT NULL,
      collectedAt DATETIME,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (familyId) REFERENCES Guests(familyId)
    )
  `;
  await connection.query(query);
  await connection.end();
};

export { createSouvenirTable };