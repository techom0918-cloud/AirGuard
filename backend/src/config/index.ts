import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  deviceApiKey: process.env.DEVICE_API_KEY || process.env.X_DEVICE_KEY || 'airguard-secret-device-key-2026',
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || 'airguard-dev',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  },
};
