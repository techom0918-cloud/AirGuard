import { Request, Response, NextFunction } from 'express';
import { readingService, HeatmapFilterOptions } from '../services/readingService.js';
import { ApiError } from '../middleware/errorHandler.js';

export const heatmapController = {
  async getHeatmapData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const options: HeatmapFilterOptions = {};

      if (req.query.minLat !== undefined) {
        const val = Number(req.query.minLat);
        if (!Number.isFinite(val) || val < -90 || val > 90) {
          throw new ApiError(400, 'minLat query parameter must be a finite number between -90 and 90.');
        }
        options.minLat = val;
      }

      if (req.query.maxLat !== undefined) {
        const val = Number(req.query.maxLat);
        if (!Number.isFinite(val) || val < -90 || val > 90) {
          throw new ApiError(400, 'maxLat query parameter must be a finite number between -90 and 90.');
        }
        options.maxLat = val;
      }

      if (req.query.minLng !== undefined) {
        const val = Number(req.query.minLng);
        if (!Number.isFinite(val) || val < -180 || val > 180) {
          throw new ApiError(400, 'minLng query parameter must be a finite number between -180 and 180.');
        }
        options.minLng = val;
      }

      if (req.query.maxLng !== undefined) {
        const val = Number(req.query.maxLng);
        if (!Number.isFinite(val) || val < -180 || val > 180) {
          throw new ApiError(400, 'maxLng query parameter must be a finite number between -180 and 180.');
        }
        options.maxLng = val;
      }

      if (req.query.limit !== undefined) {
        const val = Number(req.query.limit);
        if (!Number.isInteger(val) || val <= 0 || val > 100) {
          throw new ApiError(400, 'limit query parameter must be a positive integer up to 100.');
        }
        options.limitCount = val;
      }

      const points = await readingService.getHeatmapReadings(options);
      res.status(200).json(points);
    } catch (error) {
      next(error);
    }
  },
};
