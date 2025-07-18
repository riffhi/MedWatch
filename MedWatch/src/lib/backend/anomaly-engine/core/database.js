/**
 * Appwrite Database Service
 * Handles all interactions with the Appwrite database for the Node.js backend.
 */
const { Client, Databases, ID, Query } = require('node-appwrite');

class DatabaseService {
  constructor(logger, dbConfig = {}) {
    // Connection details still come from secure environment variables
    if (!process.env.APPWRITE_ENDPOINT || !process.env.APPWRITE_PROJECT_ID || !process.env.APPWRITE_API_KEY) {
      throw new Error('Missing Appwrite connection environment variables! Please ensure your .env file is set up correctly.');
    }
    
    // Collection IDs now come from the passed-in config object
    if (!dbConfig.databaseId || !dbConfig.medicineCollectionId || !dbConfig.anomalyCollectionId) {
        throw new Error('Missing Appwrite database/collection IDs in the configuration!');
    }
    
    this.logger = logger;
    const client = new Client();
    client
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    this.databases = new Databases(client);
    this.databaseId = dbConfig.databaseId;
    this.medicineCollectionId = dbConfig.medicineCollectionId;
    this.anomalyCollectionId = dbConfig.anomalyCollectionId;
  }

  /**
   * Fetches recent medicine data to be processed.
   */
  async getMedicineDataForProcessing() {
    try {
      this.logger.info('Fetching medicine data from Appwrite...');
      const response = await this.databases.listDocuments(
        this.databaseId,
        this.medicineCollectionId
        // Example: Add queries to fetch only recent data
        // [Query.greaterThan('$updatedAt', new Date(Date.now() - 3600 * 1000).toISOString())]
      );
      return response.documents;
    } catch (error) {
      this.logger.error('Error fetching medicine data from Appwrite:', error);
      return [];
    }
  }

  /**
   * Saves a detected anomaly to the database.
   * @param {object} anomaly - The anomaly object to save.
   */
  async saveAnomaly(anomaly) {
    try {
      this.logger.info(`Saving anomaly ${anomaly.id} to Appwrite...`);
      await this.databases.createDocument(
        this.databaseId,
        this.anomalyCollectionId,
        anomaly.id,
        anomaly
      );
    } catch (error) {
       if (error.code !== 409) { // Ignore "Document already exists" errors
            this.logger.error(`Error saving anomaly ${anomaly.id} to Appwrite:`, error);
       }
    }
  }

  /**
   * Updates the status of an existing anomaly.
   * @param {string} anomalyId - The ID of the anomaly to update.
   * @param {object} data - The data to update (e.g., { status, reviewedBy }).
   */
  async updateAnomalyStatus(anomalyId, data) {
     try {
      this.logger.info(`Updating anomaly ${anomalyId} in Appwrite...`);
      return await this.databases.updateDocument(
        this.databaseId,
        this.anomalyCollectionId,
        anomalyId,
        data
      );
    } catch (error) {
      this.logger.error(`Error updating anomaly ${anomalyId} in Appwrite:`, error);
      throw new Error(`Anomaly ${anomalyId} not found or update failed.`);
    }
  }
  
  /**
   * Fetches anomalies from the database.
   */
  async getAnomalies(limit = 50) {
     try {
      const response = await this.databases.listDocuments(
        this.databaseId,
        this.anomalyCollectionId,
        [Query.limit(limit), Query.orderDesc('$createdAt')]
      );
      return response.documents;
    } catch (error) {
      this.logger.error('Error fetching anomalies from Appwrite:', error);
      return [];
    }
  }
}

module.exports = DatabaseService;
