import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables for Node.js
if (!process.isBun) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  dotenv.config({ path: join(__dirname, '..', '.env') });
}

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  timezone: process.env.DB_TIMEZONE || 'local',
  connectionLimit: process.env.DB_CONNECTION_LIMIT || 10,
  waitForConnections: true,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

let pool = null;
let isClosing = false;

const connectDB = async () => {
  try {
    if (!pool && !isClosing) {
      pool = mysql.createPool(dbConfig);
      // Test the connection
      const connection = await pool.getConnection();
      await connection.ping(); // Verify connection is healthy
      connection.release();
      console.log("Database connected successfully!");
    }
    return pool;
  } catch (error) {
    console.error("Database connection failed:", error.message);
    pool = null; // Reset pool on connection failure
    throw new Error(`Database connection failed: ${error.message}`);
  }
};

const closePool = async () => {
  if (isClosing || !pool) {
    return; // Already closing or closed
  }
  
  isClosing = true;
  try {
    await pool.end();
    console.log("Database pool closed successfully");
  } catch (error) {
    console.log("Database pool force closed");
  } finally {
    pool = null;
    isClosing = false;
  }
};

const getPool = () => {
  if (isClosing) {
    throw new Error('Database pool is closing');
  }
  if (!pool) {
    throw new Error('Database pool is not initialized');
  }
  return pool;
};

export default connectDB;
export { closePool, getPool };