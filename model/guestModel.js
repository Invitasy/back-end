import connectDB from '../config/dbConfig.js';

const createGuestTable = async () => {
  const connection = await connectDB();
  const query = `
    CREATE TABLE IF NOT EXISTS Guest (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      checkinTime DATETIME DEFAULT CURRENT_TIMESTAMP,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  await connection.query(query);
  await connection.end();
};

export { createGuestTable };