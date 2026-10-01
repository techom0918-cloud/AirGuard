import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';
import { ApiError } from './errorHandler.js';

/**
 * Middleware enforcing X-Device-Key authentication for hardware devices sending telemetry.
 */
export const requireDeviceKey = (req: Request, _res: Response, next: NextFunction): void => {
  const deviceKeyHeader = req.headers['x-device-key'] || req.headers['X-Device-Key'];

  if (!deviceKeyHeader || typeof deviceKeyHeader !== 'string' || deviceKeyHeader.trim() === '') {
    throw new ApiError(401, 'Unauthorized: Missing X-Device-Key header.');
  }

  const expectedKey = config.deviceApiKey;
  if (deviceKeyHeader.trim() !== expectedKey) {
    throw new ApiError(403, 'Forbidden: Invalid X-Device-Key header.');
  }

  next();
};
