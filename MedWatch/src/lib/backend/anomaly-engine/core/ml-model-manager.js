/**
 * Machine Learning Model Manager
 * Handles loading, training, and inference of ML models for anomaly detection
 */

const EventEmitter = require('events');
// const fs = require('fs').promises; // Removed unused import
// const path = require('path'); // Removed unused import

class MLModelManager extends EventEmitter {
  constructor(logger) {
    super();
    this.logger = logger || console;
    this.models = new Map();
    this.modelStats = new Map();
    this.isInitialized = false;
  }

  async loadModels() {
    this.logger.info('Loading ML models...');
    
    try {
      // Load different types of models
      await this.loadTimeSeriesModel();
      await this.loadAnomalyDetectionModel();
      await this.loadPriceAnomalyModel();
      await this.loadDemandForecastModel();
      
      this.isInitialized = true;
      this.logger.info(`Loaded ${this.models.size} ML models`);
      
    } catch (error) {
      this.logger.error('Error loading ML models:', error);
      throw error;
    }
  }

  async loadTimeSeriesModel() {
    // Simulated time series anomaly detection model
    const model = {
      name: 'time-series-anomaly',
      type: 'time-series',
      version: '1.0.0',
      
      predict: async (dataPoints) => {
        return dataPoints.map(point => this.detectTimeSeriesAnomaly(point));
      },
      
      // Simulated model parameters
      parameters: {
        windowSize: 7,
        threshold: 2.5, // Standard deviations
        seasonalityPeriod: 30
      }
    };
    
    this.models.set('time-series-anomaly', model);
    this.initializeModelStats('time-series-anomaly');
  }

  async loadAnomalyDetectionModel() {
    // Simulated isolation forest-like model
    const model = {
      name: 'isolation-forest',
      type: 'anomaly-detection',
      version: '1.0.0',
      
      predict: async (dataPoints) => {
        return dataPoints.map(point => this.detectIsolationAnomaly(point));
      },
      
      parameters: {
        contamination: 0.1,
        nEstimators: 100,
        maxSamples: 256
      }
    };
    
    this.models.set('isolation-forest', model);
    this.initializeModelStats('isolation-forest');
  }

  async loadPriceAnomalyModel() {
    // Simulated price anomaly detection model
    const model = {
      name: 'price-anomaly',
      type: 'price-analysis',
      version: '1.0.0',
      
      predict: async (dataPoints) => {
        return dataPoints.map(point => this.detectPriceAnomaly(point));
      },
      
      parameters: {
        priceChangeThreshold: 0.3,
        volatilityThreshold: 0.2,
        marketComparisonWeight: 0.4
      }
    };
    
    this.models.set('price-anomaly', model);
    this.initializeModelStats('price-anomaly');
  }

  async loadDemandForecastModel() {
    // Simulated demand forecasting model
    const model = {
      name: 'demand-forecast',
      type: 'forecasting',
      version: '1.0.0',
      
      predict: async (dataPoints) => {
        return dataPoints.map(point => this.detectDemandAnomaly(point));
      },
      
      parameters: {
        forecastHorizon: 7,
        confidenceInterval: 0.95,
        seasonalFactors: true
      }
    };
    
    this.models.set('demand-forecast', model);
    this.initializeModelStats('demand-forecast');
  }

  async predict(dataPoints) {
    if (!this.isInitialized) {
      throw new Error('ML models not initialized');
    }

    const predictions = [];
    
    for (const dataPoint of dataPoints) {
      const pointPredictions = [];
      
      // Run prediction on all applicable models
      for (const [modelName, model] of this.models) {
        try {
          const startTime = Date.now();
          const prediction = await this.runModelPrediction(model, dataPoint);
          const executionTime = Date.now() - startTime;
          
          // Update model stats
          this.updateModelStats(modelName, executionTime, prediction.confidence);
          
          if (prediction.isAnomaly) {
            pointPredictions.push({
              ...prediction,
              modelName,
              executionTime
            });
          }
          
        } catch (error) {
          this.logger.error(`Error running model ${modelName}:`, error);
        }
      }
      
      // Combine predictions from multiple models
      const combinedPrediction = this.combinePredictions(pointPredictions, dataPoint);
      predictions.push(combinedPrediction);
    }
    
    return predictions;
  }

  async runModelPrediction(model, dataPoint) {
    // This would normally call the actual ML model
    // For simulation, we'll use the model's predict method
    const predictions = await model.predict([dataPoint]);
    return predictions[0];
  }

  // Helper to determine severity based on confidence
  getSeverityFromConfidence(confidence) {
    if (confidence >= 0.9) return 'critical';
    if (confidence >= 0.7) return 'high';
    if (confidence >= 0.5) return 'medium';
    return 'low';
  }

