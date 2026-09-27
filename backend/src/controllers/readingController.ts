import { Request, Response, NextFunction } from 'express';
import { readingService } from '../services/readingService.js';
import { ApiError } from '../middleware/errorHandler.js';
import { RiskLevel } from '../types/schema.js';

const VALID_RISK_LEVELS: Set<string> = new Set(['low', 'moderate', 'high']);

export const readingController = {
  async saveReading(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { device_id, pm25, temp, humidity, risk_level, lat, lng, timestamp } = req.body || {};

      if (!device_id || typeof device_id !== 'string' || device_id.trim() === '') {
        throw new ApiError(400, 'device_id is required and must be a non-empty string.');
      }

      if (typeof pm25 !== 'number' || !Number.isFinite(pm25)) {
        throw new ApiError(400, 'pm25 is required and must be a finite number.');
      }

      if (typeof temp !== 'number' || !Number.isFinite(temp)) {
        throw new ApiError(400, 'temp is required and must be a finite number.');
      }

      if (typeof humidity !== 'number' || !Number.isFinite(humidity)) {
        throw new ApiError(400, 'humidity is required and must be a finite number.');
      }

      if (typeof lat !== 'number' || !Number.isFinite(lat) || lat < -90 || lat > 90) {
        throw new ApiError(400, 'lat is required and must be a finite number between -90 and 90.');
      }

      if (typeof lng !== 'number' || !Number.isFinite(lng) || lng < -180 || lng > 180) {
        throw new ApiError(400, 'lng is required and must be a finite number between -180 and 180.');
      }

      if (!risk_level || !VALID_RISK_LEVELS.has(risk_level)) {
        throw new ApiError(400, "risk_level is required and must be one of 'low', 'moderate', 'high'.");
      }

      if (!timestamp || isNaN(Date.parse(timestamp))) {
        throw new ApiError(400, 'timestamp is required and must be a valid timestamp string.');
      }

      const created = await readingService.saveReading({
        device_id: device_id.trim(),
        pm25,
        temp,
        humidity,
        risk_level: risk_level as RiskLevel,
        lat,
        lng,
        timestamp,
      });

      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  },

  async getLatestReading(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deviceId = req.params.deviceId;

      if (!deviceId || typeof deviceId !== 'string' || deviceId.trim() === '') {
        throw new ApiError(400, 'deviceId parameter is required.');
      }

      const reading = await readingService.getLatestReading(deviceId.trim());

      if (!reading) {
        throw new ApiError(404, `No reading found for device '${deviceId}'.`);
      }

      res.status(200).json(reading);
    } catch (error) {
      next(error);
    }
  },

  async getDeviceReadings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deviceId = req.params.deviceId;

      if (!deviceId || typeof deviceId !== 'string' || deviceId.trim() === '') {
        throw new ApiError(400, 'deviceId parameter is required.');
      }

      let limitCount = 50;
      if (req.query.limit !== undefined) {
        const parsedLimit = Number(req.query.limit);
        if (!Number.isInteger(parsedLimit) || parsedLimit <= 0 || parsedLimit > 100) {
          throw new ApiError(400, 'limit query parameter must be a positive integer up to 100.');
        }
        limitCount = parsedLimit;
      }

      const readings = await readingService.getDeviceReadings(deviceId.trim(), limitCount);
      res.status(200).json(readings);
    } catch (error) {
      next(error);
    }
  },
};
