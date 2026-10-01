import { Request, Response, NextFunction } from 'express';
import { deviceService } from '../services/deviceService.js';
import { ApiError } from '../middleware/errorHandler.js';

export const deviceController = {
  async registerDevice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { device_id, owner, registered_at, lat, lng } = req.body || {};

      if (!device_id || typeof device_id !== 'string' || device_id.trim() === '') {
        throw new ApiError(400, 'device_id is required and must be a non-empty string.');
      }

      if (!owner || typeof owner !== 'string' || owner.trim() === '') {
        throw new ApiError(400, 'owner is required and must be a non-empty string.');
      }

      if (!registered_at || isNaN(Date.parse(registered_at))) {
        throw new ApiError(400, 'registered_at is required and must be a valid timestamp.');
      }

      const created = await deviceService.registerDevice({
        device_id: device_id.trim(),
        owner: owner.trim(),
        registered_at,
        ...(typeof lat === 'number' ? { lat } : {}),
        ...(typeof lng === 'number' ? { lng } : {}),
      });

      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  },

  async getDeviceById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deviceId = req.params.deviceId;

      if (!deviceId || typeof deviceId !== 'string' || deviceId.trim() === '') {
        throw new ApiError(400, 'deviceId parameter is required.');
      }

      const device = await deviceService.getDeviceById(deviceId.trim());

      if (!device) {
        throw new ApiError(404, `Device '${deviceId}' not found.`);
      }

      res.status(200).json(device);
    } catch (error) {
      next(error);
    }
  },

  async listDevices(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const devices = await deviceService.listDevices();
      res.status(200).json(devices);
    } catch (error) {
      next(error);
    }
  },
};
