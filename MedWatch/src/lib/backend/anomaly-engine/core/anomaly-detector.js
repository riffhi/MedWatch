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
        // IMPORTANT: The 'anomaly' object returned by ruleEngine.evaluate(dataPoint)
        // MUST include 'severity', 'message', 'details', 'type', 'confidence', 'causesOfShortages',
        // AND 'description' to be captured correctly.
        // For example, ruleEngine should return:
        // {
        //   severity: 'high',
        //   message: 'Rapid stock decline detected',
        //   type: 'stock-alert',
        //   details: { /* rule-specific details */ },
        //   confidence: 0.9,
        //   causesOfShortages: ['supplier delay', 'increased demand'],
        //   description: 'Stock levels fell below critical threshold due to unexpected demand surge.'
        // }
        this.handleAnomalyDetected('rule-based', { ...anomaly, dataPoint, confidence: anomaly.severity === 'critical' ? 1.0 : 0.8 });
      }
    }
  }

  async runMLBasedDetection(data) {
    // FIX: Assign the result of predict to 'predictions' variable
    const predictions = await this.mlModelManager.predict(data);
    for (let i = 0; i < predictions.length; i++) {
      if (predictions[i].isAnomaly) {
        // IMPORTANT: The 'predictions[i]' object returned by mlModelManager.predict(data)
        // MUST include 'severity', 'message', 'details', 'type', 'confidence', 'causesOfShortages',
        // AND 'description' for accurate anomaly reporting.
        // For example, mlModelManager should return:
        // {
        //   isAnomaly: true,
        //   severity: 'medium',
        //   message: 'Unusual price fluctuation',
        //   type: 'price-anomaly',
        //   details: { /* ML model specific details */ },
        //   confidence: 0.75,
        //   causesOfShortages: ['market volatility'],
        //   description: 'ML model detected abnormal price movement outside typical bounds based on historical data.'
        // }
        this.handleAnomalyDetected('ml-based', { ...predictions[i], dataPoint: data[i] });
      }
    }
  }

  handleAnomalyDetected(detectionType, anomaly) {
    // Destructure specifically the attributes that are part of the Appwrite schema
    const {
      severity,
      message,
      confidence,
      type,
      details, // This 'details' might be an object or string
      causesOfShortages,
      description // Destructure 'description' from the incoming anomaly object
    } = anomaly;

    let finalDetailsObject = {};

    // If 'details' from the incoming anomaly is an object, use it
    if (typeof details === 'object' && details !== null) {
      finalDetailsObject = { ...details };
    } else if (typeof details === 'string' && details.trim().startsWith('{') && details.trim().endsWith('}')) {
      // If 'details' is a string that looks like a JSON object, try parsing it
      try {
        finalDetailsObject = JSON.parse(details);
      } catch (e) {
        // If parsing fails, store the original string under a specific key
        finalDetailsObject.originalDetails = details;
      }
    } else if (details) {
        // If details is a non-object, non-JSON string, store it as originalDetails
        finalDetailsObject.originalDetails = details;
    }

    // Add causesOfShortages to the details object
    if (causesOfShortages) {
        finalDetailsObject.causesOfShortages = causesOfShortages;
    } else {
        finalDetailsObject.causesOfShortages = 'Not specified';
    }


    const enrichedAnomaly = {
      detectionType,
      // Use the destructured properties, providing defaults if necessary
      severity: severity || 'medium',
      message: message || `Anomaly detected for medicine ID: ${anomaly.dataPoint ? anomaly.dataPoint.medicineID : 'N/A'}`,
      confidence: confidence,
      type: type || detectionType,
      // Always stringify the final details object
      details: JSON.stringify(finalDetailsObject),
      
      // These attributes are consistently generated or defaulted within handleAnomalyDetected
      medicineDataId: anomaly.dataPoint ? anomaly.dataPoint.medicineID : null,
      assignedTo: anomaly.assignedTo || '',
      status: 'active',
      timestamp: new Date().toISOString(),
      reviewedAt: null,
      // Add 'description' attribute, using anomaly.description or a default.
      // The default will only be used if the 'description' property is not provided
      // by the rule engine or ML model.
      description: description || `General anomaly for medicine ID: ${anomaly.dataPoint ? anomaly.dataPoint.medicineID : 'N/A'}.`,
    };

    this.database.saveAnomaly(enrichedAnomaly);
    this.emit('anomaly-detected', enrichedAnomaly);

    if (enrichedAnomaly.confidence >= this.config.alertThreshold) {
      this.alertManager.sendAlert(enrichedAnomaly);
    }
  }
}

module.exports = AnomalyDetector;
