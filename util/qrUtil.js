import QRCode from 'qrcode';

const generateQRCode = async (id) => {
  try {
    const qrString = JSON.stringify({ type: 'guest', id });
    return await QRCode.toDataURL(qrString);
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
};

const generateSouvenirQRCode = async (guestId) => {
  try {
    const qrString = JSON.stringify({ type: 'souvenir', guestId });
    return await QRCode.toDataURL(qrString);
  } catch (error) {
    throw new Error('Failed to generate souvenir QR code');
  }
};

const verifyQRCode = (qrData) => {
  try {
    const data = JSON.parse(qrData);
    return {
      isValid: data.type === 'guest' || data.type === 'souvenir',
      type: data.type,
      id: data.type === 'guest' ? data.id : data.guestId
    };
  } catch (error) {
    return { isValid: false };
  }
};

export default {
  generateQRCode,
  generateSouvenirQRCode,
  verifyQRCode
};