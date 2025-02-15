import qrService from '../service/qrService.js';
import guestService from '../service/guestService.js';

const scanQR = async (req, res, next) => {
  try {
    const { qrData } = req.body;
    const result = await qrService.processQRScan(qrData);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const verifyQR = async (req, res, next) => {
  try {
    const { qrData } = req.body;
    const result = await qrService.verifyQR(qrData);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const generateQR = async (req, res, next) => {
  try {
    const { guestId } = req.params;
    const { type } = req.body; // 'checkin' or 'souvenir'
    const qrCode = await qrService.generateQR(guestId, type);
    res.status(200).json({ qrCode });
  } catch (error) {
    next(error);
  }
};

export default {
  scanQR,
  verifyQR,
  generateQR
};