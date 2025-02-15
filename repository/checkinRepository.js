import connectDB from '../config/dbConfig.js';
import { v4 as uuidv4 } from 'uuid';

const recordCheckin = async (guestId, checkinType, adminId = null) => {
  const connection = await connectDB();
  const id = uuidv4();
  const query = `
    INSERT INTO Checkins (id, guestId, checkinType, checkedInBy)
    VALUES (?, ?, ?, ?)
  `;
  await connection.query(query, [id, guestId, checkinType, adminId]);
  await connection.end();
  return id;
};

const markSouvenirCollected = async (checkinId) => {
  const connection = await connectDB();
  const query = `
    UPDATE Checkins
    SET souvenirCollected = true, souvenirCollectedTime = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  const [result] = await connection.query(query, [checkinId]);
  await connection.end();
  return result.affectedRows > 0;
};

const getCheckinHistory = async (guestId) => {
  const connection = await connectDB();
  const query = `
    SELECT c.*, a.email as checkedInByEmail
    FROM Checkins c
    LEFT JOIN Admin a ON c.checkedInBy = a.id
    WHERE c.guestId = ?
    ORDER BY c.checkinTime DESC
  `;
  const [rows] = await connection.query(query, [guestId]);
  await connection.end();
  return rows;
};

const getRecentCheckins = async (limit = 10) => {
  const connection = await connectDB();
  const query = `
    SELECT c.*, g.name as guestName, a.email as checkedInByEmail
    FROM Checkins c
    JOIN Guests g ON c.guestId = g.id
    LEFT JOIN Admin a ON c.checkedInBy = a.id
    ORDER BY c.checkinTime DESC
    LIMIT ?
  `;
  const [rows] = await connection.query(query, [limit]);
  await connection.end();
  return rows;
};

export default {
  recordCheckin,
  markSouvenirCollected,
  getCheckinHistory,
  getRecentCheckins
};