  detectTimeSeriesAnomaly(dataPoint) {
    // Simulated time series anomaly detection
    const { stockHistory, currentStock, medicineName, medicineID } = dataPoint;
    
    if (!stockHistory || stockHistory.length < 7) {
      return { isAnomaly: false, confidence: 0, reason: 'Insufficient data' };
    }
    
    // Calculate moving average and standard deviation
    const recentHistory = stockHistory.slice(-7);
    const mean = recentHistory.reduce((sum, val) => sum + val, 0) / recentHistory.length;
    const variance = recentHistory.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / recentHistory.length;
    const stdDev = Math.sqrt(variance);
    
    // Check if current stock is anomalous
    const zScore = stdDev > 0 ? Math.abs((currentStock - mean) / stdDev) : 0;
    const threshold = 2.5; // Standard deviations
    
    if (zScore > threshold) {
      const confidence = Math.min(zScore / threshold, 1.0);
      const severity = this.getSeverityFromConfidence(confidence);
      const message = `ML Anomaly: ${medicineName} stock is ${zScore.toFixed(2)} SD from normal.`;
      const description = `ML model detected an unusual deviation in the time series stock data for ${medicineName} (ID: ${medicineID}). The current stock of ${currentStock} is ${zScore.toFixed(2)} standard deviations away from the historical mean (${mean.toFixed(2)}). This suggests an abnormal stock movement.`;
      const causesOfShortages = ['unexpected demand surge', 'supply chain bottleneck', 'inventory miscount', 'logistics delay']; // Added more specific causes

      return {
        isAnomaly: true,
        confidence: confidence,
        severity: severity,
        message: message,
        type: 'Time Series Anomaly', // Changed type to be more descriptive
        details: {
          zScore: zScore,
          mean: mean,
          stdDev: stdDev,
          currentValue: currentStock,
          medicineName: medicineName,
          medicineID: medicineID
        },
        causesOfShortages: causesOfShortages,
        description: description
      };
    }
    
    return { isAnomaly: false, confidence: 0 };
  }

  detectIsolationAnomaly(dataPoint) {
    // Simulated isolation forest anomaly detection
    const features = this.extractFeatures(dataPoint);
    const { medicineName, medicineID } = dataPoint;
    
    // Simulate isolation score calculation
    const isolationScore = this.calculateIsolationScore(features);
    const threshold = 0.6; // Higher score means more anomalous
    
    if (isolationScore > threshold) {
      const confidence = isolationScore;
      const severity = this.getSeverityFromConfidence(confidence);
      const message = `ML Anomaly: ${medicineName} shows unusual behavior (Isolation Score: ${isolationScore.toFixed(3)}).`;
      const description = `ML model identified ${medicineName} (ID: ${medicineID}) as an outlier based on its overall feature set. The isolation score of ${isolationScore.toFixed(3)} suggests it deviates significantly from typical patterns, indicating a potential anomaly.`;
      const causesOfShortages = ['data quality issue', 'system error', 'unforeseen event', 'unusual transaction volume']; // Added more specific causes

      return {
        isAnomaly: true,
        confidence: confidence,
        severity: severity,
        message: message,
        type: 'Isolation Forest Anomaly', // Changed type to be more descriptive
        details: {
          isolationScore: isolationScore,
          features: features,
          medicineName: medicineName,
          medicineID: medicineID
        },
        causesOfShortages: causesOfShortages,
        description: description
      };
    }
    
    return { isAnomaly: false, confidence: isolationScore };
  }

