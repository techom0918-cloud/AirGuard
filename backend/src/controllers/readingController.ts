import { Request, Response, NextFunction } from 'express';
import { readingService } from '../services/readingService.js';
import { deviceService } from '../services/deviceService.js';
import { ApiError } from '../middleware/errorHandler.js';
import { RiskLevel, ReadingDocument } from '../types/schema.js';

const VALID_RISK_LEVELS: Set<string> = new Set(['SAFE', 'WARNING', 'DANGER']);

export const readingController = {
  /**
   * Master endpoint handler: POST /api/sensor-data
   * Authenticated ESP32 telemetry ingestion endpoint.
   */
  async saveSensorData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        device_id,
        pm25,
        temp,
        humidity,
        risk_level,
        lat,
        lng,
        timestamp,
        mq135_raw,
        sensor_voltage,
        air_quality_score,
      } = req.body || {};

      // 1. Payload validation
      if (!device_id || typeof device_id !== 'string' || device_id.trim() === '') {
        throw new ApiError(400, 'device_id is required and must be a non-empty string.');
      }

      if (pm25 !== undefined && pm25 !== null) {
        if (typeof pm25 !== 'number' || !Number.isFinite(pm25) || pm25 < 0) {
          throw new ApiError(400, 'pm25 must be a non-negative finite number if provided.');
        }
      }

      if (typeof temp !== 'number' || !Number.isFinite(temp) || temp < -50 || temp > 100) {
        throw new ApiError(400, 'temp is required and must be a finite number between -50 and 100.');
      }

      if (typeof humidity !== 'number' || !Number.isFinite(humidity) || humidity < 0 || humidity > 100) {
        throw new ApiError(400, 'humidity is required and must be a finite number between 0 and 100.');
      }

      if (mq135_raw !== undefined && mq135_raw !== null) {
        if (typeof mq135_raw !== 'number' || !Number.isFinite(mq135_raw) || mq135_raw < 0) {
          throw new ApiError(400, 'mq135_raw must be a non-negative finite number if provided.');
        }
      }

      if (sensor_voltage !== undefined && sensor_voltage !== null) {
        if (typeof sensor_voltage !== 'number' || !Number.isFinite(sensor_voltage) || sensor_voltage < 0) {
          throw new ApiError(400, 'sensor_voltage must be a non-negative finite number if provided.');
        }
      }

      if (air_quality_score !== undefined && air_quality_score !== null) {
        if (typeof air_quality_score !== 'number' || !Number.isFinite(air_quality_score) || air_quality_score < 0) {
          throw new ApiError(400, 'air_quality_score must be a non-negative finite number if provided.');
        }
      }

      if (!risk_level || !VALID_RISK_LEVELS.has(risk_level)) {
        if (['low', 'moderate', 'high'].includes(risk_level)) {
          throw new ApiError(400, `INVALID_RISK_LEVEL: Legacy risk level '${risk_level}' is not supported. Master risk vocabulary requires SAFE, WARNING, or DANGER.`);
        }
        throw new ApiError(400, "risk_level is required and must be one of 'SAFE', 'WARNING', 'DANGER'.");
      }

      // Generate server timestamp if omitted
      let resolvedTimestamp: string;
      if (timestamp && typeof timestamp === 'string' && !isNaN(Date.parse(timestamp))) {
        resolvedTimestamp = new Date(timestamp).toISOString();
      } else {
        resolvedTimestamp = new Date().toISOString();
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
      const readingPayload: ReadingDocument = {
        device_id: cleanDeviceId,
        temp,
        humidity,
        risk_level: risk_level as RiskLevel,
        lat: resolvedLat,
        lng: resolvedLng,
        timestamp: resolvedTimestamp,
      };

      if (pm25 !== undefined && pm25 !== null) {
        readingPayload.pm25 = pm25;
      }
      if (mq135_raw !== undefined && mq135_raw !== null) {
        readingPayload.mq135_raw = mq135_raw;
      }
      if (sensor_voltage !== undefined && sensor_voltage !== null) {
        readingPayload.sensor_voltage = sensor_voltage;
      }
      if (air_quality_score !== undefined && air_quality_score !== null) {
        readingPayload.air_quality_score = air_quality_score;
      }

      const created = await readingService.saveReading(readingPayload);

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
