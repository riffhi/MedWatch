# MedWatch - Medicine Shortage Monitoring System

A real-time medicine shortage monitoring system built with React and Appwrite.

## Features

- **Real-time Medicine Shortage Tracking**: Monitor and report medicine shortages across India
- **Price Anomaly Detection**: ML-powered detection of price irregularities
- **Geographic Mapping**: Visual representation of shortage patterns
- **Multi-role Dashboard**: Separate interfaces for patients, pharmacies, and authorities
- **Kendra Search**: Find Pradhan Mantri Bhartiya Janaushadhi Kendras
- **Price Finder**: Compare medicine prices across different locations

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the project root with the following variables:

```env
# Appwrite Configuration
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id_here
VITE_APPWRITE_DATABASE_ID=your_database_id_here
VITE_APPWRITE_USERS_COLLECTION_ID=your_users_collection_id_here
VITE_APPWRITE_kendra_COLLECTION_ID=your_kendra_collection_id_here
```

**To get these values:**

1. Go to [Appwrite Console](https://cloud.appwrite.io)
2. Create a new project or use an existing one
3. Get your Project ID from the project settings
4. Create a database and get the Database ID
5. Create collections for users and kendra data
6. Get the Collection IDs from each collection

### 3. Run the Development Server

```bash
npm run dev
```

## Project Structure

```
src/
├── components/
│   ├── Dashboard.jsx          # Main dashboard component
│   ├── MedicineShortageMap.jsx # Geographic mapping
│   ├── Alerts.jsx             # Alert management
│   ├── ReportShortage.jsx     # Shortage reporting
│   ├── InventoryManagement.jsx # Pharmacy inventory
│   ├── PriceFinder.jsx        # Price comparison tool
│   ├── kendra_search.jsx      # Kendra search portal
│   └── Layout.jsx             # Navigation layout
├── lib/
│   ├── appwrite.js            # Appwrite configuration
│   └── backend/               # Backend services
└── App.jsx                    # Main application component
```

## User Roles

- **Patient/Public**: Report shortages, find medicines, view maps
- **Pharmacy**: Manage inventory, update stock levels
- **Authority**: Monitor alerts, analyze trends, manage system

## Technologies Used

- React 18
- Vite
- Tailwind CSS
- Appwrite (Backend as a Service)
- Lucide React (Icons)

## Contributing

This project is built by students for healthcare transparency in India.
