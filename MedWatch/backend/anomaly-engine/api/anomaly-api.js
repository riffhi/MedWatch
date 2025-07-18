// Ensure environment variables are loaded
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import AnomalyDetector from '../core/anomaly-detector.js';

class AnomalyAPI {
  constructor(config = {}, logger) {
    this.app = express();
    this.port = config.port || 3001;
    this.logger = logger || console;
    
    // Pass both the detector config and the database config to the core engine.
    // Note: This change assumes the AnomalyDetector and DatabaseService are updated 
    // to accept this config object instead of reading process.env directly.
    const detectorConfig = {
        ...config.detector,
        dbConfig: {
            databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
            medicineCollectionId: import.meta.env.VITE_APPWRITE_MEDICINE_COLLECTION_ID,
            anomalyCollectionId: import.meta.env.VITE_APPWRITE_ANOMALY_COLLECTION_ID,
        }
    };
    
    this.anomalyDetector = new AnomalyDetector(detectorConfig, this.logger);
    this.database = this.anomalyDetector.database;
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    
    this.app.use((req, res, next) => {
      this.logger.info(`${req.method} ${req.path}`);
      next();
    });
  }

  setupRoutes() {
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: (typeof performance !== 'undefined' ? performance.now() / 1000 : 0),
      });
    });

    this.app.get('/api/anomalies', async (req, res) => {
      try {
        const limit = parseInt(req.query.limit) || 50;
        const anomalies = await this.database.getAnomalies(limit);
        res.json({ success: true, data: anomalies, count: anomalies.length });
      } catch (error) {
        this.logger.error('Error in /api/anomalies:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    this.app.put('/api/anomalies/:id/status', async (req, res) => {
      try {
        const { id } = req.params;
        const { status, reviewedBy } = req.body;
        if (!status) return res.status(400).json({ error: 'Status is required' });

        const updatedAnomaly = await this.database.updateAnomalyStatus(id, { status, reviewedBy, reviewedAt: new Date().toISOString() });
        res.json({ success: true, data: updatedAnomaly });
      } catch (error) {
        this.logger.error(`Error updating status for anomaly ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to update anomaly' });
      }
    });
  }

  setupErrorHandling() {
    this.app.use((req, res) => {
      res.status(404).json({ error: 'Endpoint not found' });
    });
    this.app.use((error, req, res) => {
      this.logger.error('Unhandled API error:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
  }

  async start() {
    try {
      await this.anomalyDetector.start();
      this.server = this.app.listen(this.port, () => {
        this.logger.info(`API server running on port ${this.port}`);
      });
    } catch (error) {
      this.logger.error('Failed to start Anomaly Detection API:', error);
      throw error;
    }
  }
}

export default AnomalyAPI;