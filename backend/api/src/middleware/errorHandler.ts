import { ZodError } from "zod";
import { Request, Response, NextFunction } from "express";
import { ValidateError } from "tsoa";
import logger from '../utils/logger';
import { CustomError } from '../errors/CustomError';
import { LLMError } from "../errors/LLMError";

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {

  if (err instanceof LLMError) {
    logger.error(`${err.constructor.name} - ${err.message}`, err.stack);
    if (err.cause) {
      logger.error("Underlying error:", err.cause);
    }
    res.status(err.status).json({
      error: "An error occurred while processing your language model request.",
      errorType: err.constructor.name
    });
    return;
  }
  
  if (err instanceof CustomError) {
    logger.error(`${err.status} - ${err.message}`, err.stack);
    res.status(err.status).json({ error: err.message });
    return;
  }

  // Zod validation errors
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

// eventually gotta add unauthorized and forbidden errors