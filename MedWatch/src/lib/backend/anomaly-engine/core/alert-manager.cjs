/**
 * Alert Manager
 * Handles alert generation, routing, and notification delivery
 */

const EventEmitter = require('events');
const twilio = require('twilio');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

class AlertManager extends EventEmitter {
  constructor() {
    super();
    this.alertQueue = [];
    this.alertHistory = new Map();
    this.notificationChannels = new Map();
    this.alertRules = new Map();
    this.isProcessing = false;

    // Initialize logger BEFORE calling initializeTwilioClient()
    this.logger = {
      info: (message, data = '') => {
        const timestamp = new Date().toISOString();
        process.stdout.write(`[INFO][AlertManager] ${timestamp} - ${message} ${JSON.stringify(data)}\n`);
      },
      warn: (message, data = '') => {
        const timestamp = new Date().toISOString();
        process.stdout.write(`[WARN][AlertManager] ${timestamp} - ${message} ${JSON.stringify(data)}\n`);
      },
      error: (message, error = '') => {
        const timestamp = new Date().toISOString();
        process.stderr.write(`[ERROR][AlertManager] ${timestamp} - ${message} ${JSON.stringify(error)}\n`);
      }
    };
    
    // Initialize Twilio client (now logger is available)
    this.initializeTwilioClient();
    
    this.initializeNotificationChannels();
    this.initializeAlertRules();
  }

  initializeTwilioClient() {
    // Validate Twilio environment variables
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      this.logger.error('Missing required Twilio environment variables');
      this.logger.error('Required: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER');
      this.twilioClient = null;
      return;
    }

    // Check if using placeholder values
    if (process.env.TWILIO_ACCOUNT_SID === 'your_account_sid_here' || 
        process.env.TWILIO_AUTH_TOKEN === 'your_auth_token_here' || 
        process.env.TWILIO_PHONE_NUMBER === 'your_twilio_phone_number_here') {
      this.logger.error('Please update your .env file with actual Twilio credentials');
      this.logger.error('Current values appear to be placeholders');
      this.logger.error('Get your credentials from: https://console.twilio.com/');
      this.twilioClient = null;
      return;
    }

    // Validate Account SID format
    if (!process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
      this.logger.error('Invalid TWILIO_ACCOUNT_SID format. It should start with "AC"');
      this.twilioClient = null;
      return;
    }

