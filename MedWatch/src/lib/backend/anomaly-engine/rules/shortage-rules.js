/**
 * Medicine Shortage Detection Rules
 * Predefined rules for detecting various types of shortage anomalies
 */

// Export the array of rules under a 'default' property for compatibility with RuleEngine.cjs
module.exports = {
  default: [
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
        message: `CRITICAL: ${dataPoint.medicineName} stock at ${dataPoint.location} is ${dataPoint.currentStock} (Threshold: ${dataPoint.criticalThreshold})`,
        details: {
          currentStock: dataPoint.currentStock,
          criticalThreshold: dataPoint.criticalThreshold,
          location: dataPoint.location,
          estimatedDaysRemaining: Math.floor(dataPoint.currentStock / (dataPoint.dailyConsumption || 1)),
          medicineName: dataPoint.medicineName, // Added for clarity in details
          medicineID: dataPoint.medicineID // Added for clarity in details
        },
        causesOfShortages: ['critically low stock'], // Refined to be more direct
        description: `Immediate action required: Stock for ${dataPoint.medicineName} (ID: ${dataPoint.medicineID}) at ${dataPoint.location} has dropped to a critical level of ${dataPoint.currentStock} units, which is below the threshold of ${dataPoint.criticalThreshold}. Estimated days remaining: ${Math.floor(dataPoint.currentStock / (dataPoint.dailyConsumption || 1))}.`
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
        message: `STOCKOUT: ${dataPoint.medicineName} is completely out of stock at ${dataPoint.location}`,
        details: {
          location: dataPoint.location,
          lastStockDate: dataPoint.lastStockDate || 'N/A',
          expectedRestockDate: dataPoint.expectedRestockDate || 'N/A',
          medicineName: dataPoint.medicineName, // Added for clarity in details
          medicineID: dataPoint.medicineID // Added for clarity in details
        },
        causesOfShortages: ['zero stock'], // Refined to be more direct
        description: `Urgent: ${dataPoint.medicineName} (ID: ${dataPoint.medicineID}) at ${dataPoint.location} has reached zero stock. Last known stock date: ${dataPoint.lastStockDate || 'N/A'}. Expected restock: ${dataPoint.expectedRestockDate || 'N/A'}. This requires immediate attention to prevent patient impact.`
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
        message: `RAPID DECLINE: ${dataPoint.medicineName} stock is depleting quickly at ${dataPoint.location}`,
        details: {
          currentDeclineRate: dataPoint.stockHistory ? 
            (dataPoint.stockHistory[0] - dataPoint.stockHistory[2]) / 2 : 0,
          normalConsumptionRate: dataPoint.averageDailyConsumption,
          projectedStockoutDate: dataPoint.projectedStockoutDate || 'N/A',
          medicineName: dataPoint.medicineName, // Added for clarity in details
          medicineID: dataPoint.medicineID // Added for clarity in details
        },
        causesOfShortages: ['rapid consumption increase'], // Refined to be more direct
        description: `High priority: Stock for ${dataPoint.medicineName} (ID: ${dataPoint.medicineID}) at ${dataPoint.location} is declining rapidly. Current decline rate is ${dataPoint.stockHistory ? (dataPoint.stockHistory[0] - dataPoint.stockHistory[2]) / 2 : 'N/A'} units/day, which is significantly higher than the normal rate of ${dataPoint.averageDailyConsumption} units/day. Projected stockout by: ${dataPoint.projectedStockoutDate || 'N/A'}.`
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
      action: (dataPoint, _context) => {
        const affectedLocationsList = dataPoint.regionalData.filter(l => l.currentStock <= l.criticalThreshold).map(l => `${l.location} (Stock: ${l.currentStock})`).join(', ');
        return {
          type: 'shortage',
          severity: 'high',
          message: `REGIONAL SHORTAGE: ${dataPoint.medicineName} showing shortages in ${dataPoint.region} region`,
          details: {
            region: dataPoint.region,
            affectedLocationsCount: dataPoint.regionalData.filter(l => 
              l.currentStock <= l.criticalThreshold
            ).length,
            totalLocations: dataPoint.regionalData.length,
            shortagePercentage: Math.round(
              (dataPoint.regionalData.filter(l => l.currentStock <= l.criticalThreshold).length / 
               dataPoint.regionalData.length) * 100
            ),
            affectedLocations: dataPoint.regionalData.filter(l => l.currentStock <= l.criticalThreshold).map(l => ({ name: l.location, stock: l.currentStock, threshold: l.criticalThreshold })), // More structured affected locations
            medicineName: dataPoint.medicineName, // Added for clarity in details
            medicineID: dataPoint.medicineID // Added for clarity in details
          },
          causesOfShortages: ['widespread regional shortage'], // Refined
          description: `High priority: ${dataPoint.medicineName} (ID: ${dataPoint.medicineID}) is experiencing a widespread shortage pattern in the ${dataPoint.region} region. Approximately ${Math.round((dataPoint.regionalData.filter(l => l.currentStock <= l.criticalThreshold).length / dataPoint.regionalData.length) * 100)}% of locations are affected, including: ${affectedLocationsList}.`
        };
      }
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
        message: `SUPPLY DISRUPTION: Delivery of ${dataPoint.medicineName} from ${dataPoint.supplier} is delayed`,
        details: {
          daysSinceLastDelivery: context.helpers.daysBetween(new Date(), dataPoint.lastDeliveryDate || new Date()),
          averageDeliveryInterval: dataPoint.averageDeliveryInterval,
          supplier: dataPoint.supplier,
          expectedDeliveryDate: dataPoint.expectedDeliveryDate || 'N/A',
          currentStock: dataPoint.currentStock,
          reorderPoint: dataPoint.reorderPoint,
          medicineName: dataPoint.medicineName, // Added for clarity in details
          medicineID: dataPoint.medicineID // Added for clarity in details
        },
        causesOfShortages: ['supplier delivery delay'], // Refined
        description: `High priority: A potential supply chain disruption is detected for ${dataPoint.medicineName} (ID: ${dataPoint.medicineID}) from supplier ${dataPoint.supplier}. It has been ${context.helpers.daysBetween(new Date(), dataPoint.lastDeliveryDate || new Date())} days since the last delivery, exceeding the average interval of ${dataPoint.averageDeliveryInterval} days. Current stock is ${dataPoint.currentStock} at reorder point ${dataPoint.reorderPoint}. Expected delivery: ${dataPoint.expectedDeliveryDate || 'N/A'}.`
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
        message: `DEMAND SPIKE: Unusual seasonal demand for ${dataPoint.medicineName}`,
        details: {
          currentDemand: dataPoint.currentDemand,
          historicalAverage: dataPoint.seasonalData?.[new Date().getMonth()]?.averageDemand || 'N/A',
          increasePercentage: Math.round(
            ((dataPoint.currentDemand - (dataPoint.seasonalData?.[new Date().getMonth()]?.averageDemand || 0)) / 
             (dataPoint.seasonalData?.[new Date().getMonth()]?.averageDemand || 1)) * 100
          ),
          currentMonth: new Date().toLocaleString('default', { month: 'long' }),
          medicineName: dataPoint.medicineName, // Added for clarity in details
          medicineID: dataPoint.medicineID // Added for clarity in details
        },
        causesOfShortages: ['seasonal demand increase'], // Refined
        description: `Medium priority: ${dataPoint.medicineName} (ID: ${dataPoint.medicineID}) is experiencing an unusual seasonal demand spike. Current demand is ${dataPoint.currentDemand} units, which is ${Math.round(((dataPoint.currentDemand - (dataPoint.seasonalData?.[new Date().getMonth()]?.averageDemand || 0)) / (dataPoint.seasonalData?.[new Date().getMonth()]?.averageDemand || 1)) * 100)}% higher than the historical average for ${new Date().toLocaleString('default', { month: 'long' })}.`
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
        message: `EXPIRY ALERT: ${dataPoint.medicineName} approaching expiry in ${context.helpers.daysBetween(new Date(), dataPoint.expiryDate)} days`,
        details: {
          expiryDate: dataPoint.expiryDate,
          daysToExpiry: context.helpers.daysBetween(new Date(), dataPoint.expiryDate),
          currentStock: dataPoint.currentStock,
          batchNumber: dataPoint.batchNumber || 'N/A',
          location: dataPoint.location,
          medicineName: dataPoint.medicineName, // Added for clarity in details
          medicineID: dataPoint.medicineID // Added for clarity in details
        },
        causesOfShortages: ['approaching expiry date'], // Refined
        description: `Medium priority: Stock of ${dataPoint.medicineName} (ID: ${dataPoint.medicineID}) at ${dataPoint.location} is nearing its expiry date (${dataPoint.expiryDate}). Only ${context.helpers.daysBetween(new Date(), dataPoint.expiryDate)} days remaining. Current stock: ${dataPoint.currentStock}. Needs to be managed promptly to avoid waste and potential shortage.`
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
        message: `UNUSUAL CONSUMPTION: ${dataPoint.medicineName} shows abnormal buying pattern`,
        details: {
          recentConsumption: context.helpers.calculateMovingAverage(dataPoint.dailyConsumptionHistory, 3),
          historicalAverage: context.helpers.calculateMovingAverage(dataPoint.dailyConsumptionHistory, 7),
          possibleCause: 'Bulk buying or hoarding suspected',
          medicineName: dataPoint.medicineName, // Added for clarity in details
          medicineID: dataPoint.medicineID // Added for clarity in details
        },
        causesOfShortages: ['hoarding', 'bulk buying'], // Kept as is, as it's a direct interpretation of the rule
        description: `Medium priority: Consumption of ${dataPoint.medicineName} (ID: ${dataPoint.medicineID}) shows an unusual spike. Recent 3-day average consumption is ${context.helpers.calculateMovingAverage(dataPoint.dailyConsumptionHistory, 3)}, which is more than double the 7-day historical average of ${context.helpers.calculateMovingAverage(dataPoint.dailyConsumptionHistory, 7)}. This pattern suggests potential bulk buying or hoarding.`
      })
    }
  ]
};