  detectPriceAnomaly(dataPoint) {
    // Simulated price anomaly detection
    const { currentPrice, priceHistory, averageMarketPrice, medicineName, medicineID } = dataPoint;
    
    if (!priceHistory || priceHistory.length < 3) {
      return { isAnomaly: false, confidence: 0, reason: 'Insufficient price data' };
    }
    
    // Calculate price volatility
    const recentPrices = priceHistory.slice(-5);
    const priceChanges = recentPrices.slice(1).map((price, i) => 
      recentPrices[i] > 0 ? Math.abs(price - recentPrices[i]) / recentPrices[i] : 0
    );
    const avgVolatility = priceChanges.length > 0 ? priceChanges.reduce((sum, change) => sum + change, 0) / priceChanges.length : 0;
    
    // Check for price anomalies
    const marketDeviation = averageMarketPrice ? 
      Math.abs(currentPrice - averageMarketPrice) / averageMarketPrice : 0;
    
    const anomalyScore = Math.max(avgVolatility * 2, marketDeviation);
    const threshold = 0.3;
    
    if (anomalyScore > threshold) {
      const confidence = Math.min(anomalyScore, 1.0);
      const severity = this.getSeverityFromConfidence(confidence);
      const message = `ML Anomaly: ${medicineName} price anomaly detected (Score: ${anomalyScore.toFixed(3)}).`;
      const description = `ML model detected an unusual price pattern for ${medicineName} (ID: ${medicineID}). The anomaly score of ${anomalyScore.toFixed(3)} is driven by high volatility (${(avgVolatility * 100).toFixed(1)}%) or significant deviation from average market price (${(marketDeviation * 100).toFixed(1)}%).`;
      const causesOfShortages = ['price volatility', 'market deviation', 'raw material cost increase', 'import restrictions', 'competitor pricing strategy', 'economic instability']; // Added more specific causes

      return {
        isAnomaly: true,
        confidence: confidence,
        severity: severity,
        message: message,
        type: 'Price Anomaly', // Changed type to be more descriptive
        details: {
          currentPrice: currentPrice,
          avgVolatility: avgVolatility,
          marketDeviation: marketDeviation,
          anomalyScore: anomalyScore,
          averageMarketPrice: averageMarketPrice,
          medicineName: medicineName,
          medicineID: medicineID
        },
        causesOfShortages: causesOfShortages,
        description: description
      };
    }
    
    return { isAnomaly: false, confidence: anomalyScore };
  }

  detectDemandAnomaly(dataPoint) {
    // Simulated demand anomaly detection
    const { currentDemand, demandHistory, seasonalFactors, medicineName, medicineID } = dataPoint;
    
    if (!demandHistory || demandHistory.length < 7) {
      return { isAnomaly: false, confidence: 0, reason: 'Insufficient demand data' };
    }
    
    // Calculate expected demand based on historical patterns
    const recentDemand = demandHistory.slice(-7);
    const avgDemand = recentDemand.reduce((sum, val) => sum + val, 0) / recentDemand.length;
    
    // Apply seasonal adjustment if available
    const seasonalAdjustment = seasonalFactors ? seasonalFactors[new Date().getMonth()] || 1 : 1;
    const expectedDemand = avgDemand * seasonalAdjustment;
    
    // Calculate anomaly score
    const demandDeviation = expectedDemand > 0 ? Math.abs(currentDemand - expectedDemand) / expectedDemand : 0;
    const threshold = 0.4;
    
    if (demandDeviation > threshold) {
      const confidence = Math.min(demandDeviation, 1.0);
      const severity = this.getSeverityFromConfidence(confidence);
      const message = `ML Anomaly: ${medicineName} demand deviation ${(demandDeviation * 100).toFixed(1)}% from expected.`;
      const description = `ML model detected an unusual deviation in demand for ${medicineName} (ID: ${medicineID}). Current demand (${currentDemand}) is ${(demandDeviation * 100).toFixed(1)}% different from the expected demand (${expectedDemand.toFixed(2)}), considering seasonal factors. This indicates an unexpected surge or drop in demand.`;
      const causesOfShortages = ['unexpected demand fluctuation', 'seasonal peak', 'disease outbreak', 'manpower shortage (distribution)', 'public health campaign', 'competitor stockout']; // Added more specific causes including manpower

      return {
        isAnomaly: true,
        confidence: confidence,
        severity: severity,
        message: message,
        type: 'Demand Anomaly', // Changed type to be more descriptive
        details: {
          currentDemand: currentDemand,
          expectedDemand: expectedDemand,
          demandDeviation: demandDeviation,
          seasonalAdjustment: seasonalAdjustment,
          medicineName: medicineName,
          medicineID: medicineID
        },
        causesOfShortages: causesOfShortages,
        description: description
      };
    }
    
    return { isAnomaly: false, confidence: demandDeviation };
  }

  extractFeatures(dataPoint) {
    // Extract numerical features for ML models
    return {
      stockLevel: dataPoint.currentStock || 0,
      stockRatio: dataPoint.currentStock / (dataPoint.maxStock || 1),
      priceRatio: dataPoint.currentPrice / (dataPoint.averageMarketPrice || dataPoint.currentPrice || 1),
      demandRatio: dataPoint.currentDemand / (dataPoint.averageDemand || dataPoint.currentDemand || 1),
      daysSinceRestock: dataPoint.daysSinceRestock || 0,
      seasonalFactor: dataPoint.seasonalFactors?.[new Date().getMonth()] || 1,
      locationRisk: this.calculateLocationRisk(dataPoint.location),
      supplierReliability: dataPoint.supplierReliability || 0.5
    };
  }

