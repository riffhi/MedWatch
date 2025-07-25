#### MedWatch: Real-Time Medicine Shortage & Price Anomaly Detection
MedWatch is a smart, real-time monitoring platform designed to detect, predict, and prevent medicine shortages and price anomalies, ensuring equitable access to healthcare for everyone in India.

### 📍 The Problem
Every year, millions in India face a silent crisis: the sudden unavailability of essential medicines like insulin, thyroid medication, and cardiac drugs. This information gap leads to:
## Public Panic: 
Patients and their families are forced into frantic, time-consuming searches.
## Price Gouging: 
Unethical sellers exploit the desperation, inflating prices by 30-50% or more.
## Black Markets: 
Dangerous, unregulated channels emerge for life-saving drugs.
## Reactive Governance: 
Health authorities often learn about a shortage only after it has become a widespread crisis, leaving them with limited options to respond effectively.

### ✨ Our Solution
MedWatch tackles this problem head-on by creating a transparent, data-driven ecosystem connecting patients, pharmacies, and health authorities. Our platform transforms scattered information into actionable intelligence.

By combining crowdsourced patient reports with verified pharmacy inventory data, our powerful Anomaly Detection Engine identifies potential shortages and price spikes before they escalate, providing an early warning system for the entire healthcare chain.

### 🚀 Key Features
## For Patients & the Public
# Live Shortage Map: 
An interactive map (built with Leaflet.js) to visualize real-time medicine availability and shortage hotspots in your area.
# Find Affordable Medicine: 
Instantly locate nearby Jan Aushadhi Kendras to access affordable generic medicines, with potential savings of 50-90%.
# PriceFinder Tool: 
Compare medicine prices from various pharmacies to prevent overpaying.
# Instant Reporting: 
A simple, 30-second form to report medicine shortages or unfair pricing, empowering the community to contribute data.

## For Pharmacies
# Inventory Management System: 
A full-featured CRUD dashboard to manage medicine stock, track expiry dates, and update prices.
# Automated Alerts: 
Receive proactive notifications for low-stock items and medicines approaching their expiry date, helping to prevent stockouts and reduce waste.
# Community Impact: 
Become a verified and trusted partner in the public health ecosystem.

## For Health Authorities & NGOs
# Analytics Dashboard:
A high-level view of regional supply chains, with heat maps and trend analysis.
# Real-Time Anomaly Alerts: 
Get instant notifications from our backend engine about critical regional shortages or coordinated price manipulation.
# Proactive Management: 
Shift from a reactive to a proactive approach by using data to manage supply chains and intervene before a crisis occurs.

### 🛠️ Tech Stack & Architecture
MedWatch is built with a modern, scalable, and real-time technology stack.

Frontend: React, Vite, Tailwind CSS, Leaflet.js
Backend: Node.js, Express.js
Database & Services: Appwrite (Authentication, Real-time Database)
Rule-Based System: For detecting clear violations (e.g., stock below threshold).
ML-Ready Architecture: Designed for time-series analysis and predictive forecasting.

### System Flow
Data Ingestion: Patients submit reports and pharmacies update inventory via the React frontend.
Data Persistence: All data is securely stored in the Appwrite real-time database.
Anomaly Detection: The Node.js backend engine continuously processes data from Appwrite, running it through the Rule Engine and ML models.
Alert Generation: When an anomaly is detected, a new document is created in the anomalies collection.
Data Visualization: The React frontend listens for real-time updates from Appwrite to update the map and dashboards for all users.

### ⚙️ Getting Started
To get a local copy up and running, follow these simple steps.

## Prerequisites
Node.js (v16 or later)
A running Appwrite instance (local or cloud)

## Installation
Clone the repository:

```bash
git clone https://github.com/your-username/MedWatch.git
cd MedWatch
```

Install Frontend Dependencies:

```bash
cd MedWatch
npm install
```

Install Backend Dependencies:

```bash
cd MedWatch/src/lib/backend/anomaly-engine
npm install
```

Set up Environment Variables:
Create a .env file in the root MedWatch directory and add your Appwrite project credentials:

```bash
VITE_APPWRITE_ENDPOINT="https://cloud.appwrite.io/v1"
VITE_APPWRITE_PROJECT_ID="YOUR_PROJECT_ID"
VITE_APPWRITE_DATABASE_ID="YOUR_DATABASE_ID"
VITE_APPWRITE_USERS_COLLECTION_ID="YOUR_USERS_COLLECTION_ID"
VITE_APPWRITE_MEDICINE_COLLECTION_ID="YOUR_MEDICINE_COLLECTION_ID"
```

Create a .env file in the MedWatch/src/lib/backend/anomaly-engine directory for your Node.js server and Appwrite API key:

```bash
PORT=3002
APPWRITE_ENDPOINT="https://cloud.appwrite.io/v1"
APPWRITE_PROJECT_ID="YOUR_PROJECT_ID"
APPWRITE_API_KEY="YOUR_APPWRITE_API_KEY"
APPWRITE_DATABASE_ID="YOUR_DATABASE_ID"
# ... other backend configs
```

Run the Frontend:

From the root MedWatch directory
```bash
npm run dev
```

Run the Backend Anomaly Engine:

From the MedWatch/src/lib/backend/anomaly-engine directory
```bash
npm start
```

### 👥 Our Team - Kaizen
Riddhi Bhanushali 
Hamza Murghay
Denis Anthony
Jay Darje


This project is licensed under the MIT License - see the LICENSE file for details.
