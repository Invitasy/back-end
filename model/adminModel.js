import connectDB from '../config/dbConfig.js';

// Function to create Admin table
const createAdminTable = async () => {
  const connection = await connectDB();
  const query = `
    CREATE TABLE IF NOT EXISTS Admin (
      id VARCHAR(36) PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('admin', 'superadmin') DEFAULT 'admin',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  await connection.query(query);
  await connection.end();
};

export { createAdminTable };