import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  timezone: process.env.DB_TIMEZONE || 'local',
  connectionLimit: process.env.DB_CONNECTION_LIMIT || 10,
  waitForConnections: true,
  queueLimit: 0
};

let pool;

const connectDB = async () => {
  try {
    if (!pool) {
      pool = mysql.createPool(dbConfig);
      // Test the connection
      const connection = await pool.getConnection();
      console.log("Database connected successfully!");
      connection.release();
    }
    return pool;
  } catch (error) {
    console.error("Database connection failed:", error.message);
    throw new Error(`Database connection failed: ${error.message}`);
  }
};

// Graceful shutdown handler
const closePool = async () => {
  try {
    if (pool) {
      await pool.end();
      console.log('Database pool closed successfully');
    }
  } catch (error) {
    console.error('Error closing database pool:', error);
    throw error;
  }
};

process.on('SIGINT', async () => {
  await closePool();
  process.exit(0);
});

export default connectDB;
export { closePool };