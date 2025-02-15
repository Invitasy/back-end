import guestRepository from '../repository/guestRepository.js';
import qrUtil from '../util/qrUtil.js';

const addGuest = async (guestData) => {
  const result = await guestRepository.addGuest(guestData);
  const qrCode = await qrUtil.generateQRCode(result.id);
  await guestRepository.updateGuest(result.id, { qrCode });
  return { ...result, qrCode };
};

const checkInGuest = async (qrCode) => {
  const guest = await guestRepository.getGuestByQR(qrCode);
  if (!guest) throw new Error('Guest not found');
  if (guest.isCheckedIn) throw new Error('Guest already checked in');
  
  const updated = await guestRepository.updateGuestCheckIn(guest.id);
  if (!updated) throw new Error('Check-in failed');

  // Generate souvenir QR code
  const souvenirQR = await qrUtil.generateSouvenirQRCode(guest.id);
  await guestRepository.updateGuest(guest.id, { souvenirQRCode: souvenirQR });
  
  return { ...guest, souvenirQRCode: souvenirQR };
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

const getAllGuests = async () => {
  return await guestRepository.getAllGuests();
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

export default {
  addGuest,
  checkInGuest,
  manualCheckIn,
  updateGuest,
  deleteGuest,
  getAllGuests,
  updateSouvenirType,
  reprintSouvenirQR
};