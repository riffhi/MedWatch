/**
 * Anomaly Detection API
 * REST API endpoints for the anomaly detection system
 */

const express = require('express');
const cors = require('cors');
const AnomalyDetector = require('../core/anomaly-detector');

class AnomalyAPI {
  constructor(config = {}, logger) {
    this.app = express();
    this.port = config.port || 3001;
    this.logger = logger || console; // Use injected logger or fallback to console
    
    // Pass the logger to the core detector
    this.anomalyDetector = new AnomalyDetector(config.detector, this.logger);
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    
    // Request logging middleware
    this.app.use((req, res, next) => {
      this.logger.info(`${req.method} ${req.path}`); // Use logger for request logging
      next();
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0'
      });
    });

    // Submit data for anomaly detection
    this.app.post('/api/detect', async (req, res) => {
      try {
        const dataPoint = req.body;
        
        if (!dataPoint) {
          return res.status(400).json({
            error: 'No data provided',
            code: 'MISSING_DATA'
          });
        }

        const success = this.anomalyDetector.addData(dataPoint);
        
        if (success) {
          res.json({
            success: true,
            message: 'Data submitted for anomaly detection',
            timestamp: new Date().toISOString()
          });
        } else {
          res.status(400).json({
            error: 'Invalid data format',
            code: 'INVALID_DATA'
          });
        }
        
      } catch (error) {
        this.logger.error('Error in /api/detect:', error);
        res.status(500).json({
          error: 'Internal server error',
          code: 'INTERNAL_ERROR'
        });
      }
    });

    // Submit batch data
    this.app.post('/api/detect/batch', async (req, res) => {
      try {
        const dataPoints = req.body;
        
        if (!Array.isArray(dataPoints)) {
          return res.status(400).json({
            error: 'Data must be an array',
            code: 'INVALID_FORMAT'
          });
        }

        const results = {
          total: dataPoints.length,
          successful: 0,
          failed: 0,
          errors: []
        };

        for (let i = 0; i < dataPoints.length; i++) {
          try {
            const success = this.anomalyDetector.addData(dataPoints[i]);
            if (success) {
              results.successful++;
            } else {
              results.failed++;
              results.errors.push({
                index: i,
                error: 'Invalid data format'
              });
            }
          } catch (error) {
            results.failed++;
            results.errors.push({
              index: i,
              error: error.message
            });
          }
        }

        res.json({
          success: true,
          results,
          timestamp: new Date().toISOString()
        });
        
      } catch (error) {
        this.logger.error('Error in /api/detect/batch:', error);
        res.status(500).json({
          error: 'Internal server error',
          code: 'INTERNAL_ERROR'
        });
      }
    });

    // Get anomaly statistics
    this.app.get('/api/stats', (req, res) => {
      try {
        const stats = this.anomalyDetector.getStatistics();
        res.json({
          success: true,
          data: stats,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        this.logger.error('Error in /api/stats:', error);
        res.status(500).json({
          error: 'Internal server error',
          code: 'INTERNAL_ERROR'
        });
      }
    });

    // Get recent anomalies
    this.app.get('/api/anomalies', (req, res) => {
      try {
        const limit = parseInt(req.query.limit) || 50;
        const anomalies = this.anomalyDetector.getRecentAnomalies(limit);
        
        res.json({
          success: true,
          data: anomalies,
          count: anomalies.length,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        this.logger.error('Error in /api/anomalies:', error);
        res.status(500).json({
          error: 'Internal server error',
          code: 'INTERNAL_ERROR'
        });
      }
    });

    // Update anomaly status
    this.app.put('/api/anomalies/:id/status', (req, res) => {
      try {
        const { id } = req.params;
        const { status, reviewedBy } = req.body;
        
        if (!status) {
          return res.status(400).json({
            error: 'Status is required',
            code: 'MISSING_STATUS'
          });
        }

        const validStatuses = ['detected', 'investigating', 'resolved', 'false-positive'];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({
            error: 'Invalid status',
            code: 'INVALID_STATUS',
            validStatuses
          });
        }

        const updatedAnomaly = this.anomalyDetector.updateAnomalyStatus(id, status, reviewedBy);
        
        res.json({
          success: true,
          data: updatedAnomaly,
          timestamp: new Date().toISOString()
        });
        
      } catch (error) {
        if (error.message.includes('not found')) {
          res.status(404).json({
            error: error.message,
            code: 'ANOMALY_NOT_FOUND'
          });
        } else {
          this.logger.error(`Error in /api/anomalies/${req.params.id}/status:`, error);
          res.status(500).json({
            error: 'Internal server error',
            code: 'INTERNAL_ERROR'
          });
        }
      }
    });

    // Get rule engine statistics
    this.app.get('/api/rules/stats', (req, res) => {
      try {
        const stats = this.anomalyDetector.ruleEngine.getRuleStats();
        res.json({
          success: true,
          data: stats,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        this.logger.error('Error in /api/rules/stats:', error);
        res.status(500).json({
          error: 'Internal server error',
          code: 'INTERNAL_ERROR'
        });
      }
    });

    // Get ML model statistics
    this.app.get('/api/models/stats', (req, res) => {
      try {
        const stats = this.anomalyDetector.mlModelManager.getModelStats();
        res.json({
          success: true,
          data: stats,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        this.logger.error('Error in /api/models/stats:', error);
        res.status(500).json({
          error: 'Internal server error',
          code: 'INTERNAL_ERROR'
        });
      }
    });

    // Enable/disable rule
    this.app.put('/api/rules/:id/toggle', (req, res) => {
      try {
        const { id } = req.params;
        const { enabled } = req.body;
        
        let success;
        if (enabled) {
          success = this.anomalyDetector.ruleEngine.enableRule(id);
        } else {
          success = this.anomalyDetector.ruleEngine.disableRule(id);
        }
        
        if (success) {
          res.json({
            success: true,
            message: `Rule ${id} ${enabled ? 'enabled' : 'disabled'}`,
            timestamp: new Date().toISOString()
          });
        } else {
          res.status(404).json({
            error: 'Rule not found',
            code: 'RULE_NOT_FOUND'
          });
        }
        
      } catch (error) {
        this.logger.error(`Error in /api/rules/${req.params.id}/toggle:`, error);
        res.status(500).json({
          error: 'Internal server error',
          code: 'INTERNAL_ERROR'
        });
      }
    });

    // Get alert statistics
    this.app.get('/api/alerts/stats', (req, res) => {
      try {
        const stats = this.anomalyDetector.alertManager.getAlertStats();
        res.json({
          success: true,
          data: stats,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        this.logger.error('Error in /api/alerts/stats:', error);
        res.status(500).json({
          error: 'Internal server error',
          code: 'INTERNAL_ERROR'
        });
      }
    });

    // Acknowledge alert
    this.app.put('/api/alerts/:id/acknowledge', (req, res) => {
      try {
        const { id } = req.params;
        const { acknowledgedBy } = req.body;
        
        const alert = this.anomalyDetector.alertManager.acknowledgeAlert(id, acknowledgedBy);
        
        res.json({
          success: true,
          data: alert,
          timestamp: new Date().toISOString()
        });
        
      } catch (error) {
        if (error.message.includes('not found')) {
          res.status(404).json({
            error: error.message,
            code: 'ALERT_NOT_FOUND'
          });
        } else {
          this.logger.error(`Error in /api/alerts/${req.params.id}/acknowledge:`, error);
          res.status(500).json({
            error: 'Internal server error',
            code: 'INTERNAL_ERROR'
          });
        }
      }
    });

    // System control endpoints
    this.app.post('/api/system/start', async (req, res) => {
      try {
        await this.anomalyDetector.start();
        res.json({
          success: true,
          message: 'Anomaly detection system started',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        this.logger.error('Error starting system:', error);
        res.status(500).json({
          error: 'Failed to start system',
          code: 'START_ERROR'
        });
      }
    });

    this.app.post('/api/system/stop', async (req, res) => {
      try {
        await this.anomalyDetector.stop();
        res.json({
          success: true,
          message: 'Anomaly detection system stopped',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        this.logger.error('Error stopping system:', error);
        res.status(500).json({
          error: 'Failed to stop system',
          code: 'STOP_ERROR'
        });
      }
    });
  }

  setupErrorHandling() {
    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        error: 'Endpoint not found',
        code: 'NOT_FOUND',
        path: req.path,
        method: req.method
      });
    });

    // Global error handler
    this.app.use((error, req, res, _next) => {
      this.logger.error('Unhandled error:', error);
      res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    });
  }

  async start() {
    try {
      // Initialize anomaly detector
      await this.anomalyDetector.start();
      
      // Start API server
      this.server = this.app.listen(this.port, () => {
        this.logger.info(`Anomaly Detection API server running on port ${this.port}`);
      });

      // Setup graceful shutdown
      this.setupGracefulShutdown();
      
    } catch (error) {
      this.logger.error('Failed to start Anomaly Detection API:', error);
      throw error;
    }
  }

  setupGracefulShutdown() {
    const shutdown = async (signal) => {
      this.logger.warn(`Received ${signal}, shutting down gracefully...`);
      
      if (this.server) {
        this.server.close(async () => {
          this.logger.info('HTTP server closed');
          await this.anomalyDetector.stop();
          process.exit(0);
        });
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }
}

module.exports = AnomalyAPI;