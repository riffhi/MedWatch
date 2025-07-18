const EventEmitter = require('events');
const RuleEngine = require('./rule-engine');
const MLModelManager = require('./ml-model-manager');
const DataProcessor = require('./data-processor');
const AlertManager = require('./alert-manager');
const DatabaseService = require('./database');

class AnomalyDetector extends EventEmitter {
  constructor(config = {}, logger) {
    super();
    
    this.config = {
      enableRuleEngine: true,
      enableMLModels: true,
      processingInterval: 30000,
      alertThreshold: 0.7,
      ...config
    };

    this.logger = logger;
    // Pass the dbConfig part of the config to the DatabaseService
    this.database = new DatabaseService(this.logger, config.dbConfig);
    
    this.ruleEngine = new RuleEngine(this.logger);
    this.mlModelManager = new MLModelManager(this.logger);
    this.dataProcessor = new DataProcessor(this.logger);
    this.alertManager = new AlertManager(this.logger);
    
    this.isRunning = false;
    
    this.initializeEngine();
  }

  async initializeEngine() {
    this.logger.info('Initializing Anomaly Detection Engine...');
    try {
      await this.ruleEngine.loadRules();
      if (this.config.enableMLModels) {
        await this.mlModelManager.loadModels();
      }
      this.logger.info('Anomaly Detection Engine initialized successfully');
      this.emit('initialized');
    } catch (error) {
      this.logger.error('Failed to initialize Anomaly Detection Engine:', error);
      this.emit('error', error);
    }
  }

  async start() {
    if (this.isRunning) {
      this.logger.info('Anomaly Detection Engine is already running');
      return;
    }
    this.isRunning = true;
    this.logger.info('Starting Anomaly Detection Engine...');
    this.processingInterval = setInterval(() => this.processBatch(), this.config.processingInterval);
    this.emit('started');
  }

  async stop() {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
    this.logger.info('Anomaly Detection Engine stopped');
    this.emit('stopped');
  }

  async processBatch() {
    this.logger.info('Starting new processing batch...');
    const dataPoints = await this.database.getMedicineDataForProcessing();

    if (!dataPoints || dataPoints.length === 0) {
      this.logger.info('No new data to process in this batch.');
      return;
    }

    this.logger.info(`Processing batch of ${dataPoints.length} data points from database.`);
    
    try {
      const processedData = await this.dataProcessor.preprocess(dataPoints);

      if (this.config.enableRuleEngine) {
        await this.runRuleBasedDetection(processedData);
      }
      if (this.config.enableMLModels) {
        await this.runMLBasedDetection(processedData);
      }

      this.emit('batch-processed', { batchSize: dataPoints.length });
    } catch (error) {
      this.logger.error('Error processing batch:', error);
    }
  }

  async runRuleBasedDetection(data) {
    for (const dataPoint of data) {
      const anomalies = await this.ruleEngine.evaluate(dataPoint);
      for (const anomaly of anomalies) {
        this.handleAnomalyDetected('rule-based', { ...anomaly, dataPoint, confidence: anomaly.severity === 'critical' ? 1.0 : 0.8 });
      }
    }
  }

  async runMLBasedDetection(data) {
    const predictions = await this.mlModelManager.predict(data);
    for (let i = 0; i < predictions.length; i++) {
      if (predictions[i].isAnomaly) {
        this.handleAnomalyDetected('ml-based', { ...predictions[i], dataPoint: data[i] });
      }
    }
  }

  handleAnomalyDetected(detectionType, anomaly) {
    const anomalyId = `anom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const enrichedAnomaly = {
      id: anomalyId,
      detectionType,
      ...anomaly,
      status: 'active',
      timestamp: new Date().toISOString(),
    };
    
    this.database.saveAnomaly(enrichedAnomaly);
    this.emit('anomaly-detected', enrichedAnomaly);

    if (anomaly.confidence >= this.config.alertThreshold) {
      this.alertManager.sendAlert(enrichedAnomaly);
    }
  }
}

module.exports = AnomalyDetector;
