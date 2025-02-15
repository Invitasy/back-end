import DatabaseHealth from '../util/databaseHealth.js';
import { responseSuccess, responseError } from '../util/responseUtil.js';

const checkHealth = async (req, res, next) => {
  try {
    const healthStatus = await DatabaseHealth.checkConnection();
    res.status(200).json(responseSuccess(healthStatus));
  } catch (error) {
    next(error);
  }
};

const getHealthHistory = async (req, res, next) => {
  try {
    const { limit } = req.query;
    const history = await DatabaseHealth.getHealthHistory(Number(limit) || 10);
    res.status(200).json(responseSuccess(history));
  } catch (error) {
    next(error);
  }
};

const cleanupHealthHistory = async (req, res, next) => {
  try {
    const { days } = req.query;
    await DatabaseHealth.cleanup(Number(days) || 7);
    res.status(200).json(responseSuccess(null, 'Health history cleanup completed'));
  } catch (error) {
    next(error);
  }
};

export default {
  checkHealth,
  getHealthHistory,
  cleanupHealthHistory
};