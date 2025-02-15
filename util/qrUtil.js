import QRCode from 'qrcode';
import crypto from 'crypto';

const generateQRCode = async (id, eventId) => {
  try {
    const data = {
      type: 'guest',
      id,
      eventId,
      hash: generateHash(id, eventId)
    };
    return await QRCode.toDataURL(JSON.stringify(data));
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
};

const generateSouvenirQRCode = async (guestId, eventId) => {
  try {
    const data = {
      type: 'souvenir',
      guestId,
      eventId,
      hash: generateHash(guestId, eventId)
    };
    return await QRCode.toDataURL(JSON.stringify(data));
  } catch (error) {
    throw new Error('Failed to generate souvenir QR code');
  }
};

const verifyQRCode = (qrData) => {
  try {
    const data = JSON.parse(qrData);
    
    // Verify hash to prevent tampering
    const validHash = generateHash(
      data.type === 'guest' ? data.id : data.guestId, 
      data.eventId
    );
    
    if (data.hash !== validHash) {
      return { isValid: false };
    }

    return {
      isValid: data.type === 'guest' || data.type === 'souvenir',
      type: data.type,
      id: data.type === 'guest' ? data.id : data.guestId,
      eventId: data.eventId
    };
  } catch (error) {
    return { isValid: false };
  }
};

// Generate a hash to prevent QR code tampering
const generateHash = (id, eventId) => {
  const secret = process.env.QR_SECRET || 'default-secret-key';
  return crypto
    .createHmac('sha256', secret)
    .update(`${id}:${eventId}`)
    .digest('hex');
};

export default {
  generateQRCode,
  generateSouvenirQRCode,
  verifyQRCode
};