import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { initializeFirebase } from './config/firebase.js';
import healthRoutes from './routes/healthRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin (Safe fallback if credentials missing/placeholder)
initializeFirebase();

// Routes
app.use('/api', healthRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`[AirGuard Backend] Server running on port ${config.port} (${config.nodeEnv})`);
    console.log(`[AirGuard Backend] Health check endpoint: http://localhost:${config.port}/api/health`);
  });
}

export default app;
