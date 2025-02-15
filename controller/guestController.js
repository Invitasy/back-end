import guestService from '../service/guestService.js';

const addGuest = async (req, res, next) => {
  try {
    const guestData = req.body;
    const result = await guestService.addGuest(guestData);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const checkInGuest = async (req, res, next) => {
  try {
    const { qrCode } = req.body;
    const result = await guestService.checkInGuest(qrCode);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const manualCheckIn = async (req, res, next) => {
  try {
    const { guestId } = req.params;
    const result = await guestService.manualCheckIn(guestId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const updateGuest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const result = await guestService.updateGuest(id, updateData);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const deleteGuest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await guestService.deleteGuest(id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getAllGuests = async (req, res, next) => {
  try {
    const guests = await guestService.getAllGuests();
    res.status(200).json(guests);
  } catch (error) {
    next(error);
  }
};

const updateSouvenirType = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type } = req.body;
    const result = await guestService.updateSouvenirType(id, type);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const reprintSouvenirQR = async (req, res, next) => {
  try {
    const { id } = req.params;
    const qrCode = await guestService.reprintSouvenirQR(id);
    res.status(200).json({ qrCode });
  } catch (error) {
    next(error);
  }
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