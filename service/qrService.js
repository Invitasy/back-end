import qrUtil from '../util/qrUtil.js';
import guestService from './guestService.js';

const processQRScan = async (qrData) => {
  const { isValid, type, id } = qrUtil.verifyQRCode(qrData);
  if (!isValid) throw new Error('Invalid QR code');

  if (type === 'guest') {
    return await guestService.checkInGuest(id);
  } else if (type === 'souvenir') {
    return await guestService.markSouvenirCollected(id);
  }

  throw new Error('Unknown QR code type');
};

const verifyQR = async (qrData) => {
  const result = qrUtil.verifyQRCode(qrData);
  if (!result.isValid) throw new Error('Invalid QR code');
  return result;
};

const generateQR = async (guestId, type) => {
  if (type === 'checkin') {
    return await qrUtil.generateQRCode(guestId);
  } else if (type === 'souvenir') {
    return await qrUtil.generateSouvenirQRCode(guestId);
  }
  throw new Error('Invalid QR type requested');
};

export default {
  processQRScan,
  verifyQR,
  generateQR
};