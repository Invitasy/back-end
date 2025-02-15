import { getPool } from '../config/dbConfig.js';
import { v4 as uuidv4 } from 'uuid';

const getAdminByEmail = async (email) => {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query('SELECT * FROM Admin WHERE email = ?', [email]);
    return rows[0];
  } finally {
    connection.release();
  }
};

const createAdmin = async (adminData) => {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    const id = uuidv4();
    const { email, password, role } = adminData;
    
    const query = `
      INSERT INTO Admin (id, email, password, role)
      VALUES (?, ?, ?, ?)
    `;
    await connection.query(query, [id, email, password, role]);
    return { id, email, role };
  } finally {
    connection.release();
  }
};

const deleteAdmin = async (id) => {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query('DELETE FROM Admin WHERE id = ? AND role != "superadmin"', [id]);
    return result.affectedRows > 0;
  } finally {
    connection.release();
  }
};

const getAllAdmins = async () => {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query('SELECT id, email, role, createdAt FROM Admin');
    return rows;
  } finally {
    connection.release();
  }
};

export {
  getAdminByEmail,
  createAdmin,
  deleteAdmin,
  getAllAdmins
};
