import app from './app.js';
import connectDB from './config/dbConfig.js';
import logger from './logger/logger.js';
import { createAdminTable } from './model/adminModel.js';
import { createEventTable } from './model/eventModel.js';
import { createGuestTable } from './model/guestModel.js';
import { createCheckinTable } from './model/checkinModel.js';
import { createSouvenirTable } from './model/souvenirModel.js';
import { createDashboardTable } from './model/dashboardModel.js';
import { createDatabaseHealthTable } from './model/databaseHealthModel.js';
import { createAdminSessionTable } from './model/adminSessionModel.js';
import DatabaseHealth from './util/databaseHealth.js';
import { 
  scheduleFullBackup, 
  scheduleEventBackups,
  scheduleHealthChecks,
  scheduleSessionCleanup 
} from './config/scheduleConfig.js';

const PORT = process.env.PORT || 5000;

const initializeTables = async () => {
  try {
    await createAdminTable();
    await createEventTable();
    await createAdminSessionTable();
    await createDashboardTable();
    await createGuestTable();
    await createCheckinTable();
    await createSouvenirTable();
    await createDatabaseHealthTable();
    logger.info('Database tables initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize tables:', error);
    process.exit(1);
  }
};

const startScheduledTasks = () => {
  // Start all scheduled tasks
  scheduleFullBackup();
  scheduleEventBackups();
  scheduleHealthChecks();
  scheduleSessionCleanup();
  logger.info('All scheduled tasks initialized');
};

const startServer = async () => {
  try {
    // Test database connection
    const pool = await connectDB();
    logger.info('Database connection established');
    
    // Initialize database tables
    await initializeTables();
    
    // Initial health check
    const healthStatus = await DatabaseHealth.checkConnection();
    logger.info('Initial health check:', healthStatus);

    // Start scheduled tasks
    startScheduledTasks();
    
    // Start Express server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info('Documentation available at /docs');
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
  try {
    await pool?.end();
    logger.info('Database connections closed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
});

startServer();