/**
 * Data Processor
 * Handles data validation, preprocessing, and feature engineering
 */

class DataProcessor {
  constructor(logger) {
    this.logger = logger || console;
    this.requiredFields = [
      'medicineName',
      'location',
      'currentStock',
      'timestamp'
    ];
    
    this.optionalFields = [
      'currentPrice',
      'priceHistory',
      'stockHistory',
      'demandHistory',
      'supplier',
      'expiryDate',
      'batchNumber',
      'criticalThreshold',
      'reorderPoint',
      'averageMarketPrice',
      'dailyConsumption',
      'seasonalFactors'
    ];
  }

  validate(dataPoint) {
    const errors = [];
    const warnings = [];

    // Check required fields
    for (const field of this.requiredFields) {
      if (!Object.prototype.hasOwnProperty.call(dataPoint, field) || dataPoint[field] === null || dataPoint[field] === undefined) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Validate data types and ranges
    if (dataPoint.currentStock !== undefined) {
      if (typeof dataPoint.currentStock !== 'number' || dataPoint.currentStock < 0) {
        errors.push('currentStock must be a non-negative number');
      }
    }

    if (dataPoint.currentPrice !== undefined) {
      if (typeof dataPoint.currentPrice !== 'number' || dataPoint.currentPrice < 0) {
        errors.push('currentPrice must be a non-negative number');
      }
    }

    if (dataPoint.timestamp !== undefined) {
      const timestamp = new Date(dataPoint.timestamp);
      if (isNaN(timestamp.getTime())) {
        errors.push('timestamp must be a valid date');
      }
    }

    // Validate arrays
    if (dataPoint.priceHistory !== undefined) {
      if (!Array.isArray(dataPoint.priceHistory)) {
        errors.push('priceHistory must be an array');
      } else if (dataPoint.priceHistory.some(price => typeof price !== 'number' || price < 0)) {
        errors.push('priceHistory must contain only non-negative numbers');
      }
    }

    if (dataPoint.stockHistory !== undefined) {
      if (!Array.isArray(dataPoint.stockHistory)) {
        errors.push('stockHistory must be an array');
      } else if (dataPoint.stockHistory.some(stock => typeof stock !== 'number' || stock < 0)) {
        errors.push('stockHistory must contain only non-negative numbers');
      }
    }

    // Check for warnings
    if (!dataPoint.priceHistory || dataPoint.priceHistory.length < 7) {
      warnings.push('Limited price history may affect anomaly detection accuracy');
    }

    if (!dataPoint.stockHistory || dataPoint.stockHistory.length < 7) {
      warnings.push('Limited stock history may affect anomaly detection accuracy');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  async preprocess(dataPoints) {
    const processedData = [];

    for (const dataPoint of dataPoints) {
      try {
        const processed = await this.preprocessSingle(dataPoint);
        processedData.push(processed);
      } catch (error) {
        this.logger.error('Error preprocessing data point:', error);
        // Continue with other data points
      }
    }

    return processedData;
  }

  async preprocessSingle(dataPoint) {
    const processed = { ...dataPoint };

    // Normalize timestamp
    processed.timestamp = new Date(dataPoint.timestamp);

    // Calculate derived features
    processed.derivedFeatures = this.calculateDerivedFeatures(dataPoint);

    // Add temporal features
    processed.temporalFeatures = this.extractTemporalFeatures(processed.timestamp);

    // Normalize numerical features
    processed.normalizedFeatures = this.normalizeFeatures(dataPoint);

    // Add contextual information
    processed.contextualFeatures = await this.addContextualFeatures(dataPoint);

    return processed;
  }

  calculateDerivedFeatures(dataPoint) {
    const features = {};

    // Stock-related features
    if (dataPoint.currentStock !== undefined && dataPoint.criticalThreshold !== undefined) {
      features.stockRatio = dataPoint.currentStock / dataPoint.criticalThreshold;
      features.isLowStock = dataPoint.currentStock <= dataPoint.criticalThreshold;
    }

    if (dataPoint.currentStock !== undefined && dataPoint.reorderPoint !== undefined) {
      features.needsReorder = dataPoint.currentStock <= dataPoint.reorderPoint;
    }

    // Price-related features
    if (dataPoint.currentPrice !== undefined && dataPoint.averageMarketPrice !== undefined) {
      features.priceDeviation = (dataPoint.currentPrice - dataPoint.averageMarketPrice) / dataPoint.averageMarketPrice;
      features.isPriceAnomaly = Math.abs(features.priceDeviation) > 0.2;
    }

    // Historical trend features
    if (dataPoint.stockHistory && dataPoint.stockHistory.length >= 3) {
      features.stockTrend = this.calculateTrend(dataPoint.stockHistory.slice(-7));
      features.stockVolatility = this.calculateVolatility(dataPoint.stockHistory.slice(-7));
    }

    if (dataPoint.priceHistory && dataPoint.priceHistory.length >= 3) {
      features.priceTrend = this.calculateTrend(dataPoint.priceHistory.slice(-7));
      features.priceVolatility = this.calculateVolatility(dataPoint.priceHistory.slice(-7));
    }

    // Demand features
    if (dataPoint.demandHistory && dataPoint.demandHistory.length >= 3) {
      features.demandTrend = this.calculateTrend(dataPoint.demandHistory.slice(-7));
      features.demandVolatility = this.calculateVolatility(dataPoint.demandHistory.slice(-7));
    }

    // Supply chain features
    if (dataPoint.lastDeliveryDate) {
      const daysSinceDelivery = (new Date() - new Date(dataPoint.lastDeliveryDate)) / (1000 * 60 * 60 * 24);
      features.daysSinceLastDelivery = daysSinceDelivery;
      features.isDeliveryOverdue = daysSinceDelivery > (dataPoint.averageDeliveryInterval || 7) * 1.5;
    }

    // Expiry features
    if (dataPoint.expiryDate) {
      const daysToExpiry = (new Date(dataPoint.expiryDate) - new Date()) / (1000 * 60 * 60 * 24);
      features.daysToExpiry = daysToExpiry;
      features.isNearExpiry = daysToExpiry <= 30 && daysToExpiry > 0;
      features.isExpired = daysToExpiry <= 0;
    }

    return features;
  }

  extractTemporalFeatures(timestamp) {
    const date = new Date(timestamp);
    
    return {
      hour: date.getHours(),
      dayOfWeek: date.getDay(),
      dayOfMonth: date.getDate(),
      month: date.getMonth(),
      quarter: Math.floor(date.getMonth() / 3),
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      isBusinessHour: date.getHours() >= 9 && date.getHours() <= 17,
      weekOfYear: this.getWeekOfYear(date)
    };
  }

  normalizeFeatures(dataPoint) {
    const normalized = {};

    // Normalize stock levels (0-1 scale based on max capacity)
    if (dataPoint.currentStock !== undefined && dataPoint.maxCapacity !== undefined) {
      normalized.stockLevel = Math.min(dataPoint.currentStock / dataPoint.maxCapacity, 1);
    }

    // Normalize prices (relative to market average)
    if (dataPoint.currentPrice !== undefined && dataPoint.averageMarketPrice !== undefined) {
      normalized.relativePrice = dataPoint.currentPrice / dataPoint.averageMarketPrice;
    }

    // Normalize demand (relative to historical average)
    if (dataPoint.currentDemand !== undefined && dataPoint.averageDemand !== undefined) {
      normalized.relativeDemand = dataPoint.currentDemand / dataPoint.averageDemand;
    }

    return normalized;
  }

  async addContextualFeatures(dataPoint) {
    const contextual = {};

    // Location-based features
    contextual.locationRisk = this.getLocationRiskScore(dataPoint.location);
    contextual.regionType = this.getRegionType(dataPoint.location);

    // Medicine category features
    contextual.medicineCategory = this.getMedicineCategory(dataPoint.medicineName);
    contextual.isCriticalMedicine = this.isCriticalMedicine(dataPoint.medicineName);

    // Seasonal features
    const currentMonth = new Date().getMonth();
    contextual.seasonalDemandFactor = dataPoint.seasonalFactors?.[currentMonth] || 1;
    contextual.isHighDemandSeason = (dataPoint.seasonalFactors?.[currentMonth] || 1) > 1.2;

    // Market features
    contextual.marketVolatility = await this.getMarketVolatility(dataPoint.medicineName);
    contextual.competitorCount = await this.getCompetitorCount(dataPoint.location, dataPoint.medicineName);

    return contextual;
  }

  calculateTrend(values) {
    if (values.length < 2) return 0;

    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    const n = values.length;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumXX += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return isNaN(slope) ? 0 : slope;
  }

  calculateVolatility(values) {
    if (values.length < 2) return 0;

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);

    return mean > 0 ? standardDeviation / mean : 0; // Coefficient of variation
  }

  getWeekOfYear(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  getLocationRiskScore(location) {
    // Simplified location risk scoring
    const riskScores = {
      'delhi': 0.8,
      'mumbai': 0.7,
      'bangalore': 0.5,
      'chennai': 0.4,
      'kolkata': 0.6,
      'hyderabad': 0.5,
      'pune': 0.4,
      'ahmedabad': 0.6
    };

    return riskScores[location?.toLowerCase()] || 0.5;
  }

  getRegionType(location) {
    const metros = ['delhi', 'mumbai', 'bangalore', 'chennai', 'kolkata', 'hyderabad'];
    return metros.includes(location?.toLowerCase()) ? 'metro' : 'non-metro';
  }

  getMedicineCategory(medicineName) {
    const categories = {
      'insulin': 'diabetes',
      'metformin': 'diabetes',
      'levothyroxine': 'thyroid',
      'amlodipine': 'cardiovascular',
      'atorvastatin': 'cardiovascular',
      'paracetamol': 'analgesic',
      'amoxicillin': 'antibiotic'
    };

    const name = medicineName?.toLowerCase() || '';
    for (const [key, category] of Object.entries(categories)) {
      if (name.includes(key)) {
        return category;
      }
    }

    return 'other';
  }

  isCriticalMedicine(medicineName) {
    const criticalMedicines = ['insulin', 'levothyroxine', 'amlodipine', 'metformin'];
    const name = medicineName?.toLowerCase() || '';
    return criticalMedicines.some(med => name.includes(med));
  }

  async getMarketVolatility(_medicineName) {
    // Simulated market volatility calculation
    // In real implementation, this would query market data
    return Math.random() * 0.3; // 0-30% volatility
  }

  async getCompetitorCount(_location, _medicineName) {
    // Simulated competitor count
    // In real implementation, this would query pharmacy database
    return Math.floor(Math.random() * 20) + 5; // 5-25 competitors
  }
}

module.exports = DataProcessor;