    try {
      // Initialize Twilio client
      this.twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      
      this.logger.info('Twilio client initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Twilio client', error);
      this.twilioClient = null;
    }
  }

  initializeNotificationChannels() {
    // Email notification channel
    this.notificationChannels.set('email', {
      name: 'Email',
      enabled: true,
      send: this.sendEmailAlert.bind(this),
      config: {
        smtpServer: process.env.SMTP_SERVER || 'localhost',
        smtpPort: process.env.SMTP_PORT || 587,
        username: process.env.EMAIL_USERNAME,
        password: process.env.EMAIL_PASSWORD
      }
    });

    // SMS notification channel
    this.notificationChannels.set('sms', {
      name: 'SMS',
      enabled: !!this.twilioClient, // Only enable if Twilio is properly configured
      send: this.sendSMSAlert.bind(this),
      config: {
        twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
        twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
        twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER
      }
    });

    // Webhook notification channel
    this.notificationChannels.set('webhook', {
      name: 'Webhook',
      enabled: true,
      send: this.sendWebhookAlert.bind(this),
      config: {
        endpoints: process.env.WEBHOOK_ENDPOINTS?.split(',') || []
      }
    });

    // Slack notification channel
    this.notificationChannels.set('slack', {
      name: 'Slack',
      enabled: true,
      send: this.sendSlackAlert.bind(this),
      config: {
        webhookUrl: process.env.SLACK_WEBHOOK_URL,
        channel: process.env.SLACK_CHANNEL || '#alerts'
      }
    });
  }

  initializeAlertRules() {
    // Critical alerts - immediate notification
    this.alertRules.set('critical', {
      severity: 'critical',
      channels: ['email', 'sms', 'slack'],
      immediate: true,
      escalation: {
        enabled: true,
        timeoutMinutes: 15,
        escalateToChannels: ['sms', 'webhook']
      },
      recipients: {
        email: ['admin@medwatch.com', 'alerts@medwatch.com'],
        sms: ['+1234567890'],
        slack: ['@channel']
      }
    });

    // High priority alerts
    this.alertRules.set('high', {
      severity: 'high',
      channels: ['email', 'slack'],
      immediate: true,
      escalation: {
        enabled: true,
        timeoutMinutes: 30,
        escalateToChannels: ['sms']
      },
      recipients: {
        email: ['alerts@medwatch.com'],
        slack: ['@here']
      }
    });

    // Medium priority alerts
    this.alertRules.set('medium', {
      severity: 'medium',
      channels: ['email'],
      immediate: false,
      batchingEnabled: true,
      batchingIntervalMinutes: 15,
      recipients: {
        email: ['alerts@medwatch.com']
      }
    });

    // Low priority alerts
    this.alertRules.set('low', {
      severity: 'low',
      channels: ['email'],
      immediate: false,
      batchingEnabled: true,
      batchingIntervalMinutes: 60,
      recipients: {
        email: ['alerts@medwatch.com']
      }
    });
  }

  async sendAlert(anomaly) {
    const alertId = this.generateAlertId();
    const alert = {
      id: alertId,
      anomaly,
      timestamp: new Date(),
      status: 'pending',
      attempts: 0,
      maxAttempts: 3
    };

    // Store in history
    this.alertHistory.set(alertId, alert);

    // Determine alert severity and rules
    const severity = this.determineSeverity(anomaly);
    const alertRule = this.alertRules.get(severity);

    if (!alertRule) {
      this.logger.warn('No alert rule found', { severity });
      return;
    }

    alert.severity = severity;
    alert.rule = alertRule;

    // Add to queue or send immediately
    if (alertRule.immediate) {
      await this.processAlert(alert);
    } else {
      this.alertQueue.push(alert);
      this.scheduleQueueProcessing();
    }

    this.emit('alert-queued', alert);
    return alertId;
  }

  async processAlert(alert) {
    try {
      alert.status = 'processing';
      alert.attempts++;

      const { rule } = alert;
      const notifications = [];

      // Send notifications through configured channels
      for (const channelName of rule.channels) {
        const channel = this.notificationChannels.get(channelName);
        if (!channel || !channel.enabled) {
          this.logger.warn('Notification channel not available', { channelName });
          continue;
        }

        try {
          const notification = await this.sendNotification(channel, alert);
          notifications.push(notification);
        } catch (error) {
          this.logger.error('Failed to send notification', { channelName, error: error.message });
          notifications.push({
            channel: channelName,
            success: false,
            error: error.message
          });
        }
      }

      alert.notifications = notifications;
      alert.status = notifications.some(n => n.success) ? 'sent' : 'failed';
      alert.processedAt = new Date();

      // Schedule escalation if enabled
      if (rule.escalation?.enabled && alert.status === 'sent') {
        this.scheduleEscalation(alert);
      }

      this.emit('alert-sent', alert);

    } catch (error) {
      this.logger.error('Error processing alert', { 
        alertId: alert.id, 
        error: error.message,
        attempt: alert.attempts
      });
      alert.status = 'failed';
      alert.error = error.message;
      
      // Retry if attempts remaining
      if (alert.attempts < alert.maxAttempts) {
        setTimeout(() => this.processAlert(alert), 5000 * alert.attempts);
      }
    }
  }

  async sendNotification(channel, alert) {
    const { anomaly } = alert;
    
    const notificationData = {
      alertId: alert.id,
      severity: alert.severity,
      timestamp: alert.timestamp,
      anomaly: {
        type: anomaly.type,
        message: anomaly.message || `${anomaly.type} anomaly detected`,
        confidence: anomaly.confidence,
        location: anomaly.dataPoint?.location,
        medicine: anomaly.dataPoint?.medicineName,
        details: anomaly.details
      }
    };

    return await channel.send(notificationData, alert.rule.recipients[channel.name] || []);
  }

  async sendEmailAlert(notificationData, recipients) {
    // Simulated email sending
    this.logger.info('Sending email alert', {
      to: recipients,
      subject: `[${notificationData.severity.toUpperCase()}] Medicine Shortage Alert`,
      body: this.formatEmailBody(notificationData)
    });

    // In real implementation, use nodemailer or similar
    return {
      channel: 'email',
      success: true,
      recipients,
      sentAt: new Date()
    };
  }

  async sendSMSAlert(notificationData, recipients) {
    if (!this.twilioClient) {
      throw new Error('Twilio client not initialized. Please check your environment variables.');
    }

    const message = this.formatSMSMessage(notificationData);
    const results = [];

    for (const phoneNumber of recipients) {
      try {
        // Basic phone number validation
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
          throw new Error(`Invalid phone number format: ${phoneNumber}. Please include country code (e.g., +1234567890)`);
        }

        // Message length validation
        if (message.length > 1600) {
          throw new Error('Message too long. Maximum 1600 characters allowed.');
        }
        
        this.logger.info(`Sending SMS to ${phoneNumber}: ${message.substring(0, 50)}...`);
        
        const result = await this.twilioClient.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phoneNumber
        });
        
        this.logger.info(`SMS sent successfully to ${phoneNumber}. SID: ${result.sid}`);
        
        results.push({
          phoneNumber,
          success: true,
          sid: result.sid,
          sentAt: new Date()
        });
        
      } catch (error) {
        this.logger.error(`Failed to send SMS to ${phoneNumber}`, error);
        
        // Handle specific Twilio errors
        let errorMessage = error.message;
        if (error.code === 21211) {
          errorMessage = 'Invalid phone number - not valid or not reachable';
        } else if (error.code === 21408) {
          errorMessage = 'Permission denied - no permission to send SMS to this number';
        } else if (error.code === 21608) {
          errorMessage = 'Unverified number (Trial Account) - please verify at twilio.com or upgrade to paid account';
        } else if (error.code === 21614) {
          errorMessage = 'Invalid phone number format - please include country code';
        }
        
        results.push({
          phoneNumber,
          success: false,
          error: errorMessage,
          code: error.code || 'UNKNOWN'
        });
      }
    }

    return {
      channel: 'sms',
      success: results.some(r => r.success),
      results,
      message,
      sentAt: new Date()
    };
  }

  async sendSlackAlert(notificationData, recipients) {
    // Simulated Slack notification
    const slackMessage = this.formatSlackMessage(notificationData);
    
    this.logger.info('Sending Slack alert', {
      channel: recipients,
      message: slackMessage
    });

    // In real implementation, use Slack Web API
    return {
      channel: 'slack',
      success: true,
      recipients,
      message: slackMessage,
      sentAt: new Date()
    };
  }

  async sendWebhookAlert(notificationData, endpoints) {
    // Simulated webhook sending
    this.logger.info('Sending webhook alert', {
      endpoints,
      payload: notificationData
    });

    // In real implementation, make HTTP POST requests
    return {
      channel: 'webhook',
      success: true,
      endpoints,
      payload: notificationData,
      sentAt: new Date()
    };
  }

  formatEmailBody(notificationData) {
    return `
      Alert ID: ${notificationData.alertId}
      Severity: ${notificationData.severity.toUpperCase()}
      Time: ${notificationData.timestamp.toISOString()}
      
      Anomaly Details:
      - Type: ${notificationData.anomaly.type}
      - Medicine: ${notificationData.anomaly.medicine}
      - Location: ${notificationData.anomaly.location}
      - Confidence: ${(notificationData.anomaly.confidence * 100).toFixed(1)}%
      - Message: ${notificationData.anomaly.message}
      
      Additional Details:
      ${JSON.stringify(notificationData.anomaly.details, null, 2)}
    `;
  }

  formatSMSMessage(notificationData) {
    return `[${notificationData.severity.toUpperCase()}] ${notificationData.anomaly.medicine} shortage in ${notificationData.anomaly.location}. Confidence: ${(notificationData.anomaly.confidence * 100).toFixed(0)}%. Alert ID: ${notificationData.alertId}`;
  }

  formatSlackMessage(notificationData) {
    const emoji = {
      critical: '',
      high: '',
      medium: '',
      low: 'ℹ'
    };

    return {
      text: `${emoji[notificationData.severity]} Medicine Shortage Alert`,
      attachments: [{
        color: this.getSeverityColor(notificationData.severity),
        fields: [
          {
            title: 'Medicine',
            value: notificationData.anomaly.medicine,
            short: true
          },
          {
            title: 'Location',
            value: notificationData.anomaly.location,
            short: true
          },
          {
            title: 'Confidence',
            value: `${(notificationData.anomaly.confidence * 100).toFixed(1)}%`,
            short: true
          },
          {
            title: 'Alert ID',
            value: notificationData.alertId,
            short: true
          }
        ],
        footer: 'MedWatch Anomaly Detection',
        ts: Math.floor(notificationData.timestamp.getTime() / 1000)
      }]
    };
  }

  getSeverityColor(severity) {
    const colors = {
      critical: 'danger',
      high: 'warning',
      medium: 'good',
      low: '#439FE0'
    };
    return colors[severity] || 'good';
  }

  determineSeverity(anomaly) {
    // Determine severity based on anomaly properties
    if (anomaly.severity) {
      return anomaly.severity;
    }

    if (anomaly.confidence >= 0.9) return 'critical';
    if (anomaly.confidence >= 0.7) return 'high';
    if (anomaly.confidence >= 0.5) return 'medium';
    return 'low';
  }

  scheduleQueueProcessing() {
    if (this.isProcessing) return;

    this.isProcessing = true;
    setTimeout(async () => {
      await this.processQueue();
      this.isProcessing = false;
    }, 1000);
  }

  async processQueue() {
    const alertsToProcess = [...this.alertQueue];
    this.alertQueue = [];

    // Group alerts by severity and batching rules
    const batchedAlerts = this.groupAlertsForBatching(alertsToProcess);

    for (const batch of batchedAlerts) {
      try {
        if (batch.length === 1) {
          await this.processAlert(batch[0]);
        } else {
          await this.processBatchedAlerts(batch);
        }
      } catch (error) {
        this.logger.error('Error processing alert batch', {
          batchSize: batch.length,
          error: error.message
        });
      }
    }
  }

  groupAlertsForBatching(alerts) {
    const batches = [];
    const batchMap = new Map();

    for (const alert of alerts) {
      const rule = alert.rule;
      
      if (rule.batchingEnabled) {
        const batchKey = `${alert.severity}_${rule.batchingIntervalMinutes}`;
        if (!batchMap.has(batchKey)) {
          batchMap.set(batchKey, []);
        }
        batchMap.get(batchKey).push(alert);
      } else {
        batches.push([alert]);
      }
    }

    // Add batched alerts
    for (const batch of batchMap.values()) {
      batches.push(batch);
    }

    return batches;
  }

  async processBatchedAlerts(alerts) {
    // Create a combined alert for batched notifications
    const batchAlert = {
      id: this.generateAlertId(),
      type: 'batch',
      alerts,
      severity: alerts[0].severity,
      rule: alerts[0].rule,
      timestamp: new Date(),
      status: 'processing'
    };

    // Send batch notification
    await this.processAlert(batchAlert);
  }

  scheduleEscalation(alert) {
    const { escalation } = alert.rule;
    
    setTimeout(async () => {
      // Check if alert was acknowledged
      const currentAlert = this.alertHistory.get(alert.id);
      if (currentAlert.status === 'acknowledged') {
        return;
      }

      // Escalate alert
      this.logger.warn('Escalating alert', {
        alertId: alert.id,
        severity: alert.severity,
        escalationTime: new Date().toISOString()
      });
      
      for (const channelName of escalation.escalateToChannels) {
        const channel = this.notificationChannels.get(channelName);
        if (channel && channel.enabled) {
          try {
            await this.sendNotification(channel, alert);
          } catch (error) {
            this.logger.error('Failed to escalate alert', {
              alertId: alert.id,
              channel: channelName,
              error: error.message
            });
          }
        }
      }

      this.emit('alert-escalated', alert);
      
    }, escalation.timeoutMinutes * 60 * 1000);
  }

  acknowledgeAlert(alertId, acknowledgedBy) {
    const alert = this.alertHistory.get(alertId);
    if (!alert) {
      throw new Error(`Alert ${alertId} not found`);
    }

    alert.status = 'acknowledged';
    alert.acknowledgedBy = acknowledgedBy;
    alert.acknowledgedAt = new Date();

    this.emit('alert-acknowledged', alert);
    return alert;
  }

  getAlertStats() {
    const alerts = Array.from(this.alertHistory.values());
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    return {
      total: alerts.length,
      last24Hours: alerts.filter(a => a.timestamp >= last24Hours).length,
      bySeverity: this.groupBy(alerts, 'severity'),
      byStatus: this.groupBy(alerts, 'status'),
      averageResponseTime: this.calculateAverageResponseTime(alerts),
      queueSize: this.alertQueue.length
    };
  }

  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = item[key] || 'unknown';
      groups[group] = (groups[group] || 0) + 1;
      return groups;
    }, {});
  }

  calculateAverageResponseTime(alerts) {
    const processedAlerts = alerts.filter(a => a.processedAt && a.timestamp);
    if (processedAlerts.length === 0) return 0;

    const totalTime = processedAlerts.reduce((sum, alert) => {
      return sum + (alert.processedAt - alert.timestamp);
    }, 0);

    return totalTime / processedAlerts.length;
  }

  generateAlertId() {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Health check method for Twilio connection
  async testTwilioConnection() {
    if (!this.twilioClient) {
      throw new Error('Twilio client not initialized');
    }

    try {
      const account = await this.twilioClient.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
      return {
        success: true,
        account: account.friendlyName,
        status: account.status,
        message: 'Twilio connection successful'
      };
    } catch (error) {
      this.logger.error('Twilio connection test failed', error);
      throw new Error(`Twilio connection failed: ${error.message}`);
    }
  }

  // Method to send SMS directly (can be used for testing)
  async sendDirectSMS(phoneNumber, message) {
    if (!this.twilioClient) {
      throw new Error('Twilio client not initialized');
    }

    // Basic phone number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
      throw new Error('Invalid phone number format. Please include country code (e.g., +1234567890)');
    }

    // Message length validation
    if (message.length > 1600) {
      throw new Error('Message too long. Maximum 1600 characters allowed.');
    }

    try {
      const result = await this.twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });

      return {
        success: true,
        sid: result.sid,
        message: 'SMS sent successfully'
      };
    } catch (error) {
      this.logger.error('Error sending direct SMS', error);
      throw error;
    }
  }
}

module.exports = AlertManager;
