import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('[Backend Error]:', err.stack || err.message);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Internal server error',
  });
};
