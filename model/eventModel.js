import connectDB from '../config/dbConfig.js';

const createEventTable = async () => {
  const connection = await connectDB();
  const query = `
    CREATE TABLE IF NOT EXISTS Event (
      EventID VARCHAR(36) PRIMARY KEY,
      AdminID VARCHAR(36) NOT NULL,
      EventName VARCHAR(255) NOT NULL,
      EventDate DATE NOT NULL,
      EventTime TIME,
      Location TEXT,
      IsActive BOOLEAN DEFAULT true,
      CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (AdminID) REFERENCES Admin(AdminID)
    )
  `;
  await connection.query(query);
  await connection.end();
};

export { createEventTable };