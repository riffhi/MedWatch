/**
 * Appwrite Database Seeding Script
 * Reads the CSV data and populates the Appwrite collection.
 */
require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const { Client, Databases, ID } = require('node-appwrite');
const { parse } = require('csv-parse/sync');

async function seedDatabase() {
  console.log('Starting database seed...');

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(client);
  const databaseId = process.env.APPWRITE_DATABASE_ID;
  const collectionId = 'medicines';

  // Read and parse the CSV file
  const csvData = fs.readFileSync('../data/medicine-dataset.csv', 'utf8');
  const records = parse(csvData, {
    columns: true,
    skip_empty_lines: true,
    cast: true,
  });

  console.log(`Found ${records.length} records to seed...`);

  for (const record of records) {
    try {
      // Appwrite expects a specific format, so we map our CSV fields
      const documentData = {
        medicineID: record.medicineID,
        medicineName: record.medicineName,
        genericName: record.genericName,
        company: record.company,
        disease: record.disease,
        currentStock: record.currentStock,
        currentPrice: record.currentPrice,
        location: record.location,
        supplier: record.supplier,
        criticalThreshold: record.criticalThreshold,
        averageMarketPrice: record.averageMarketPrice,
        dailyConsumption: record.dailyConsumption,
        stockHistory: JSON.parse(record.stockHistory), // Appwrite can store arrays
        priceHistory: JSON.parse(record.priceHistory),
        supplierDelay: record.supplierDelay,
        lastUpdatedAt: record.lastUpdatedAt,
      };

      await databases.createDocument(
        databaseId,
        collectionId,
        record.medicineID, // Use medicineID as the document ID
        documentData
      );
      console.log(`Successfully seeded ${record.medicineName} in ${record.location}`);
    } catch (error) {
      // If document already exists, Appwrite will throw an error. We can ignore it or update.
      if (error.code === 409) {
         console.log(`Document for ${record.medicineName} in ${record.location} already exists. Skipping.`);
      } else {
         console.error(`Failed to seed ${record.medicineName}:`, error);
      }
    }
  }
  
  console.log('Database seeding complete!');
}

seedDatabase();
