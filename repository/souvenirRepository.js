import connectDB from '../config/dbConfig.js';
import { v4 as uuidv4 } from 'uuid';
import qrUtil from '../util/qrUtil.js';

const createSouvenir = async (familyId, type) => {
  const connection = await connectDB();
  const id = uuidv4();
  const qrCode = await qrUtil.generateSouvenirQRCode(id);
  
  const query = `
    INSERT INTO Souvenirs (id, familyId, qrCode, type)
    VALUES (?, ?, ?, ?)
  `;
  await connection.query(query, [id, familyId, qrCode, type]);
  await connection.end();
  return { id, qrCode };
};

const markCollected = async (id) => {
  const connection = await connectDB();
  const query = `
    UPDATE Souvenirs
    SET collectedAt = CURRENT_TIMESTAMP
    WHERE id = ? AND collectedAt IS NULL
  `;
  const [result] = await connection.query(query, [id]);
  await connection.end();
  return result.affectedRows > 0;
};

const getSouvenirByQR = async (qrCode) => {
  const connection = await connectDB();
  const query = `
    SELECT s.*, 
           GROUP_CONCAT(g.name) as familyMembers
    FROM Souvenirs s
    LEFT JOIN Guests g ON g.familyId = s.familyId
    WHERE s.qrCode = ?
    GROUP BY s.id
  `;
  const [rows] = await connection.query(query, [qrCode]);
  await connection.end();
  return rows[0];
};

const getFamilySouvenirs = async (familyId) => {
  const connection = await connectDB();
  const query = `
    SELECT * FROM Souvenirs
    WHERE familyId = ?
    ORDER BY createdAt DESC
  `;
  const [rows] = await connection.query(query, [familyId]);
  await connection.end();
  return rows;
};

const reprintSouvenirQR = async (id) => {
  const connection = await connectDB();
  const [souvenir] = await connection.query(
    'SELECT qrCode FROM Souvenirs WHERE id = ?',
    [id]
  );
  await connection.end();
  return souvenir?.[0]?.qrCode;
};

export default {
  createSouvenir,
  markCollected,
  getSouvenirByQR,
  getFamilySouvenirs,
  reprintSouvenirQR
};