import logger from '../logger/logger.js';
import MetricsCollector from '../util/metricsCollector.js';

const errorMiddleware = async (err, req, res, next) => {
  // Log error details
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    user: req.user?.adminId
  });

  // Record error metric
  await MetricsCollector.recordError(err.name || 'UnknownError', {
    path: req.path,
    method: req.method,
    code: err.code,
    status: err.status,
    message: err.message
  });

  // Determine error type and appropriate response
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      code: 'AUTH_ERROR'
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: err.message,
      code: 'VALIDATION_ERROR'
    });
  }

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      message: 'Duplicate entry found',
      code: 'DUPLICATE_ERROR'
    });
  }

  // Database connection errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
    return res.status(503).json({
      success: false,
      message: 'Database service unavailable',
      code: 'DB_ERROR'
    });
  }

  // Record response time for error responses
  const responseTime = Date.now() - req.startTime;
  await MetricsCollector.recordResponseTime(req.path, responseTime);

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message,
    code: 'INTERNAL_ERROR'
  });
};

export default errorMiddleware;