/**
 * Rule-Based Anomaly Detection Engine
 * Implements predefined business rules for detecting medicine shortage anomalies
 */

const EventEmitter = require('events');
const fs = require('fs').promises;
const path = require('path');

class RuleEngine extends EventEmitter {
  constructor(logger) {
    super();
    this.logger = logger || console;
    this.rules = new Map();
    this.ruleStats = new Map();
  }

  async loadRules() {
    try {
      const rulesPath = path.join(__dirname, '../rules');
      const ruleFiles = await fs.readdir(rulesPath);
      
      for (const file of ruleFiles) {
        if (file.endsWith('.js')) {
          const rulePath = path.join(rulesPath, file);
          const ruleModule = require(rulePath);
          
          if (Array.isArray(ruleModule)) {
            ruleModule.forEach(rule => this.addRule(rule));
          } else {
            this.addRule(ruleModule);
          }
        }
      }
      
      this.logger.info(`Loaded ${this.rules.size} rules`);
    } catch (error) {
      this.logger.error('Error loading rules:', error);
      throw error;
    }
  }

  addRule(rule) {
    if (!rule.id || !rule.name || !rule.condition || !rule.action) {
      throw new Error('Invalid rule structure');
    }

    this.rules.set(rule.id, {
      ...rule,
      createdAt: new Date(),
      executionCount: 0
    });

    this.ruleStats.set(rule.id, {
      executions: 0,
      matches: 0,
      lastExecuted: null,
      averageExecutionTime: 0
    });
  }

  async evaluate(dataPoint) {
    const anomalies = [];
    
    for (const [ruleId, rule] of this.rules) {
      try {
        const startTime = Date.now();
        
        // Update stats
        const stats = this.ruleStats.get(ruleId);
        stats.executions++;
        stats.lastExecuted = new Date();

        // Evaluate rule condition
        const context = this.createEvaluationContext(dataPoint);
        const matches = await this.evaluateCondition(rule.condition, context);

        if (matches) {
          stats.matches++;
          
          // Execute rule action
          const anomaly = await this.executeAction(rule, dataPoint, context);
          if (anomaly) {
            anomalies.push({
              ...anomaly,
              ruleId,
              ruleName: rule.name,
              ruleCategory: rule.category
            });
          }
        }

        // Update execution time stats
        const executionTime = Date.now() - startTime;
        stats.averageExecutionTime = 
          (stats.averageExecutionTime * (stats.executions - 1) + executionTime) / stats.executions;

      } catch (error) {
        this.logger.error(`Error evaluating rule ${ruleId}:`, error);
      }
    }

    return anomalies;
  }

  createEvaluationContext(dataPoint) {
    return {
      data: dataPoint,
      timestamp: new Date(),
      
      // Helper functions for rule evaluation
      helpers: {
        isWithinRange: (value, min, max) => value >= min && value <= max,
        isOutsideRange: (value, min, max) => value < min || value > max,
        percentageChange: (current, previous) => 
          previous === 0 ? 0 : ((current - previous) / previous) * 100,
        daysBetween: (date1, date2) => 
          Math.abs(new Date(date1) - new Date(date2)) / (1000 * 60 * 60 * 24),
        isWeekend: (date) => {
          const day = new Date(date).getDay();
          return day === 0 || day === 6;
        },
        calculateMovingAverage: (values, window) => {
          if (values.length < window) return null;
          const sum = values.slice(-window).reduce((a, b) => a + b, 0);
          return sum / window;
        }
      }
    };
  }

  async evaluateCondition(condition, context) {
    if (typeof condition === 'function') {
      return await condition(context);
    }
    
    if (typeof condition === 'string') {
      // Simple string-based condition evaluation
      return this.evaluateStringCondition(condition, context);
    }
    
    if (typeof condition === 'object') {
      return this.evaluateObjectCondition(condition, context);
    }
    
    return false;
  }

  evaluateStringCondition(condition, context) {
    // Simple expression evaluator for string conditions
    // This is a basic implementation - in production, use a proper expression parser
    try {
      const func = new Function('context', `
        const { data, helpers } = context;
        return ${condition};
      `);
      return func(context);
    } catch (error) {
      this.logger.error('Error evaluating string condition:', error);
      return false;
    }
  }

  evaluateObjectCondition(condition, context) {
    const { data } = context;
    
    // Handle different condition types
    if (condition.type === 'comparison') {
      const value = this.getNestedValue(data, condition.field);
      return this.compareValues(value, condition.operator, condition.value);
    }
    
    if (condition.type === 'logical') {
      if (condition.operator === 'AND') {
        return condition.conditions.every(c => this.evaluateObjectCondition(c, context));
      }
      if (condition.operator === 'OR') {
        return condition.conditions.some(c => this.evaluateObjectCondition(c, context));
      }
    }
    
    return false;
  }

  async executeAction(rule, dataPoint, context) {
    if (typeof rule.action === 'function') {
      return await rule.action(dataPoint, context);
    }
    
    // Default action - create anomaly object
    return {
      type: rule.category || 'unknown',
      severity: rule.severity || 'medium',
      message: rule.message || `Rule ${rule.name} triggered`,
      details: rule.details || {},
      timestamp: new Date()
    };
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  compareValues(value1, operator, value2) {
    switch (operator) {
      case '==': return value1 == value2;
      case '===': return value1 === value2;
      case '!=': return value1 != value2;
      case '!==': return value1 !== value2;
      case '>': return value1 > value2;
      case '>=': return value1 >= value2;
      case '<': return value1 < value2;
      case '<=': return value1 <= value2;
      case 'contains': return String(value1).includes(value2);
      case 'startsWith': return String(value1).startsWith(value2);
      case 'endsWith': return String(value1).endsWith(value2);
      case 'regex': return new RegExp(value2).test(String(value1));
      default: return false;
    }
  }

  getRuleStats() {
    const stats = {};
    for (const [ruleId, rule] of this.rules) {
      const ruleStats = this.ruleStats.get(ruleId);
      stats[ruleId] = {
        name: rule.name,
        category: rule.category,
        ...ruleStats,
        successRate: ruleStats.executions > 0 ? 
          (ruleStats.matches / ruleStats.executions) * 100 : 0
      };
    }
    return stats;
  }

  enableRule(ruleId) {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = true;
      return true;
    }
    return false;
  }

  disableRule(ruleId) {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = false;
      return true;
    }
    return false;
  }

  removeRule(ruleId) {
    const removed = this.rules.delete(ruleId);
    if (removed) {
      this.ruleStats.delete(ruleId);
    }
    return removed;
  }
}

module.exports = RuleEngine;
