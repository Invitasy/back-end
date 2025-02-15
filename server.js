import app from './app.js';
import connectDB, { closePool, getPool } from './config/dbConfig.js';
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
let server = null;
let isShuttingDown = false;

// Global shutdown handler
const shutdown = async (signal) => {
  if (isShuttingDown) {
    return; // Prevent multiple shutdown attempts
  }
  
  isShuttingDown = true;
  logger.info(`${signal} signal received. Starting graceful shutdown...`);
  
  try {
    if (server) {
      await new Promise((resolve) => {
        server.close(resolve);
        logger.info('HTTP server closed');
      });
    }
    
    await closePool();
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
};

// Clean up resources before Bun hot reloads
if (process.isBun) {
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('beforeExit', () => shutdown('beforeExit'));
}

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
    throw error;
  }
};

const startScheduledTasks = () => {
  scheduleFullBackup();
  scheduleEventBackups();
  scheduleHealthChecks();
  scheduleSessionCleanup();
  logger.info('All scheduled tasks initialized');
};

const startServer = async () => {
  try {
    // Initialize database and tasks first
    await connectDB();
    logger.info('Database connection established');
    
    await initializeTables();
    
    const healthStatus = await DatabaseHealth.checkConnection();
    logger.info('Initial health check:', healthStatus);
    
    startScheduledTasks();

    // Create server instance and start listening
    server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info('Documentation available at /docs');
    });

    // Handle server errors
    server.once('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        throw new Error(`Port ${PORT} is already in use. Please ensure no other instance is running.`);
      }
      throw error;
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    await closePool();
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
  logger.error('Uncaught Exception:', error);
  await shutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', async (error) => {
  logger.error('Unhandled Rejection:', error);
  await shutdown('UNHANDLED_REJECTION');
});

// Start the server
startServer();