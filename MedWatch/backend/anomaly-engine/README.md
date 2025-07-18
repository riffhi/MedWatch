# MedWatch Anomaly Detection Engine

A comprehensive backend system for detecting medicine shortage anomalies using both rule-based and machine learning approaches.

## Features

### Anomaly Detection Methods

1. **Rule-Based Detection**
   - Predefined business rules for common shortage patterns
   - Critical stock depletion alerts
   - Price manipulation detection
   - Supply chain disruption monitoring
   - Regional shortage pattern analysis

2. **Machine Learning Models**
   - Time series anomaly detection
   - Isolation forest for outlier detection
   - Price anomaly detection
   - Demand forecasting models

3. **Alert Management**
   - Multi-channel notifications (Email, SMS, Slack, Webhooks)
   - Severity-based alert routing
   - Escalation mechanisms
   - Alert acknowledgment and tracking

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Data Input    │───▶│  Data Processor  │───▶│  Anomaly Core   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                        │
                       ┌─────────────────┐             │
                       │  Rule Engine    │◀────────────┤
                       └─────────────────┘             │
                                                        │
                       ┌─────────────────┐             │
                       │  ML Models      │◀────────────┤
                       └─────────────────┘             │
                                                        │
                       ┌─────────────────┐             │
                       │ Alert Manager   │◀────────────┘
                       └─────────────────┘
                                │
                       ┌─────────────────┐
                       │ Notifications   │
                       └─────────────────┘
```

## Quick Start

### Installation

```bash
cd backend/anomaly-engine
npm install
```

### Configuration

Set environment variables:

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# Detection Configuration
ENABLE_RULES=true
ENABLE_ML=true
PROCESSING_INTERVAL=30000
ALERT_THRESHOLD=0.7
BATCH_SIZE=1000

# Notification Configuration
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
SMS_API_KEY=your-sms-api-key
SLACK_WEBHOOK_URL=your-slack-webhook-url
```

### Running the System

```bash
# Start the API server
npm start

# Development mode with auto-reload
npm run dev

# Run usage example
npm run example
```

## API Endpoints

### Data Submission

```bash
# Submit single data point
POST /api/detect
Content-Type: application/json

{
  "medicineName": "Insulin (Regular)",
  "location": "Delhi",
  "currentStock": 5,
  "criticalThreshold": 20,
  "currentPrice": 450,
  "averageMarketPrice": 400,
  "timestamp": "2024-01-15T10:30:00Z"
}

# Submit batch data
POST /api/detect/batch
Content-Type: application/json

[
  { /* data point 1 */ },
  { /* data point 2 */ }
]
```

### Monitoring

```bash
# Get system statistics
GET /api/stats

# Get recent anomalies
GET /api/anomalies?limit=50

# Get rule engine stats
GET /api/rules/stats

# Get ML model stats
GET /api/models/stats

# Get alert statistics
GET /api/alerts/stats
```

### Management

```bash
# Update anomaly status
PUT /api/anomalies/{id}/status
{
  "status": "resolved",
  "reviewedBy": "admin@medwatch.com"
}

# Acknowledge alert
PUT /api/alerts/{id}/acknowledge
{
  "acknowledgedBy": "admin@medwatch.com"
}

# Enable/disable rule
PUT /api/rules/{id}/toggle
{
  "enabled": false
}
```

## Data Format

### Required Fields

```javascript
{
  "medicineName": "string",     // Name of the medicine
  "location": "string",         // Geographic location
  "currentStock": "number",     // Current stock level
  "timestamp": "string"         // ISO 8601 timestamp
}
```

### Optional Fields

```javascript
{
  "currentPrice": "number",
  "priceHistory": "number[]",
  "stockHistory": "number[]",
  "demandHistory": "number[]",
  "criticalThreshold": "number",
  "reorderPoint": "number",
  "averageMarketPrice": "number",
  "dailyConsumption": "number",
  "supplier": "string",
  "expiryDate": "string",
  "batchNumber": "string",
  "seasonalFactors": "object"
}
```

## Rule Categories

### 1. Shortage Rules

