import mysql from 'mysql2/promise';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const runMigrations = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
  });

  try {
    // Create migrations table if it doesn't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Read all migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = await fs.readdir(migrationsDir);
    const migrationFiles = files.filter(f => f.endsWith('.sql')).sort();

    // Get executed migrations
    const [executed] = await connection.query('SELECT name FROM migrations');
    const executedMigrations = executed.map(row => row.name);

    // Run pending migrations
    for (const file of migrationFiles) {
      if (!executedMigrations.includes(file)) {
        console.log(`Running migration: ${file}`);
        const migrationPath = path.join(migrationsDir, file);
        const sql = await fs.readFile(migrationPath, 'utf8');

        await connection.query(sql);
        await connection.query('INSERT INTO migrations (name) VALUES (?)', [file]);
        console.log(`Completed migration: ${file}`);
      }
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await connection.end();
  }
};

runMigrations().catch(console.error);