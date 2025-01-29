import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  logger.info(`Incoming Request: ${req.method} ${req.originalUrl}`, {
    body: req.body
  });
  next();
} 