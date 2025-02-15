import { getPool } from '../config/dbConfig.js';
import { v4 as uuidv4 } from 'uuid';
import qrUtil from '../util/qrUtil.js';

const createSouvenir = async (familyId, type) => {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    const id = uuidv4();
    const qrCode = await qrUtil.generateSouvenirQRCode(id);
    
    const query = `
      INSERT INTO Souvenirs (id, familyId, qrCode, type)
      VALUES (?, ?, ?, ?)
    `;
    await connection.query(query, [id, familyId, qrCode, type]);
    return { id, qrCode };
  } finally {
    connection.release();
  }
};

const markCollected = async (id) => {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    const query = `
      UPDATE Souvenirs
      SET collectedAt = CURRENT_TIMESTAMP
      WHERE id = ? AND collectedAt IS NULL
    `;
    const [result] = await connection.query(query, [id]);
    return result.affectedRows > 0;
  } finally {
    connection.release();
  }
};

const getSouvenirByQR = async (qrCode) => {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    const query = `
      SELECT s.*, 
             GROUP_CONCAT(g.name) as familyMembers
      FROM Souvenirs s
      LEFT JOIN Guests g ON g.familyId = s.familyId
      WHERE s.qrCode = ?
      GROUP BY s.id
    `;
    const [rows] = await connection.query(query, [qrCode]);
    return rows[0];
  } finally {
    connection.release();
  }
};

const getFamilySouvenirs = async (familyId) => {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    const query = `
      SELECT * FROM Souvenirs
      WHERE familyId = ?
      ORDER BY createdAt DESC
    `;
    const [rows] = await connection.query(query, [familyId]);
    return rows;
  } finally {
    connection.release();
  }
};

const reprintSouvenirQR = async (id) => {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    const [souvenir] = await connection.query(
      'SELECT qrCode FROM Souvenirs WHERE id = ?',
      [id]
    );
    return souvenir?.[0]?.qrCode;
  } finally {
    connection.release();
  }
};

export default {
  createSouvenir,
  markCollected,
  getSouvenirByQR,
  getFamilySouvenirs,
  reprintSouvenirQR
};