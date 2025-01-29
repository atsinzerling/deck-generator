import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../errors/NotFoundError';
import logger from '../utils/logger';

export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  const error = new NotFoundError(`Route ${req.originalUrl} not found`);
  logger.warn(error.message);
  next(error);
} 