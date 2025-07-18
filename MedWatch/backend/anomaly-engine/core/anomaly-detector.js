/**
 * Core Anomaly Detection Engine
 * Handles both rule-based and ML-based anomaly detection
 */

const EventEmitter = require('events');
const RuleEngine = require('./rule-engine');
const MLModelManager = require('./ml-model-manager');
const DataProcessor = require('./data-processor');
const AlertManager = require('./alert-manager');

class AnomalyDetector extends EventEmitter {
  constructor(config = {}, logger) {
    super();
    
    this.config = {
      enableRuleEngine: true,
      enableMLModels: true,
      batchSize: 1000,
      processingInterval: 30000, // 30 seconds
      alertThreshold: 0.7,
      ...config
    };

    this.logger = logger || console;

    this.ruleEngine = new RuleEngine(this.logger);
    this.mlModelManager = new MLModelManager(this.logger);
    this.dataProcessor = new DataProcessor(this.logger);
    this.alertManager = new AlertManager(this.logger);
    
    this.isRunning = false;
    this.processingQueue = [];
    this.anomalyHistory = new Map();
    
    this.initializeEngine();
  }

  async initializeEngine() {
    this.logger.info('Initializing Anomaly Detection Engine...');
    
    try {
      // Load predefined rules
      await this.ruleEngine.loadRules();
      
      // Initialize ML models
      if (this.config.enableMLModels) {
        await this.mlModelManager.loadModels();
      }
      
      // Setup event listeners
      this.setupEventListeners();
      
      this.logger.info('Anomaly Detection Engine initialized successfully');
      this.emit('initialized');
    } catch (error) {
      this.logger.error('Failed to initialize Anomaly Detection Engine:', error);
      this.emit('error', error);
    }
  }

  setupEventListeners() {
    this.ruleEngine.on('anomaly', (anomaly) => {
      this.handleAnomalyDetected('rule-based', anomaly);
    });

    this.mlModelManager.on('anomaly', (anomaly) => {
      this.handleAnomalyDetected('ml-based', anomaly);
    });

    this.alertManager.on('alert-sent', (alert) => {
      this.emit('alert-sent', alert);
    });
  }

  async start() {
    if (this.isRunning) {
      this.logger.info('Anomaly Detection Engine is already running');
      return;
    }

    this.isRunning = true;
    this.logger.info('Starting Anomaly Detection Engine...');
    
    // Start continuous processing
    this.processingInterval = setInterval(() => {
      this.processQueue();
    }, this.config.processingInterval);

    this.emit('started');
  }

  async stop() {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }

