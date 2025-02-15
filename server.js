import app from './app.js';
import connectDB from './config/dbConfig.js';
import logger from './logger/logger.js';
import { createAdminTable } from './model/adminModel.js';
import { createGuestTable } from './model/guestModel.js';
import { createCheckinTable } from './model/checkinModel.js';
import { createSouvenirTable } from './model/souvenirModel.js';
import DatabaseHealth from './util/databaseHealth.js';
import { scheduleBackups, scheduleHealthChecks } from './config/scheduleConfig.js';

const PORT = process.env.PORT || 5000;

const initializeTables = async () => {
  try {
    await createAdminTable();
    await createGuestTable();
    await createCheckinTable();
    await createSouvenirTable();
    logger.info('Database tables initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize tables:', error);
    process.exit(1);
  }
};

const startServer = async () => {
  try {
    // Test database connection
    await connectDB();
    
    // Initialize database tables
    await initializeTables();
    
    // Initial health check
    const healthStatus = await DatabaseHealth.checkConnection();
    logger.info('Initial health check:', healthStatus);

    // Start scheduled tasks
    scheduleBackups();
    scheduleHealthChecks();
    
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Rejection:', error);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received. Shutting down gracefully...');
  await closePool();
  process.exit(0);
});

startServer();