import connectDB from '../config/dbConfig.js';
import { v4 as uuidv4 } from 'uuid';

const getAdminByEmail = async (email) => {
  const connection = await connectDB();
  const [rows] = await connection.query('SELECT * FROM Admin WHERE email = ?', [email]);
  await connection.end();
  return rows[0];
};

const createAdmin = async (adminData) => {
  const connection = await connectDB();
  const id = uuidv4();
  const { email, password, role } = adminData;
  
  const query = `
    INSERT INTO Admin (id, email, password, role)
    VALUES (?, ?, ?, ?)
  `;
  await connection.query(query, [id, email, password, role]);
  await connection.end();
  return { id, email, role };
};

const deleteAdmin = async (id) => {
  const connection = await connectDB();
  const [result] = await connection.query('DELETE FROM Admin WHERE id = ? AND role != "superadmin"', [id]);
  await connection.end();
  return result.affectedRows > 0;
};

const getAllAdmins = async () => {
  const connection = await connectDB();
  const [rows] = await connection.query('SELECT id, email, role, createdAt FROM Admin');
  await connection.end();
  return rows;
};

export {
  getAdminByEmail,
  createAdmin,
  deleteAdmin,
  getAllAdmins
};
