import { Request, Response, NextFunction } from 'express';

export class ApiError extends Error {
  public statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err instanceof ApiError ? err.statusCode : typeof err?.statusCode === 'number' ? err.statusCode : 500;
  const message = err?.message || 'Internal server error';

  if (statusCode === 500) {
    console.error('[Backend Internal Error]:', err?.stack || err);
  }

  res.status(statusCode).json({
    error: {
      message,
    },
  });
};
