import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  // Using setImmediate to defer the logging operation
  setImmediate(() => {
    logger.info(`Incoming Request: ${req.method} ${req.originalUrl}`);
    if (req.body) {
      logger.debug(`Request Body: ${JSON.stringify(req.body)}`);
    }
  });
  next();
} 