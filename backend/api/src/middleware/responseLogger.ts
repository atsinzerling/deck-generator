import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export function responseLogger(req: Request, res: Response, next: NextFunction) {
  // Capture the original send method
  const originalSend = res.send.bind(res);

  res.send = (body?: any): Response => {
    // Log basic response info along with method and URL
    logger.info(`Response: ${req.method} ${req.originalUrl} - ${res.statusCode}`);

    // Log the response body at a debug level. Be cautious about logging large or sensitive data.
    logger.debug(`Response Body for ${req.method} ${req.originalUrl}: ${
      typeof body === 'object' ? JSON.stringify(body) : body
    }`);

    // Call the original send method to send the response
    return originalSend(body);
  };

  next();
} 