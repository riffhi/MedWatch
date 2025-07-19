import express from 'express';
import cors from 'cors';
import twilio from 'twilio';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Validate environment variables
if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
  console.error(' Missing required environment variables. Please check your .env file.');
  console.error('Required: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER');
  process.exit(1);
}

// Check if using placeholder values
if (process.env.TWILIO_ACCOUNT_SID === 'your_account_sid_here' || 
    process.env.TWILIO_AUTH_TOKEN === 'your_auth_token_here' || 
    process.env.TWILIO_PHONE_NUMBER === 'your_twilio_phone_number_here') {
  console.error(' Please update your .env file with actual Twilio credentials.');
  console.error('Current values appear to be placeholders.');
  console.error('Get your credentials from: https://console.twilio.com/');
  process.exit(1);
}

// Validate Account SID format
if (!process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
  console.error(' Invalid TWILIO_ACCOUNT_SID format. It should start with "AC"');
  process.exit(1);
}

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// SMS endpoint
app.post('/api/send-sms', async (req, res) => {
  try {
    const { to, message } = req.body;
    
    if (!to || !message) {
      return res.status(400).json({ 
        error: 'Phone number and message are required' 
      });
    }

    // Basic phone number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(to.replace(/\s/g, ''))) {
      return res.status(400).json({ 
        error: 'Invalid phone number format. Please include country code (e.g., +1234567890)' 
      });
    }

    // Message length validation
    if (message.length > 1600) {
      return res.status(400).json({ 
        error: 'Message too long. Maximum 1600 characters allowed.' 
      });
    }
    
    console.log(`Sending SMS to ${to}: ${message.substring(0, 50)}...`);
    
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });
    
    console.log(`SMS sent successfully. SID: ${result.sid}`);
    
    res.json({ 
      success: true, 
      sid: result.sid,
      message: 'SMS sent successfully' 
    });
    
  } catch (error) {
    console.error('Error sending SMS:', error);
    
    // Handle specific Twilio errors
    if (error.code === 21211) {
      return res.status(400).json({ 
        error: 'Invalid phone number',
        details: 'The phone number is not valid or not reachable.' 
      });
    }
    
    if (error.code === 21408) {
      return res.status(400).json({ 
        error: 'Permission denied',
        details: 'You do not have permission to send SMS to this number.' 
      });
    }
    
    if (error.code === 21608) {
      return res.status(400).json({ 
        error: 'Unverified number (Trial Account)',
        details: 'This phone number is not verified. Please verify it at twilio.com/user/account/phone-numbers/verified or upgrade to a paid account.' 
      });
    }
    
    if (error.code === 21614) {
      return res.status(400).json({ 
        error: 'Invalid phone number format',
        details: 'The phone number is not in a valid format. Please include country code (e.g., +1234567890).' 
      });
    }
    
    // Generic error for other cases
    res.status(500).json({ 
      error: 'Failed to send SMS',
      details: error.message,
      code: error.code || 'UNKNOWN'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test Twilio connection
app.get('/api/test-twilio', async (req, res) => {
  try {
    const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    res.json({ 
      success: true, 
      account: account.friendlyName,
      status: account.status,
      message: 'Twilio connection successful' 
    });
  } catch (error) {
    console.error('Twilio connection test failed:', error);
    res.status(500).json({ 
      error: 'Twilio connection failed',
      details: error.message 
    });
  }
});

// Serve React app for all other routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(` MedWatch server running on port ${port}`);
  console.log(` SMS service ready with Twilio`);
  console.log(` Access your app at: http://localhost:${port}`);
  console.log(` Health check: http://localhost:${port}/api/health`);
});