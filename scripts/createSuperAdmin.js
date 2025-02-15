import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import connectDB from '../config/dbConfig.js';
import logger from '../logger/logger.js';

const createSuperAdmin = async (email, password) => {
  try {
    const connection = await connectDB();
    const id = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO Admin (id, email, password, role)
      VALUES (?, ?, ?, 'superadmin')
    `;

    await connection.execute(query, [id, email, hashedPassword]);
    logger.info(`Superadmin created successfully: ${email}`);
    return { id, email, role: 'superadmin' };
  } catch (error) {
    logger.error('Failed to create superadmin:', error);
    throw error;
  }
};

// Jika script dijalankan langsung (bukan di-import)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.log('Usage: node createSuperAdmin.js <email> <password>');
    process.exit(1);
  }

  createSuperAdmin(email, password)
    .then(() => {
      console.log('Superadmin created successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed:', error);
      process.exit(1);
    });
}

export default createSuperAdmin;

// npm run create-superadmin your.email@example.com yourpassword
// node scripts/createSuperAdmin.js your.email@example.com yourpassword