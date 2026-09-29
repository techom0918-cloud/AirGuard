import { Request, Response, NextFunction } from 'express';
import { alertService } from '../services/alertService.js';
import { ApiError } from '../middleware/errorHandler.js';
import { RiskLevel } from '../types/schema.js';

const VALID_RISK_LEVELS: Set<string> = new Set(['SAFE', 'WARNING', 'DANGER']);

export const alertController = {
  /**
   * Master & legacy handler for alert creation: POST /api/alert & POST /api/alerts
   */
  async saveAlert(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { device_id, risk_level, lat, lng, timestamp, resolved } = req.body || {};

      if (!device_id || typeof device_id !== 'string' || device_id.trim() === '') {
        throw new ApiError(400, 'device_id is required and must be a non-empty string.');
      }

      if (!risk_level || !VALID_RISK_LEVELS.has(risk_level)) {
        if (['low', 'moderate', 'high'].includes(risk_level)) {
          throw new ApiError(400, `INVALID_RISK_LEVEL: Legacy risk level '${risk_level}' is not supported. Master risk vocabulary requires SAFE, WARNING, or DANGER.`);
        }
        throw new ApiError(400, "risk_level is required and must be one of 'SAFE', 'WARNING', 'DANGER'.");
      }

      if (typeof lat !== 'number' || !Number.isFinite(lat) || lat < -90 || lat > 90) {
        throw new ApiError(400, 'lat is required and must be a finite number between -90 and 90.');
      }

      if (typeof lng !== 'number' || !Number.isFinite(lng) || lng < -180 || lng > 180) {
        throw new ApiError(400, 'lng is required and must be a finite number between -180 and 180.');
      }

      if (!timestamp || isNaN(Date.parse(timestamp))) {
        throw new ApiError(400, 'timestamp is required and must be a valid timestamp string.');
      }

      const isResolved = resolved !== undefined ? Boolean(resolved) : false;

      const created = await alertService.saveAlert({
        device_id: device_id.trim(),
        risk_level: risk_level as RiskLevel,
        lat,
        lng,
        timestamp: new Date(timestamp).toISOString(),
        resolved: isResolved,
      });

      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  },

  async getAlertHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      const alerts = await alertService.getAlertHistory(deviceId.trim(), limitCount);
      res.status(200).json(alerts);
    } catch (error) {
      next(error);
    }
  },

  async getActiveAlerts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deviceId = req.params.deviceId;

      if (!deviceId || typeof deviceId !== 'string' || deviceId.trim() === '') {
        throw new ApiError(400, 'deviceId parameter is required.');
      }

      const activeAlerts = await alertService.getActiveAlerts(deviceId.trim());
      res.status(200).json(activeAlerts);
    } catch (error) {
      next(error);
    }
  },
};
