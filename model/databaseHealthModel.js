import connectDB from '../config/dbConfig.js';

const createDatabaseHealthTable = async () => {
  const connection = await connectDB();
  const query = `
    CREATE TABLE IF NOT EXISTS DatabaseHealth (
      HealthID VARCHAR(36) PRIMARY KEY,
      Status ENUM('healthy', 'unhealthy', 'degraded') DEFAULT 'healthy',
      LastChecked DATETIME DEFAULT CURRENT_TIMESTAMP,
      ResponseTime INT DEFAULT 0,
      ConnectionCount INT DEFAULT 0,
      ErrorMessage TEXT,
      CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  await connection.query(query);
  await connection.end();
};

export { createDatabaseHealthTable };