import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { CustomError } from '../errors/CustomError';

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof CustomError) {
    logger.error(`${err.status} - ${err.message}`);
    res.status(err.status).json({ error: err.message });
    return;
  }

  logger.error('Unhandled error', err);
  res.status(500).json({ error: 'Internal Server Error' });
} 