- **Critical Stock Depletion**: Stock below critical threshold
- **Complete Stockout**: Zero stock availability
- **Rapid Stock Decline**: Unusually fast consumption
- **Regional Shortage Pattern**: Multiple locations affected
- **Supply Chain Disruption**: Delivery delays

### 2. Price Rules

- **Sudden Price Spike**: Significant price increases
- **Price Manipulation**: Coordinated pricing patterns
- **Cross-Regional Disparity**: Price differences across regions
- **Black Market Pricing**: Prices above MRP during shortages
- **Price Volatility**: High price fluctuations

### 3. Quality Rules

- **Expiry Date Approaching**: Medicines near expiration
- **Batch Quality Issues**: Quality concerns for specific batches

### 4. Consumption Rules

- **Unusual Consumption Pattern**: Abnormal demand spikes
- **Seasonal Demand Anomalies**: Unexpected seasonal variations

## Machine Learning Models

### 1. Time Series Anomaly Detection

- Detects unusual patterns in stock levels over time
- Uses statistical methods (z-score, moving averages)
- Identifies sudden drops or spikes

### 2. Isolation Forest

- Unsupervised anomaly detection
- Identifies outliers in multi-dimensional feature space
- Good for detecting novel anomaly patterns

### 3. Price Anomaly Detection

- Specialized model for price-related anomalies
- Considers market volatility and regional factors
- Detects manipulation and artificial scarcity

### 4. Demand Forecasting

- Predicts expected demand based on historical patterns
- Incorporates seasonal factors
- Identifies demand anomalies

## Alert Management

### Severity Levels

1. **Critical**: Immediate action required
   - Channels: Email, SMS, Slack
   - Escalation: 15 minutes
   - Recipients: All administrators

2. **High**: Urgent attention needed
   - Channels: Email, Slack
   - Escalation: 30 minutes
   - Recipients: Alert team

3. **Medium**: Monitor closely
   - Channels: Email
   - Batching: 15 minutes
   - Recipients: Alert team

4. **Low**: Informational
   - Channels: Email
   - Batching: 60 minutes
   - Recipients: Alert team

### Notification Channels

- **Email**: SMTP-based email notifications
- **SMS**: SMS gateway integration
- **Slack**: Webhook-based Slack messages
- **Webhook**: Custom HTTP endpoints

## Performance Considerations

### Scalability

- Batch processing for high-volume data
- Configurable processing intervals
- Queue-based alert management
- Stateless API design

### Monitoring

- Real-time statistics tracking
- Performance metrics collection
- Error logging and reporting
- Health check endpoints

## Development

### Adding New Rules

1. Create rule file in `rules/` directory
2. Export rule object with required properties:
   ```javascript
   module.exports = {
     id: 'unique-rule-id',
     name: 'Rule Name',
     category: 'rule-category',
     severity: 'critical|high|medium|low',
     condition: (context) => boolean,
     action: (dataPoint, context) => anomalyObject
   };
   ```

### Adding New ML Models

1. Extend `MLModelManager` class
2. Implement model loading and prediction methods
3. Add model to initialization sequence
4. Update ensemble combination logic

### Custom Notification Channels

1. Add channel to `AlertManager.initializeNotificationChannels()`
2. Implement send method
3. Add configuration options
4. Update alert rules to use new channel

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=anomaly-detector
```

## Deployment

### Docker

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

### Environment Variables

Ensure all required environment variables are set in production:
- Database connections
- SMTP credentials
- SMS API keys
- Webhook URLs
- Security tokens

## Monitoring and Maintenance

### Health Checks
- API endpoint: `GET /health`
- System status monitoring
- Database connectivity
- External service availability

### Logging
- Structured logging with timestamps
- Error tracking and alerting
- Performance metrics
- Audit trails

### Backup and Recovery
- Regular data backups
- Configuration backups
- Disaster recovery procedures
- Rollback capabilities

## Support

For issues and questions:
- Check the logs for error messages
- Review API documentation
- Contact the development team
- Submit bug reports with detailed information

## License

MIT License - see LICENSE file for details.