import guestRepository from '../repository/guestRepository.js';
import qrUtil from '../util/qrUtil.js';
import { v4 as uuidv4 } from 'uuid';
import connectDB from '../config/dbConfig.js';
import logger from '../logger/logger.js';

const addGuest = async (guestData) => {
  try {
    const result = await guestRepository.addGuest(guestData);
    const qrCode = await qrUtil.generateQRCode(result.id);
    await guestRepository.updateGuest(result.id, { qrCode });
    logger.info(`Guest added successfully: ${result.id}`);
    return { ...result, qrCode };
  } catch (error) {
    logger.error(`Failed to add guest: ${error.message}`);
    throw error;
  }
};

const checkInGuest = async (qrCode) => {
  try {
    const guest = await guestRepository.getGuestByQR(qrCode);
    if (!guest) throw new Error('Guest not found');
    if (guest.isCheckedIn) throw new Error('Guest already checked in');
    
    const updated = await guestRepository.updateGuestCheckIn(guest.id);
    if (!updated) throw new Error('Check-in failed');

    const souvenirQR = await qrUtil.generateSouvenirQRCode(guest.id);
    await guestRepository.updateGuest(guest.id, { souvenirQRCode: souvenirQR });
    
    logger.info(`Guest checked in successfully: ${guest.id}`);
    return { ...guest, souvenirQRCode: souvenirQR };
  } catch (error) {
    logger.error(`Check-in failed: ${error.message}`);
    throw error;
  }
};

const manualCheckIn = async (guestId) => {
  const updated = await guestRepository.updateGuestCheckIn(guestId);
  if (!updated) throw new Error('Manual check-in failed');
  return updated;
};

const updateGuest = async (id, updateData) => {
  const updated = await guestRepository.updateGuest(id, updateData);
  if (!updated) throw new Error('Guest update failed');
  return updated;
};

const deleteGuest = async (id) => {
  const deleted = await guestRepository.deleteGuest(id);
  if (!deleted) throw new Error('Guest deletion failed');
  return deleted;
};

const getAllGuests = async (eventId, includeDeleted = false) => {
  try {
    return await GuestService.getGuests(eventId, includeDeleted);
  } catch (error) {
    logger.error(`Failed to get guests: ${error.message}`);
    throw error;
  }
};

const updateSouvenirType = async (id, type) => {
  if (!['individual', 'family'].includes(type)) {
    throw new Error('Invalid souvenir type');
  }
  return await guestRepository.updateGuest(id, { souvenirType: type });
};

const reprintSouvenirQR = async (id) => {
  const guest = await guestRepository.getGuestById(id);
  if (!guest) throw new Error('Guest not found');
  if (!guest.souvenirQRCode) throw new Error('No souvenir QR code found');
  return guest.souvenirQRCode;
};

class GuestService {
  static async softDeleteGuest(guestId, adminId, reason) {
    const connection = await connectDB();
    try {
      await connection.query(
        `UPDATE InvitedGuest 
         SET IsDeleted = true,
         DeletedAt = CURRENT_TIMESTAMP,
         DeletedBy = ?,
         DeleteReason = ?
         WHERE GuestID = ?`,
        [adminId, reason, guestId]
      );
    } finally {
      await connection.end();
    }
  }

  static async restoreGuest(guestId) {
    const connection = await connectDB();
    try {
      await connection.query(
        `UPDATE InvitedGuest 
         SET IsDeleted = false,
         DeletedAt = NULL,
         DeletedBy = NULL,
         DeleteReason = NULL
         WHERE GuestID = ?`,
        [guestId]
      );
    } finally {
      await connection.end();
    }
  }

  static async getDeletedGuests(eventId) {
    const connection = await connectDB();
    try {
      const [guests] = await connection.query(
        `SELECT 
          g.*,
          a.Name as DeletedByName,
          a.Email as DeletedByEmail,
          e.EventName
         FROM InvitedGuest g
         LEFT JOIN Admin a ON g.DeletedBy = a.AdminID
         LEFT JOIN Event e ON g.EventID = e.EventID
         WHERE g.EventID = ? AND g.IsDeleted = true
         ORDER BY g.DeletedAt DESC`,
        [eventId]
      );
      return guests;
    } finally {
      await connection.end();
    }
  }

  static async getGuests(eventId, includeDeleted = false) {
    const connection = await connectDB();
    try {
      const [guests] = await connection.query(
        `SELECT 
          g.*,
          e.EventName,
          e.EventDate
         FROM InvitedGuest g
         JOIN Event e ON g.EventID = e.EventID
         WHERE g.EventID = ? 
         ${!includeDeleted ? 'AND g.IsDeleted = false' : ''}
         ORDER BY g.CreatedAt DESC`,
        [eventId]
      );
      return guests;
    } finally {
      await connection.end();
    }
  }

  static async updateBulkGuests(eventId, guestIds, updateData) {
    const connection = await connectDB();
    try {
      await connection.query(
        `UPDATE InvitedGuest 
         SET ?
         WHERE EventID = ? AND GuestID IN (?)`,
        [updateData, eventId, guestIds]
      );
      return true;
    } finally {
      await connection.end();
    }
  }
}

export default {
  addGuest,
  checkInGuest,
  manualCheckIn,
  updateGuest,
  deleteGuest,
  getAllGuests,
  updateSouvenirType,
  reprintSouvenirQR,
  GuestService
};