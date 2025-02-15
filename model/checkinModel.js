import connectDB from '../config/dbConfig.js';

// Function to create Checkin table
const createCheckinTable = async () => {
  const connection = await connectDB();
  const query = `
    CREATE TABLE IF NOT EXISTS Checkin (
      id VARCHAR(36) PRIMARY KEY,
      userId VARCHAR(36) NOT NULL,
      checkinTime DATETIME DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(50),
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  await connection.query(query);
  await connection.end();
};

export { createCheckinTable };