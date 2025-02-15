import guestService from './guestService.js';

const getDashboardStats = async () => {
  const guests = await guestService.getAllGuests();
  
  return {
    totalGuests: guests.length,
    checkedIn: guests.filter(g => g.isCheckedIn).length,
    pendingCheckIn: guests.filter(g => !g.isCheckedIn).length,
    souvenirStats: {
      individual: guests.filter(g => g.souvenirType === 'individual').length,
      family: guests.filter(g => g.souvenirType === 'family').length,
      collected: guests.filter(g => g.souvenirCollected).length
    }
  };
};

const getGuestCheckInHistory = async (limit = 10) => {
  const guests = await guestService.getAllGuests();
  return guests
    .filter(g => g.isCheckedIn)
    .sort((a, b) => new Date(b.checkInTime) - new Date(a.checkInTime))
    .slice(0, limit);
};

export default {
  getDashboardStats,
  getGuestCheckInHistory
};