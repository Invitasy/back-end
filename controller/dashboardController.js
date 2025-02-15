import dashboardService from '../service/dashboardService.js';

const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getDashboardStats();
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};

const getGuestCheckInHistory = async (req, res, next) => {
  try {
    const { limit } = req.query;
    const history = await dashboardService.getGuestCheckInHistory(Number(limit));
    res.status(200).json(history);
  } catch (error) {
    next(error);
  }
};

export default {
  getDashboardStats,
  getGuestCheckInHistory
};