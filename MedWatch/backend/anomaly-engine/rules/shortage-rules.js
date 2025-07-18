/**
 * Medicine Shortage Detection Rules
 * Predefined rules for detecting various types of shortage anomalies
 */

module.exports = [
  {
    id: 'critical-stock-depletion',
    name: 'Critical Stock Depletion',
    category: 'shortage',
    severity: 'critical',
    description: 'Detects when medicine stock falls below critical threshold',
    condition: (context) => {
      const { data } = context;
      return data.currentStock <= data.criticalThreshold && data.currentStock > 0;
    },
    action: (dataPoint, _context) => ({
      type: 'shortage',
      severity: 'critical',
      message: `Critical stock level for ${dataPoint.medicineName}`,
      details: {
        currentStock: dataPoint.currentStock,
        criticalThreshold: dataPoint.criticalThreshold,
        location: dataPoint.location,
        estimatedDaysRemaining: Math.floor(dataPoint.currentStock / (dataPoint.dailyConsumption || 1))
      }
    })
  },

  {
    id: 'complete-stockout',
    name: 'Complete Stock Out',
    category: 'shortage',
    severity: 'critical',
    description: 'Detects when medicine is completely out of stock',
    condition: (context) => {
      const { data } = context;
      return data.currentStock === 0;
    },
    action: (dataPoint, _context) => ({
      type: 'shortage',
      severity: 'critical',
      message: `Complete stockout of ${dataPoint.medicineName}`,
      details: {
        location: dataPoint.location,
        lastStockDate: dataPoint.lastStockDate,
        expectedRestockDate: dataPoint.expectedRestockDate
      }
    })
  },

  {
    id: 'rapid-stock-decline',
    name: 'Rapid Stock Decline',
    category: 'shortage',
    severity: 'high',
    description: 'Detects unusually fast stock depletion rates',
    condition: (context) => {
      const { data } = context;
      if (!data.stockHistory || data.stockHistory.length < 3) return false;
      
      const recent = data.stockHistory.slice(-3);
      const declineRate = (recent[0] - recent[2]) / 2; // Average daily decline
      const normalRate = data.averageDailyConsumption || 10;
      
      return declineRate > normalRate * 2; // 200% faster than normal
    },
    action: (dataPoint, _context) => ({
      type: 'shortage',
      severity: 'high',
      message: `Rapid stock decline detected for ${dataPoint.medicineName}`,
      details: {
        currentDeclineRate: dataPoint.stockHistory ? 
          (dataPoint.stockHistory[0] - dataPoint.stockHistory[2]) / 2 : 0,
        normalConsumptionRate: dataPoint.averageDailyConsumption,
        projectedStockoutDate: dataPoint.projectedStockoutDate
      }
    })
  },

  {
    id: 'regional-shortage-pattern',
    name: 'Regional Shortage Pattern',
    category: 'shortage',
    severity: 'high',
    description: 'Detects shortage patterns across multiple locations in a region',
    condition: (context) => {
      const { data } = context;
      if (!data.regionalData) return false;
      
      const shortageCount = data.regionalData.filter(location => 
        location.currentStock <= location.criticalThreshold
      ).length;
      
      return shortageCount >= 3 && (shortageCount / data.regionalData.length) > 0.3;
    },
    action: (dataPoint, _context) => ({
      type: 'shortage',
      severity: 'high',
      message: `Regional shortage pattern detected for ${dataPoint.medicineName}`,
      details: {
        region: dataPoint.region,
        affectedLocations: dataPoint.regionalData.filter(l => 
          l.currentStock <= l.criticalThreshold
        ).length,
        totalLocations: dataPoint.regionalData.length,
        shortagePercentage: Math.round(
          (dataPoint.regionalData.filter(l => l.currentStock <= l.criticalThreshold).length / 
           dataPoint.regionalData.length) * 100
        )
      }
    })
  },

  {
    id: 'supply-chain-disruption',
    name: 'Supply Chain Disruption',
    category: 'supply-chain',
    severity: 'high',
    description: 'Detects potential supply chain disruptions',
    condition: (context) => {
      const { data, helpers } = context;
      const daysSinceLastDelivery = helpers.daysBetween(new Date(), data.lastDeliveryDate);
      const averageDeliveryInterval = data.averageDeliveryInterval || 7;
      
      return daysSinceLastDelivery > averageDeliveryInterval * 1.5 && 
             data.currentStock <= data.reorderPoint;
    },
    action: (dataPoint, context) => ({
      type: 'supply-chain',
      severity: 'high',
      message: `Supply chain disruption suspected for ${dataPoint.medicineName}`,
      details: {
        daysSinceLastDelivery: context.helpers.daysBetween(new Date(), dataPoint.lastDeliveryDate),
        averageDeliveryInterval: dataPoint.averageDeliveryInterval,
        supplier: dataPoint.supplier,
        expectedDeliveryDate: dataPoint.expectedDeliveryDate
      }
    })
  },

  {
    id: 'seasonal-demand-spike',
    name: 'Seasonal Demand Spike',
    category: 'demand',
    severity: 'medium',
    description: 'Detects unusual seasonal demand increases',
    condition: (context) => {
      const { data } = context;
      const currentMonth = new Date().getMonth();
      const historicalAverage = data.seasonalData?.[currentMonth]?.averageDemand || 0;
      const currentDemand = data.currentDemand || 0;
      
      return currentDemand > historicalAverage * 1.5 && historicalAverage > 0;
    },
    action: (dataPoint, _context) => ({
      type: 'demand',
      severity: 'medium',
      message: `Seasonal demand spike detected for ${dataPoint.medicineName}`,
      details: {
        currentDemand: dataPoint.currentDemand,
        historicalAverage: dataPoint.seasonalData?.[new Date().getMonth()]?.averageDemand,
        increasePercentage: Math.round(
          ((dataPoint.currentDemand - dataPoint.seasonalData?.[new Date().getMonth()]?.averageDemand) / 
           dataPoint.seasonalData?.[new Date().getMonth()]?.averageDemand) * 100
        )
      }
    })
  },

  {
    id: 'expiry-date-approaching',
    name: 'Expiry Date Approaching',
    category: 'quality',
    severity: 'medium',
    description: 'Detects medicines approaching expiry date',
    condition: (context) => {
      const { data, helpers } = context;
      if (!data.expiryDate) return false;
      
      const daysToExpiry = helpers.daysBetween(new Date(), data.expiryDate);
      return daysToExpiry <= 30 && daysToExpiry > 0 && data.currentStock > 0;
    },
    action: (dataPoint, context) => ({
      type: 'quality',
      severity: 'medium',
      message: `Medicine approaching expiry: ${dataPoint.medicineName}`,
      details: {
        expiryDate: dataPoint.expiryDate,
        daysToExpiry: context.helpers.daysBetween(new Date(), dataPoint.expiryDate),
        currentStock: dataPoint.currentStock,
        batchNumber: dataPoint.batchNumber
      }
    })
  },

  {
    id: 'unusual-consumption-pattern',
    name: 'Unusual Consumption Pattern',
    category: 'consumption',
    severity: 'medium',
    description: 'Detects unusual consumption patterns that might indicate hoarding or bulk buying',
    condition: (context) => {
      const { data, helpers } = context;
      if (!data.dailyConsumptionHistory || data.dailyConsumptionHistory.length < 7) return false;
      
      const recentAverage = helpers.calculateMovingAverage(data.dailyConsumptionHistory, 3);
      const historicalAverage = helpers.calculateMovingAverage(data.dailyConsumptionHistory, 7);
      
      return recentAverage && historicalAverage && recentAverage > historicalAverage * 2;
    },
    action: (dataPoint, context) => ({
      type: 'consumption',
      severity: 'medium',
      message: `Unusual consumption pattern for ${dataPoint.medicineName}`,
      details: {
        recentConsumption: context.helpers.calculateMovingAverage(dataPoint.dailyConsumptionHistory, 3),
        historicalAverage: context.helpers.calculateMovingAverage(dataPoint.dailyConsumptionHistory, 7),
        possibleCause: 'Bulk buying or hoarding suspected'
      }
    })
  }
];
