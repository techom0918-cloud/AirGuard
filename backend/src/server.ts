import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { initializeFirebase } from './config/firebase.js';
import { requireDeviceKey } from './middleware/authMiddleware.js';
import { getHealth } from './controllers/healthController.js';
import { readingController } from './controllers/readingController.js';
import { alertController } from './controllers/alertController.js';
import healthRoutes from './routes/healthRoutes.js';
import deviceRoutes from './routes/deviceRoutes.js';
import readingRoutes from './routes/readingRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import heatmapRoutes from './routes/heatmapRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin (Safe fallback if credentials missing/placeholder)
initializeFirebase();

// --------------------------------------------------
// Approved Master API Contract Endpoints
// --------------------------------------------------

// 1. Root Health Check Endpoint: GET /health
app.get('/health', getHealth);

// 2. Sensor Data Ingestion Endpoint: POST /api/sensor-data (Authenticated via X-Device-Key)
app.post('/api/sensor-data', requireDeviceKey, readingController.saveSensorData);

// 3. Alert Endpoint: POST /api/alert (Singular)
app.post('/api/alert', alertController.saveAlert);

// 4. Device Telemetry History Endpoint: GET /api/history/:deviceId
app.get('/api/history/:deviceId', readingController.getHistory);

// --------------------------------------------------
// Compatibility & Supplemental API Endpoints
// --------------------------------------------------
app.use('/api', healthRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/readings', readingRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/heatmap', heatmapRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Start Server if executed directly
const isMain = process.argv[1] && (process.argv[1].endsWith('server.ts') || process.argv[1].endsWith('server.js'));
if (isMain && process.env.NODE_ENV !== 'test') {
  app.listen(config.port, '0.0.0.0', () => {
    console.log(`[AirGuard Backend] Server running on 0.0.0.0:${config.port} (${config.nodeEnv})`);
    console.log(`[AirGuard Backend] Health check endpoint: http://localhost:${config.port}/health`);
  });
}

export default app;