    this.logger.info('Anomaly Detection Engine stopped');
    this.emit('stopped');
  }

  /**
   * Add data for anomaly detection
   */
  addData(dataPoint) {
    if (!this.isRunning) {
      throw new Error('Anomaly Detection Engine is not running');
    }

    // Validate data structure
    const validatedData = this.dataProcessor.validate(dataPoint);
    if (!validatedData.isValid) {
      this.logger.warn('Invalid data point:', validatedData.errors);
      return false;
    }

    // Add to processing queue
    this.processingQueue.push({
      ...dataPoint,
      timestamp: new Date(),
      id: this.generateId()
    });

    // Process immediately if queue is full
    if (this.processingQueue.length >= this.config.batchSize) {
      this.processQueue();
    }

    return true;
  }

  /**
   * Process queued data for anomalies
   */
  async processQueue() {
    if (this.processingQueue.length === 0) {
      return;
    }

    const batch = this.processingQueue.splice(0, this.config.batchSize);
    this.logger.info(`Processing batch of ${batch.length} data points`);

    try {
      // Preprocess data
      const processedData = await this.dataProcessor.preprocess(batch);

      // Run rule-based detection
      if (this.config.enableRuleEngine) {
        await this.runRuleBasedDetection(processedData);
      }

      // Run ML-based detection
      if (this.config.enableMLModels) {
        await this.runMLBasedDetection(processedData);
      }

      this.emit('batch-processed', { 
        batchSize: batch.length, 
        timestamp: new Date() 
      });

    } catch (error) {
      this.logger.error('Error processing batch:', error);
      this.emit('processing-error', error);
    }
  }

  async runRuleBasedDetection(data) {
    for (const dataPoint of data) {
      try {
        const anomalies = await this.ruleEngine.evaluate(dataPoint);
        
        for (const anomaly of anomalies) {
          this.handleAnomalyDetected('rule-based', {
            ...anomaly,
            dataPoint,
            confidence: anomaly.severity === 'critical' ? 1.0 : 
                        anomaly.severity === 'high' ? 0.8 : 0.6
          });
        }
      } catch (error) {
        this.logger.error('Rule-based detection error:', error);
      }
    }
  }

  async runMLBasedDetection(data) {
    try {
      const predictions = await this.mlModelManager.predict(data);
      
      for (let i = 0; i < predictions.length; i++) {
        const prediction = predictions[i];
        const dataPoint = data[i];

        if (prediction.isAnomaly && prediction.confidence >= this.config.alertThreshold) {
          this.handleAnomalyDetected('ml-based', {
            type: prediction.anomalyType,
            confidence: prediction.confidence,
            features: prediction.features,
            dataPoint,
            modelUsed: prediction.modelName
          });
        }
      }
    } catch (error) {
      this.logger.error('ML-based detection error:', error);
    }
  }

  handleAnomalyDetected(detectionType, anomaly) {
    const anomalyId = this.generateId();
    const timestamp = new Date();

    const enrichedAnomaly = {
      id: anomalyId,
      detectionType,
      timestamp,
      ...anomaly,
      status: 'detected'
    };

    // Store in history
    this.anomalyHistory.set(anomalyId, enrichedAnomaly);

    // Emit anomaly event
    this.emit('anomaly-detected', enrichedAnomaly);

    // Send alert if confidence is high enough
    if (anomaly.confidence >= this.config.alertThreshold) {
      this.alertManager.sendAlert(enrichedAnomaly);
    }

    this.logger.info(`Anomaly detected [${detectionType}]:`, {
      id: anomalyId,
      type: anomaly.type,
      confidence: anomaly.confidence
    });
  }

  /**
   * Get anomaly statistics
   */
  getStatistics() {
    const anomalies = Array.from(this.anomalyHistory.values());
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    return {
      total: anomalies.length,
      last24Hours: anomalies.filter(a => a.timestamp >= last24Hours).length,
      byType: this.groupBy(anomalies, 'type'),
      byDetectionMethod: this.groupBy(anomalies, 'detectionType'),
      bySeverity: this.groupBy(anomalies, 'severity'),
      averageConfidence: this.calculateAverageConfidence(anomalies),
      queueSize: this.processingQueue.length
    };
  }

  /**
   * Get recent anomalies
   */
  getRecentAnomalies(limit = 50) {
    return Array.from(this.anomalyHistory.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Update anomaly status (for manual review)
   */
  updateAnomalyStatus(anomalyId, status, reviewedBy = null) {
    const anomaly = this.anomalyHistory.get(anomalyId);
    if (!anomaly) {
      throw new Error(`Anomaly ${anomalyId} not found`);
    }

    anomaly.status = status;
    anomaly.reviewedBy = reviewedBy;
    anomaly.reviewedAt = new Date();

    this.anomalyHistory.set(anomalyId, anomaly);
    this.emit('anomaly-updated', anomaly);

    return anomaly;
  }

  // Utility methods
  generateId() {
    return `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = item[key] || 'unknown';
      groups[group] = (groups[group] || 0) + 1;
      return groups;
    }, {});
  }

  calculateAverageConfidence(anomalies) {
    if (anomalies.length === 0) return 0;
    const sum = anomalies.reduce((acc, anomaly) => acc + (anomaly.confidence || 0), 0);
    return sum / anomalies.length;
  }
}

module.exports = AnomalyDetector;