  calculateIsolationScore(features) {
    // Simplified isolation score calculation
    const featureValues = Object.values(features);
    const normalizedValues = featureValues.map(val => Math.min(Math.max(val, 0), 1));
    
    // Simulate isolation forest scoring
    let score = 0;
    for (let i = 0; i < normalizedValues.length; i++) {
      const deviation = Math.abs(normalizedValues[i] - 0.5);
      score += deviation * (Math.random() * 0.5 + 0.5); // Add some randomness
    }
    
    return Math.min(score / normalizedValues.length, 1.0);
  }

  calculateLocationRisk(location) {
    // Simplified location risk calculation
    const riskFactors = {
      'delhi': 0.7,
      'mumbai': 0.6,
      'bangalore': 0.5,
      'chennai': 0.4,
      'kolkata': 0.6,
      'hyderabad': 0.5
    };
    
    const locationKey = location?.toLowerCase() || '';
    return riskFactors[locationKey] || 0.5;
  }

  combinePredictions(predictions, _dataPoint) {
    if (predictions.length === 0) {
      return { isAnomaly: false, confidence: 0, modelName: 'none' };
    }
    
    // Weighted combination of predictions
    const weights = {
      'time-series-anomaly': 0.3,
      'isolation-forest': 0.3,
      'price-anomaly': 0.2,
      'demand-forecast': 0.2
    };
    
    let weightedConfidence = 0;
    let totalWeight = 0;
    const anomalyTypes = [];
    
    for (const prediction of predictions) {
      const weight = weights[prediction.modelName] || 0.1;
      weightedConfidence += prediction.confidence * weight;
      totalWeight += weight;
      anomalyTypes.push(prediction.type); // Use prediction.type which is now more descriptive
    }
    
    const finalConfidence = totalWeight > 0 ? weightedConfidence / totalWeight : 0;
    
    // Determine overall severity for the combined prediction
    const overallSeverity = this.getSeverityFromConfidence(finalConfidence);
    const overallMessage = predictions.map(p => p.message).join(' | ');
    const overallDescription = predictions.map(p => p.description).join('\n\n');
    const overallCauses = [...new Set(predictions.flatMap(p => p.causesOfShortages))]; // Combine unique causes

    return {
      isAnomaly: finalConfidence > 0.5,
      confidence: finalConfidence,
      severity: overallSeverity, // Added overall severity
      message: overallMessage, // Combined message
      description: overallDescription, // Combined description
      causesOfShortages: overallCauses, // Combined causes
      type: anomalyTypes.join(', '), // Combined types will now use the more descriptive names
      modelName: 'ensemble',
      details: predictions.reduce((acc, pred) => ({ ...acc, [pred.modelName]: pred.details }), {}), // Group details by model
      individualPredictions: predictions
    };
  }

  initializeModelStats(modelName) {
    this.modelStats.set(modelName, {
      totalPredictions: 0,
      totalExecutionTime: 0,
      averageExecutionTime: 0,
      averageConfidence: 0,
      anomaliesDetected: 0,
      lastUsed: null
    });
  }

  updateModelStats(modelName, executionTime, confidence) {
    const stats = this.modelStats.get(modelName);
    if (!stats) return;
    
    stats.totalPredictions++;
    stats.totalExecutionTime += executionTime;
    stats.averageExecutionTime = stats.totalExecutionTime / stats.totalPredictions;
    stats.averageConfidence = 
      (stats.averageConfidence * (stats.totalPredictions - 1) + (confidence || 0)) / stats.totalPredictions;
    stats.lastUsed = new Date();
    
    if (confidence > 0.5) {
      stats.anomaliesDetected++;
    }
  }

  getModelStats() {
    const stats = {};
    for (const [modelName, modelStats] of this.modelStats) {
      const model = this.models.get(modelName);
      stats[modelName] = {
        ...modelStats,
        type: model?.type,
        version: model?.version,
        detectionRate: modelStats.totalPredictions > 0 ? 
          (modelStats.anomaliesDetected / modelStats.totalPredictions) * 100 : 0
      };
    }
    return stats;
  }

  async retrainModel(modelName, trainingData) {
    // Placeholder for model retraining
    this.logger.info(`Retraining model ${modelName} with ${trainingData.length} samples`);
    
    // In a real implementation, this would:
    // 1. Validate training data
    // 2. Retrain the model
    // 3. Evaluate performance
    // 4. Update model if performance improves
    
    return {
      success: true,
      modelName,
      trainingDataSize: trainingData.length,
      newVersion: '1.0.1',
      performanceMetrics: {
        accuracy: 0.85,
        precision: 0.82,
        recall: 0.88,
        f1Score: 0.85
      }
    };
  }
}

module.exports = MLModelManager;
