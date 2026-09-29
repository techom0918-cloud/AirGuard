import { Request, Response, NextFunction } from 'express';
import { readingService } from '../services/readingService.js';
import { deviceService } from '../services/deviceService.js';
import { ApiError } from '../middleware/errorHandler.js';
import { RiskLevel } from '../types/schema.js';

const VALID_RISK_LEVELS: Set<string> = new Set(['SAFE', 'WARNING', 'DANGER']);

export const readingController = {
  /**
   * Master endpoint handler: POST /api/sensor-data
   * Authenticated ESP32 telemetry ingestion endpoint.
   */
  async saveSensorData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { device_id, pm25, temp, humidity, risk_level, lat, lng, timestamp } = req.body || {};

      // 1. Payload validation
      if (!device_id || typeof device_id !== 'string' || device_id.trim() === '') {
        throw new ApiError(400, 'device_id is required and must be a non-empty string.');
      }

      if (typeof pm25 !== 'number' || !Number.isFinite(pm25) || pm25 < 0) {
        throw new ApiError(400, 'pm25 is required and must be a non-negative finite number.');
      }

      if (typeof temp !== 'number' || !Number.isFinite(temp) || temp < -50 || temp > 100) {
        throw new ApiError(400, 'temp is required and must be a finite number between -50 and 100.');
      }

      if (typeof humidity !== 'number' || !Number.isFinite(humidity) || humidity < 0 || humidity > 100) {
        throw new ApiError(400, 'humidity is required and must be a finite number between 0 and 100.');
      }

      if (!risk_level || !VALID_RISK_LEVELS.has(risk_level)) {
        if (['low', 'moderate', 'high'].includes(risk_level)) {
          throw new ApiError(400, `INVALID_RISK_LEVEL: Legacy risk level '${risk_level}' is not supported. Master risk vocabulary requires SAFE, WARNING, or DANGER.`);
        }
        throw new ApiError(400, "risk_level is required and must be one of 'SAFE', 'WARNING', 'DANGER'.");
      }

      if (!timestamp || isNaN(Date.parse(timestamp))) {
        throw new ApiError(400, 'timestamp is required and must be a valid timestamp string.');
      }

      const cleanDeviceId = device_id.trim();

      // 2. Device Existence Check
      const device = await deviceService.getDeviceById(cleanDeviceId);
      if (!device) {
        throw new ApiError(404, `Device '${cleanDeviceId}' is not registered in the system.`);
      }

      // 3. Location Resolution (Request coordinates OR Device registered location fallback)
      let resolvedLat: number | undefined;
      let resolvedLng: number | undefined;

      if (typeof lat === 'number' && Number.isFinite(lat) && lat >= -90 && lat <= 90 &&
          typeof lng === 'number' && Number.isFinite(lng) && lng >= -180 && lng <= 180) {
        resolvedLat = lat;
        resolvedLng = lng;
      } else {
        // Fallback to registered device location if present
        const devAny = device as any;
        const regLat = devAny.lat ?? devAny.location?.lat;
        const regLng = devAny.lng ?? devAny.location?.lng;

        if (typeof regLat === 'number' && Number.isFinite(regLat) &&
            typeof regLng === 'number' && Number.isFinite(regLng)) {
          resolvedLat = regLat;
          resolvedLng = regLng;
        } else {
          throw new ApiError(400, `Location coordinates (lat/lng) are required or must be registered for device '${cleanDeviceId}'.`);
        }
      }

      // 4. Save reading using verified Firestore service
      const created = await readingService.saveReading({
        device_id: cleanDeviceId,
        pm25,
        temp,
        humidity,
        risk_level: risk_level as RiskLevel,
        lat: resolvedLat,
        lng: resolvedLng,
        timestamp: new Date(timestamp).toISOString(),
      });

      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Master endpoint handler: GET /api/history/:deviceId
   */
  async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      const readings = await readingService.getReadingHistory(deviceId.trim(), limitCount);
      res.status(200).json(readings);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Legacy endpoint handler: POST /api/readings
   */
  async saveReading(req: Request, res: Response, next: NextFunction): Promise<void> {
    return readingController.saveSensorData(req, res, next);
  },

  /**
   * Legacy endpoint handler: GET /api/readings/:deviceId/latest
   */
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

  /**
   * Legacy endpoint handler: GET /api/readings/:deviceId
   */
  async getDeviceReadings(req: Request, res: Response, next: NextFunction): Promise<void> {
    return readingController.getHistory(req, res, next);
  },
};
