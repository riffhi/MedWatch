    /**
     * Appwrite Database Processing Script
     * Reads existing data from an Appwrite collection and re-processes/updates it.
     */
    const path = require('path'); // Import the path module

    // Determine the absolute path to the .env file
    // Adjusted path based on your clarification: .env is one level up in 'anomaly-engine' folder
    const envPath = path.resolve(__dirname, '../.env');

    console.log(`Attempting to load .env from: ${envPath}`);
    require('dotenv').config({ path: envPath });

    const { Client, Databases, Query } = require('node-appwrite');

    async function seedDatabase() {
      console.log('Starting Appwrite data processing...');

      // --- DEBUGGING: Log environment variables ---
      console.log('Environment Variables Check:');
      console.log('APPWRITE_ENDPOINT:', process.env.APPWRITE_ENDPOINT);
      console.log('APPWRITE_PROJECT_ID:', process.env.APPWRITE_PROJECT_ID);
      console.log('APPWRITE_API_KEY:', process.env.APPWRITE_API_KEY);
      console.log('APPWRITE_DATABASE_ID:', process.env.APPWRITE_DATABASE_ID);
      console.log('APPWRITE_MEDICINE_COLLECTION_ID:', process.env.APPWRITE_MEDICINE_COLLECTION_ID);
      console.log('---------------------------------');
      // --- END DEBUGGING ---

      if (!process.env.APPWRITE_ENDPOINT || !process.env.APPWRITE_PROJECT_ID || !process.env.APPWRITE_API_KEY || !process.env.APPWRITE_DATABASE_ID || !process.env.APPWRITE_MEDICINE_COLLECTION_ID) {
        console.error('Error: One or more required Appwrite environment variables are missing or undefined.');
        console.error('Please ensure APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY, APPWRITE_DATABASE_ID, and APPWRITE_MEDICINE_COLLECTION_ID are set in your .env file.');
        process.exit(1);
      }

      const client = new Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT)
        .setProject(process.env.APPWRITE_PROJECT_ID)
        .setKey(process.env.APPWRITE_API_KEY);

      const databases = new Databases(client);
      const databaseId = process.env.APPWRITE_DATABASE_ID;
      const collectionId = process.env.APPWRITE_MEDICINE_COLLECTION_ID;

      let records = [];
      let hasMore = true;
      let cursor = null;

      console.log(`Fetching existing records from Appwrite collection '${collectionId}'...`);

      try {
        while (hasMore) {
          const queries = [Query.limit(100)];
          if (cursor) {
            queries.push(Query.cursorAfter(cursor));
          }

          const response = await databases.listDocuments(
            databaseId,
            collectionId,
            queries
          );

          records = records.concat(response.documents);
          hasMore = response.documents.length === 100;
          if (hasMore) {
            cursor = response.documents[response.documents.length - 1].$id;
          }
        }

        console.log(`Found ${records.length} existing records in Appwrite to process...`);

        if (records.length === 0) {
          console.log('No records found in the Appwrite collection to process. Exiting.');
          return;
        }

        for (const record of records) {
          try {
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
              stockHistory: record.stockHistory,
              priceHistory: record.priceHistory,
              supplierDelay: record.supplierDelay,
              lastUpdatedAt: record.lastUpdatedAt,
            };

            await databases.updateDocument(
              databaseId,
              collectionId,
              record.$id,
              documentData
            );
            console.log(`Successfully processed and updated document for ${record.medicineName} (ID: ${record.$id})`);
          } catch (error) {
            if (error.code === 404) {
              console.error(`Document with ID ${record.$id} not found for ${record.medicineName}. Skipping update.`);
            } else {
              console.error(`Failed to process/update document for ${record.medicineName} (ID: ${record.$id}):`, error);
            }
          }
        }

        console.log('Appwrite data processing complete!');

      } catch (fetchError) {
        console.error('Error fetching documents from Appwrite:', fetchError);
        process.exit(1);
      }
    }

    seedDatabase();
    