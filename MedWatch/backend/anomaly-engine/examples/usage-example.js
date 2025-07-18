/* eslint-disable no-console */
/**
 * Usage Example for Anomaly Detection Engine
 * Demonstrates how to use the anomaly detection system
 */

const AnomalyDetector = require('../core/anomaly-detector');
const winston = require('winston');

// Create a logger for the example
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp, ...meta }) => {
      const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
      return `[${level.toUpperCase()}] ${timestamp} - ${message} ${metaString}`;
    })
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


async function runExample() {
  const startTime = Date.now();

  logger.info('Starting Anomaly Detection Engine Example...');

  // Initialize the anomaly detector with the logger
  const detector = new AnomalyDetector({
    enableRuleEngine: true,
    enableMLModels: true,
    processingInterval: 5000, // 5 seconds for demo
    alertThreshold: 0.6
  }, logger);

  // Set up event listeners
  detector.on('initialized', () => {
    logger.info('Anomaly Detection Engine initialized');
  });

  detector.on('anomaly-detected', (anomaly) => {
    logger.warn('Anomaly Detected', {
      type: anomaly.type,
      confidence: `${(anomaly.confidence * 100).toFixed(1)}%`,
      medicine: anomaly.dataPoint?.medicineName,
      location: anomaly.dataPoint?.location,
      details: anomaly.message
    });
  });

  detector.on('alert-sent', (alert) => {
    logger.info('Alert Sent', {
      id: alert.id,
      severity: alert.severity
    });
  });

  detector.on('batch-processed', (info) => {
    logger.info('Batch Processed', {
      batchSize: info.batchSize,
      timestamp: new Date().toISOString()
    });
  });

  // Start the detector
  await detector.start();

  // Generate sample data points
  const sampleData = generateSampleData();

  logger.info('Submitting sample data points...', {
    count: sampleData.length,
    cities: [...new Set(sampleData.map(d => d.location))]
  });

  // Submit data points
  for (const dataPoint of sampleData) {
    detector.addData(dataPoint);
    await sleep(1000); // Wait 1 second between submissions
  }

  // Wait for processing
  await sleep(10000);

  // Display statistics
  logger.info('Final Statistics');
  const stats = detector.getStatistics();
  logger.info('Statistics Details', stats);

  // Display recent anomalies
  logger.info('Recent Anomalies');
  const recentAnomalies = detector.getRecentAnomalies(5);
  recentAnomalies.forEach((anomaly, index) => {
    logger.info(`Anomaly ${index + 1}`, {
      type: anomaly.type,
      medicine: anomaly.dataPoint?.medicineName,
      confidence: `${(anomaly.confidence * 100).toFixed(1)}%`
    });
  });

  // Stop the detector
  await detector.stop();
  logger.info('Example completed', {
    totalAnomalies: recentAnomalies.length,
    executionTime: `${Date.now() - startTime}ms`
  });
}

function generateSampleData() {
  return [
    // Delhi - Multiple anomalies (price spike and stock shortage)
    {
      medicineName: 'Metformin 500mg',
      location: 'Delhi',
      currentStock: 25,
      criticalThreshold: 50,
      currentPrice: 185,
      averageMarketPrice: 80,
      stockHistory: [160, 120, 90, 60, 40, 25],
      priceHistory: [80, 85, 95, 120, 150, 185],
      dailyConsumption: 15,
      qualityIssue: false,
      supplierDelay: true,
      timestamp: new Date().toISOString()
    },

    // Mumbai - Manufacturing quality issue with price impact
    {
      medicineName: 'Insulin (Regular)',
      location: 'Mumbai',
      currentStock: 85,
      criticalThreshold: 20,
      currentPrice: 450,
      averageMarketPrice: 400,
      stockHistory: [90, 88, 87, 85],
      priceHistory: [400, 410, 430, 450],
      qualityMetrics: {
        dissolutionRate: 62, // Below standard
        contentUniformity: 85, // Below standard
        batchAffected: 'INS202507',
        manufacturingDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      timestamp: new Date().toISOString()
    },

    // Chennai - Regional shortage pattern
    {
      medicineName: 'Amlodipine 5mg',
      location: 'Chennai',
      currentStock: 15,
      criticalThreshold: 25,
      currentPrice: 95,
      averageMarketPrice: 90,
      regionalData: [
        { location: 'Chennai-Central', currentStock: 15, criticalThreshold: 25 },
        { location: 'Chennai-North', currentStock: 8, criticalThreshold: 25 },
        { location: 'Chennai-South', currentStock: 12, criticalThreshold: 25 },
        { location: 'Chennai-East', currentStock: 20, criticalThreshold: 25 },
        { location: 'Chennai-West', currentStock: 5, criticalThreshold: 25 }
      ],
      stockHistory: [45, 35, 25, 20, 15],
      timestamp: new Date().toISOString()
    },

    // Kolkata - Health emergency demand spike
    {
      medicineName: 'Azithromycin 500mg',
      location: 'Kolkata',
      currentStock: 60,
      criticalThreshold: 100,
      currentPrice: 160,
      averageMarketPrice: 150,
      dailyDemand: [25, 30, 85, 110, 150, 180], // Sudden spike
      emergencyType: 'Seasonal Flu Outbreak',
      hospitalRequests: ['SSKM Hospital', 'Calcutta Medical College', 'RG Kar Medical College'],
      stockHistory: [200, 150, 120, 90, 60],
      timestamp: new Date().toISOString()
    },

    // Bangalore - Supply chain disruption with price manipulation
    {
      medicineName: 'Levothyroxine 50mcg',
      location: 'Bangalore',
      currentStock: 40,
      criticalThreshold: 30,
      currentPrice: 280,
      averageMarketPrice: 200,
      stockHistory: [85, 70, 55, 40],
      priceHistory: [200, 220, 250, 280],
      supplierCountry: 'International',
      importDelay: 20, // days
      customsClearance: 'Delayed',
      alternateSuppliers: 1,
      distributorChanges: ['MainDist', 'NewDist'],
      timestamp: new Date().toISOString()
    }
  ];
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the example
if (require.main === module) {
  const handleError = (error) => {
    logger.error(`Error: ${error.message}\n`);
    process.exit(1);
  };
  runExample().catch(handleError);
}

module.exports = { runExample, generateSampleData };
