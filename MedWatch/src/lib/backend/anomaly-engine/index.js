/**
 * Main entry point for the Anomaly Detection Engine
 */
require('dotenv').config();

const AnomalyAPI = require('./api/anomaly-api');
const winston = require('winston');

// Create a logger instance for the application
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

async function main() {
  logger.info(' Starting MedWatch Anomaly Detection Engine...\n');

  try {
    // Configuration
    const config = {
      port: process.env.PORT || 3002,
      detector: {
        enableRuleEngine: process.env.ENABLE_RULES !== 'false',
        enableMLModels: process.env.ENABLE_ML !== 'false',
        processingInterval: parseInt(process.env.PROCESSING_INTERVAL, 10) || 30000,
        alertThreshold: parseFloat(process.env.ALERT_THRESHOLD) || 0.7,
        batchSize: parseInt(process.env.BATCH_SIZE, 10) || 1000
      }
    };

    // Start the API server, passing the logger instance
    const api = new AnomalyAPI(config, logger);
    await api.start();

    logger.info(' MedWatch Anomaly Detection Engine is running');
    logger.info(` API Server: http://localhost:${config.port}`);
    logger.info(` Health Check: http://localhost:${config.port}/health`);
    logger.info(` Statistics: http://localhost:${config.port}/api/stats`);
    logger.info('\n Ready to detect anomalies...\n');

  } catch (error) {
    logger.error(' Failed to start Anomaly Detection Engine:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
  process.exit(1);
});

// Start the application
if (require.main === module) {
  main();
}

module.exports = { main };
