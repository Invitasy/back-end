import connectDB from '../config/dbConfig.js';

// Function to create Admin table
const createAdminTable = async () => {
  const connection = await connectDB();
  const query = `
    CREATE TABLE IF NOT EXISTS Admin (
      AdminID VARCHAR(36) PRIMARY KEY,
      Name VARCHAR(255) NOT NULL,
      Username VARCHAR(255) UNIQUE NOT NULL,
      Email VARCHAR(255) UNIQUE NOT NULL,
      Password VARCHAR(255) NOT NULL,
      CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  await connection.query(query);
  await connection.end();
};

export { createAdminTable };