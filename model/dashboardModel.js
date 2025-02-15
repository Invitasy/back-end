import { getPool } from '../config/dbConfig.js';

const createDashboardTable = async () => {
  const pool = getPool();
  if (!pool) {
    throw new Error('Database pool not initialized');
  }
  
  const query = `
    CREATE TABLE IF NOT EXISTS Dashboard (
      DashboardID VARCHAR(36) PRIMARY KEY,
      AdminID VARCHAR(36),
      TotalGuests INT DEFAULT 0,
      TotalCheckIns INT DEFAULT 0,
      TotalPendingCheckIns INT DEFAULT 0,
      TotalSouvenirs INT DEFAULT 0,
      LastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (AdminID) REFERENCES Admin(AdminID)
    )
  `;
  try {
    await pool.query(query);
    console.log('Dashboard table initialized successfully');
  } catch (error) {
    console.error('Error creating Dashboard table:', error);
    throw error; // Propagate the error for handling in `initializeTables`
  }
};

export { createDashboardTable };