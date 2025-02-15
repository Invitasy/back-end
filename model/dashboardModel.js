import connectDB from '../config/dbConfig.js';

const createDashboardTable = async () => {
  const connection = await connectDB();
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
  await connection.query(query);
  await connection.end();
};

export { createDashboardTable };