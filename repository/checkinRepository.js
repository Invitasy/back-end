import { getPool } from '../config/dbConfig.js';
import { v4 as uuidv4 } from 'uuid';

const recordCheckin = async (guestId, checkinType, adminId = null) => {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    const id = uuidv4();
    const query = `
      INSERT INTO Checkins (id, guestId, checkinType, checkedInBy)
      VALUES (?, ?, ?, ?)
    `;
    await connection.query(query, [id, guestId, checkinType, adminId]);
    return id;
  } finally {
    connection.release();
  }
};

const markSouvenirCollected = async (checkinId) => {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    const query = `
      UPDATE Checkins
      SET souvenirCollected = true, souvenirCollectedTime = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const [result] = await connection.query(query, [checkinId]);
    return result.affectedRows > 0;
  } finally {
    connection.release();
  }
};

const getCheckinHistory = async (guestId) => {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    const query = `
      SELECT c.*, a.email as checkedInByEmail
      FROM Checkins c
      LEFT JOIN Admin a ON c.checkedInBy = a.id
      WHERE c.guestId = ?
      ORDER BY c.checkinTime DESC
    `;
    const [rows] = await connection.query(query, [guestId]);
    return rows;
  } finally {
    connection.release();
  }
};

const getRecentCheckins = async (limit = 10) => {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    const query = `
      SELECT c.*, g.name as guestName, a.email as checkedInByEmail
      FROM Checkins c
      JOIN Guests g ON c.guestId = g.id
      LEFT JOIN Admin a ON c.checkedInBy = a.id
      ORDER BY c.checkinTime DESC
      LIMIT ?
    `;
    const [rows] = await connection.query(query, [limit]);
    return rows;
  } finally {
    connection.release();
  }
};

export default {
  recordCheckin,
  markSouvenirCollected,
  getCheckinHistory,
  getRecentCheckins
};