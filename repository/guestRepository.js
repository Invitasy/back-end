import { getPool } from '../config/dbConfig.js';
import { v4 as uuidv4 } from 'uuid';

const addGuest = async (guestData) => {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    const id = uuidv4();
    const { name, eventId, familyId, souvenirType, guestType = 'regular' } = guestData;
    
    const query = `
      INSERT INTO InvitedGuest (
        GuestID, EventID, Name, FamilyID, 
        GuestType, SouvenirType
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    await connection.query(query, [
      id, eventId, name, familyId, 
      guestType, souvenirType
    ]);
    
    return { id };
  } finally {
    connection.release();
  }
};

const getGuestByQR = async (qrCode) => {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT 
        g.*, 
        e.EventName,
        e.EventDate
       FROM InvitedGuest g
       JOIN Event e ON g.EventID = e.EventID
       WHERE g.GuestQRCode = ? AND g.IsDeleted = false`,
      [qrCode]
    );
    return rows[0];
  } finally {
    connection.release();
  }
};

const updateGuestCheckIn = async (id) => {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    const query = `
      UPDATE InvitedGuest 
      SET CheckInStatus = 'checked-in'
      WHERE GuestID = ? 
      AND CheckInStatus = 'pending'
      AND IsDeleted = false
    `;
    const [result] = await connection.query(query, [id]);
    
    if (result.affectedRows > 0) {
      // Log check-in
      await connection.query(
        `INSERT INTO CheckInLog (CheckInID, GuestID, CheckInMethod)
         VALUES (UUID(), ?, 'qr')`,
        [id]
      );
    }
    
    return result.affectedRows > 0;
  } finally {
    connection.release();
  }
};

const updateGuest = async (id, updateData) => {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    const query = `
      UPDATE InvitedGuest 
      SET ? 
      WHERE GuestID = ? AND IsDeleted = false
    `;
    const [result] = await connection.query(query, [updateData, id]);
    return result.affectedRows > 0;
  } finally {
    connection.release();
  }
};

const deleteGuest = async (id) => {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'UPDATE InvitedGuest SET IsDeleted = true WHERE GuestID = ?',
      [id]
    );
    return result.affectedRows > 0;
  } finally {
    connection.release();
  }
};

const getAllGuests = async (eventId) => {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT 
        g.*,
        e.EventName,
        e.EventDate,
        c.CheckInDate as LastCheckIn,
        s.PickupStatus as SouvenirStatus
       FROM InvitedGuest g
       JOIN Event e ON g.EventID = e.EventID
       LEFT JOIN (
         SELECT GuestID, MAX(CheckInDate) as CheckInDate
         FROM CheckInLog
         GROUP BY GuestID
       ) c ON g.GuestID = c.GuestID
       LEFT JOIN Souvenir s ON g.GuestID = s.GuestID
       WHERE g.EventID = ? AND g.IsDeleted = false
       ORDER BY g.CreatedAt DESC`,
      [eventId]
    );
    return rows;
  } finally {
    connection.release();
  }
};

const getGuestsByFamily = async (familyId) => {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT * FROM InvitedGuest 
       WHERE FamilyID = ? AND IsDeleted = false`,
      [familyId]
    );
    return rows;
  } finally {
    connection.release();
  }
};

const getGuestById = async (id) => {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT 
        g.*,
        e.EventName,
        e.EventDate
       FROM InvitedGuest g
       JOIN Event e ON g.EventID = e.EventID
       WHERE g.GuestID = ? AND g.IsDeleted = false`,
      [id]
    );
    return rows[0];
  } finally {
    connection.release();
  }
};

export default {
  addGuest,
  getGuestByQR,
  updateGuestCheckIn,
  updateGuest,
  deleteGuest,
  getAllGuests,
  getGuestsByFamily,
  getGuestById
};