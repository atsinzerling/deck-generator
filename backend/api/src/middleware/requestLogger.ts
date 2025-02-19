import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  logger.info(`Incoming Request: ${req.method} ${req.originalUrl}`);
  
  if (req.body) {
    logger.debug(`Request Body: ${JSON.stringify(req.body)}`);
  }
  next();
} 