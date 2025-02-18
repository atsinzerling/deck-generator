import { ZodError } from "zod";
import { Request, Response, NextFunction } from "express";
import { ValidateError } from "tsoa";
import logger from '../utils/logger';
import { CustomError } from '../errors/CustomError';
import { InternalServerError } from '../errors/InternalServerError';

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof CustomError) {
    logger.error(`${err.status} - ${err.message}`);
    res.status(err.status).json({ error: err.message });
    return;
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    logger.warn(`[ZodError] Validation failed: ${JSON.stringify(err.format())}`);
    res.status(400).json({
      error: "Validation Error",
      details: err.errors.map(e => ({
        message: e.message,
        path: e.path.join("."),
      })),
    });
    return;
  }

  // Handle TSOA validation errors (missing/extra fields, type mismatches)
  if (err instanceof ValidateError) {
    logger.warn(`[TsoaError] Validation failed: ${JSON.stringify(err.fields)}`);
    res.status(400).json({
      error: "Validation Error",
      details: err.fields,
    });
    return;
  }

  logger.error('Unhandled error', err);
  res.status(500).json({ error: 'Internal Server Error' });
} 