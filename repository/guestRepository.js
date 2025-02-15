import connectDB from '../config/dbConfig.js';
import { v4 as uuidv4 } from 'uuid';

const addGuest = async (guestData) => {
  const connection = await connectDB();
  const id = uuidv4();
  const { name, familyId, souvenirType } = guestData;
  
  const query = `
    INSERT INTO Guests (id, name, familyId, souvenirType, qrCode)
    VALUES (?, ?, ?, ?, ?)
  `;
  const qrCode = uuidv4(); // This will be replaced with actual QR code later
  await connection.query(query, [id, name, familyId, souvenirType, qrCode]);
  await connection.end();
  return { id, qrCode };
};

const getGuestByQR = async (qrCode) => {
  const connection = await connectDB();
  const [rows] = await connection.query('SELECT * FROM Guests WHERE qrCode = ?', [qrCode]);
  await connection.end();
  return rows[0];
};

const updateGuestCheckIn = async (id) => {
  const connection = await connectDB();
  const query = `
    UPDATE Guests 
    SET isCheckedIn = true, checkInTime = CURRENT_TIMESTAMP
    WHERE id = ? AND isCheckedIn = false
  `;
  const [result] = await connection.query(query, [id]);
  await connection.end();
  return result.affectedRows > 0;
};

const updateGuest = async (id, updateData) => {
  const connection = await connectDB();
  const query = `
    UPDATE Guests 
    SET ? 
    WHERE id = ?
  `;
  const [result] = await connection.query(query, [updateData, id]);
  await connection.end();
  return result.affectedRows > 0;
};

const deleteGuest = async (id) => {
  const connection = await connectDB();
  const [result] = await connection.query('DELETE FROM Guests WHERE id = ?', [id]);
  await connection.end();
  return result.affectedRows > 0;
};

const getAllGuests = async () => {
  const connection = await connectDB();
  const [rows] = await connection.query('SELECT * FROM Guests');
  await connection.end();
  return rows;
};

export default {
  addGuest,
  getGuestByQR,
  updateGuestCheckIn,
  updateGuest,
  deleteGuest,
  getAllGuests
};