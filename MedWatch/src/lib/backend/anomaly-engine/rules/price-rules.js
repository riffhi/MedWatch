/**
 * Price Anomaly Detection Rules
 * Rules for detecting unusual pricing patterns and market manipulation
 */

// Export the array of rules under a 'default' property for compatibility with RuleEngine.cjs
module.exports = {
  default: [
    {
      id: 'sudden-price-spike',
      name: 'Sudden Price Spike',
      category: 'price',
      severity: 'high',
      description: 'Detects sudden significant price increases',
      condition: (context) => {
        const { data, helpers } = context;
        if (!data.priceHistory || data.priceHistory.length < 2) return false;
        
        const currentPrice = data.currentPrice;
        const previousPrice = data.priceHistory[data.priceHistory.length - 2];
        const priceIncrease = helpers.percentageChange(currentPrice, previousPrice);
        
        return priceIncrease > 50; // 50% price increase
      },
      action: (dataPoint, context) => ({
        type: 'price',
        severity: 'high',
        message: `PRICE SPIKE: ${dataPoint.medicineName} price increased by ${context.helpers.percentageChange(dataPoint.currentPrice, dataPoint.priceHistory[dataPoint.priceHistory.length - 2]).toFixed(1)}%`,
        details: {
          currentPrice: dataPoint.currentPrice,
          previousPrice: dataPoint.priceHistory[dataPoint.priceHistory.length - 2],
          priceIncrease: context.helpers.percentageChange(
            dataPoint.currentPrice, 
            dataPoint.priceHistory[dataPoint.priceHistory.length - 2]
          ),
          location: dataPoint.location,
          medicineName: dataPoint.medicineName, // Added for clarity in details
          medicineID: dataPoint.medicineID // Added for clarity in details
        },
        causesOfShortages: ['sudden price increase', 'market speculation'],
        description: `High priority: The price of ${dataPoint.medicineName} (ID: ${dataPoint.medicineID}) at ${dataPoint.location} has suddenly spiked by ${context.helpers.percentageChange(dataPoint.currentPrice, dataPoint.priceHistory[dataPoint.priceHistory.length - 2]).toFixed(1)}%. This significant increase may indicate market instability or speculative trading.`
      })
    },

    {
      id: 'price-manipulation-pattern',
      name: 'Price Manipulation Pattern',
      category: 'price',
      severity: 'critical',
      description: 'Detects potential price manipulation through coordinated pricing',
      condition: (context) => {
        const { data } = context;
        if (!data.regionalPrices || data.regionalPrices.length < 3) return false;
        
        // Check if multiple pharmacies in the same area have identical unusual prices
        const priceGroups = data.regionalPrices.reduce((groups, pharmacy) => {
          const price = pharmacy.price;
          groups[price] = (groups[price] || 0) + 1;
          return groups;
        }, {});
        
        const maxCount = Math.max(...Object.values(priceGroups));
        const averageMarketPrice = data.averageMarketPrice || 0;
        const suspiciousPrice = Object.keys(priceGroups).find(price => 
          priceGroups[price] === maxCount && parseFloat(price) > averageMarketPrice * 1.3
        );
        
        return maxCount >= 3 && suspiciousPrice;
      },
      action: (dataPoint, _context) => {
        const suspiciousPriceVal = parseFloat(Object.keys(dataPoint.regionalPrices.reduce((groups, p) => {
          groups[p.price] = (groups[p.price] || 0) + 1;
          return groups;
        }, {})).find(price => 
          dataPoint.regionalPrices.filter(p => p.price === parseFloat(price)).length >= 3
        ));
        const pharmaciesAffected = dataPoint.regionalPrices.filter(p => p.price === suspiciousPriceVal);

        return {
          type: 'price',
          severity: 'critical',
          message: `CRITICAL: Price manipulation suspected for ${dataPoint.medicineName} in ${dataPoint.region}`,
          details: {
            suspiciousPrice: suspiciousPriceVal,
            pharmaciesWithSamePrice: pharmaciesAffected.length,
            affectedPharmacies: pharmaciesAffected.map(p => p.name), // List affected pharmacies
            averageMarketPrice: dataPoint.averageMarketPrice,
            region: dataPoint.region,
            medicineName: dataPoint.medicineName, // Added for clarity in details
            medicineID: dataPoint.medicineID // Added for clarity in details
          },
          causesOfShortages: ['price collusion', 'market manipulation'],
          description: `Critical: A potential price manipulation pattern has been detected for ${dataPoint.medicineName} (ID: ${dataPoint.medicineID}) in the ${dataPoint.region} region. Multiple pharmacies are exhibiting identical, unusually high prices (${suspiciousPriceVal}), suggesting coordinated pricing behavior.`
        };
      }
    },

    {
      id: 'cross-regional-price-disparity',
      name: 'Cross-Regional Price Disparity',
      category: 'price',
      severity: 'medium',
      description: 'Detects significant price differences across regions',
      condition: (context) => {
        const { data } = context;
        if (!data.crossRegionalPrices || Object.keys(data.crossRegionalPrices).length < 2) return false;
        
        const prices = Object.values(data.crossRegionalPrices);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        
        return (maxPrice - minPrice) / minPrice > 0.4; // 40% price difference
      },
      action: (dataPoint, _context) => {
        const prices = Object.values(dataPoint.crossRegionalPrices);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const disparityPercentage = Math.round(((maxPrice - minPrice) / minPrice) * 100);

        return {
          type: 'price',
          severity: 'medium',
          message: `PRICE DISPARITY: ${dataPoint.medicineName} shows ${disparityPercentage}% price difference across regions`,
          details: {
            priceRange: {
              min: minPrice,
              max: maxPrice
            },
            regionalPrices: dataPoint.crossRegionalPrices,
            disparityPercentage: disparityPercentage,
            medicineName: dataPoint.medicineName, // Added for clarity in details
            medicineID: dataPoint.medicineID // Added for clarity in details
          },
          causesOfShortages: ['regional supply imbalance', 'transportation costs'],
          description: `Medium priority: Significant price disparity detected for ${dataPoint.medicineName} (ID: ${dataPoint.medicineID}). Prices vary by ${disparityPercentage}% across regions, with a range from ${minPrice} to ${maxPrice}. This may indicate localized supply issues or varying operational costs.`
        };
      }
    },

    {
      id: 'black-market-pricing',
      name: 'Black Market Pricing',
      category: 'price',
      severity: 'critical',
      description: 'Detects pricing that suggests black market activity',
      condition: (context) => {
        const { data } = context;
        const mrp = data.maximumRetailPrice || 0;
        const currentPrice = data.currentPrice || 0;
        
        // Price significantly above MRP suggests black market
        return currentPrice > mrp * 2 && data.currentStock === 0;
      },
      action: (dataPoint, _context) => ({
        type: 'price',
        severity: 'critical',
        message: `CRITICAL: Black market pricing suspected for ${dataPoint.medicineName}`,
        details: {
          currentPrice: dataPoint.currentPrice,
          maximumRetailPrice: dataPoint.maximumRetailPrice,
          priceMultiple: Math.round(dataPoint.currentPrice / dataPoint.maximumRetailPrice * 100) / 100,
          stockStatus: dataPoint.currentStock,
          location: dataPoint.location,
          medicineName: dataPoint.medicineName, // Added for clarity in details
          medicineID: dataPoint.medicineID // Added for clarity in details
        },
        causesOfShortages: ['illegal trade', 'extreme scarcity'],
        description: `Critical: Black market pricing is suspected for ${dataPoint.medicineName} (ID: ${dataPoint.medicineID}) at ${dataPoint.location}. The current price (${dataPoint.currentPrice}) is more than double the MRP (${dataPoint.maximumRetailPrice}), and there is zero stock. This strongly suggests illicit activity due to extreme scarcity.`
      })
    },

    {
      id: 'price-volatility-alert',
      name: 'Price Volatility Alert',
      category: 'price',
      severity: 'medium',
      description: 'Detects high price volatility over time',
      condition: (context) => {
        const { data } = context;
        if (!data.priceHistory || data.priceHistory.length < 7) return false;
        
        // Calculate price volatility (standard deviation)
        const prices = data.priceHistory.slice(-7);
        const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
        const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
        const standardDeviation = Math.sqrt(variance);
        const coefficientOfVariation = mean > 0 ? standardDeviation / mean : 0;
        
        return coefficientOfVariation > 0.2; // 20% coefficient of variation
      },
      action: (dataPoint, _context) => {
        const prices = dataPoint.priceHistory.slice(-7);
        const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
        const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
        const standardDeviation = Math.sqrt(variance);
        const coefficientOfVariation = mean > 0 ? standardDeviation / mean : 0;

        return {
          type: 'price',
          severity: 'medium',
          message: `VOLATILITY ALERT: High price volatility for ${dataPoint.medicineName}`,
          details: {
            averagePrice: Math.round(mean * 100) / 100,
            standardDeviation: Math.round(standardDeviation * 100) / 100,
            coefficientOfVariation: Math.round(coefficientOfVariation * 10000) / 100,
            priceRange: {
              min: Math.min(...prices),
              max: Math.max(...prices)
            },
            medicineName: dataPoint.medicineName, // Added for clarity in details
            medicineID: dataPoint.medicineID // Added for clarity in details
          },
          causesOfShortages: ['market instability', 'supply-demand fluctuations'],
          description: `Medium priority: The price of ${dataPoint.medicineName} (ID: ${dataPoint.medicineID}) is experiencing high volatility (Coefficient of Variation: ${Math.round(coefficientOfVariation * 10000) / 100}%). This indicates significant price swings and potential market instability.`
        };
      }
    },

    {
      id: 'below-cost-pricing',
      name: 'Below Cost Pricing',
      category: 'price',
      severity: 'medium',
      description: 'Detects pricing below manufacturing cost (potential dumping)',
      condition: (context) => {
        const { data } = context;
        const manufacturingCost = data.manufacturingCost || 0;
        const currentPrice = data.currentPrice || 0;
        
        return manufacturingCost > 0 && currentPrice < manufacturingCost * 0.8; // 20% below cost
      },
      action: (dataPoint, _context) => ({
        type: 'price',
        severity: 'medium',
        message: `BELOW COST: ${dataPoint.medicineName} priced below manufacturing cost`,
        details: {
          currentPrice: dataPoint.currentPrice,
          manufacturingCost: dataPoint.manufacturingCost,
          lossPerUnit: dataPoint.manufacturingCost - dataPoint.currentPrice,
          possibleCause: 'Dumping or clearance sale',
          location: dataPoint.location,
          medicineName: dataPoint.medicineName, // Added for clarity in details
          medicineID: dataPoint.medicineID // Added for clarity in details
        },
        causesOfShortages: ['overstock', 'clearance sale'],
        description: `Medium priority: ${dataPoint.medicineName} (ID: ${dataPoint.medicineID}) at ${dataPoint.location} is priced significantly below its estimated manufacturing cost (${dataPoint.currentPrice} vs ${dataPoint.manufacturingCost}). This could indicate overstocking or a clearance sale.`
      })
    }
  ]
};
