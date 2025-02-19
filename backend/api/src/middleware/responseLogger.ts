import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export function responseLogger(req: Request, res: Response, next: NextFunction) {
  // Capture the original send method
  const originalSend = res.send.bind(res);

  res.send = (body?: any): Response => {
    // Defer the logging using setImmediate.
    setImmediate(() => {
      logger.info(`Response: ${req.method} ${req.originalUrl} - ${res.statusCode}`);
      logger.debug(`Response Body for ${req.method} ${req.originalUrl}: ${
        typeof body === 'object' ? JSON.stringify(body) : body
      }`);
    });
    
    return originalSend(body);
  };

  next();
} 