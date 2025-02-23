import { ZodError } from "zod";
import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { ValidateError } from "tsoa";
import logger from '../utils/logger';
import { CustomError } from '../errors/CustomError';
import { LLMError } from "../errors/LLMError";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {

  if (err instanceof LLMError) {
    logger.error(`${err.constructor.name} - ${err.message}`, err.stack);
    if (err.cause) {
      logger.error("Underlying error:", err.cause);
    }
    res.status(err.status).json({
      success: false,
      error: {
        code: err.status,
        type: err.constructor.name,
        message: "An error occurred while processing your language model request."
      }
    });
    return;
  }

  // Custom error handling
  if (err instanceof CustomError) {
    logger.error(`${err.status} - ${err.message}`, err.stack);
    res.status(err.status).json({
      success: false,
      error: {
        code: err.status,
        type: err.constructor.name,
        message: err.message
      }
    });
    return;
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    logger.warn(`[ZodError] Validation failed: ${JSON.stringify(err.format())}`);
    res.status(400).json({
      success: false,
      error: {
        code: 400,
        type: "ValidationError",
        message: "Validation Error",
        details: err.errors.map(e => ({
          message: e.message,
          path: e.path.join(".")
        }))
      }
    });
    return;
  }

  // TSOA validation errors
  if (err instanceof ValidateError) {
    logger.warn(`[TsoaError] Validation failed: ${JSON.stringify(err.fields)}`);
    res.status(400).json({
      success: false,
      error: {
        code: 400,
        type: "ValidationError",
        message: "Validation Error",
        details: err.fields
      }
    });
    return;
  }

  // Fallback for unhandled errors
  logger.error("Unhandled error", err);
  res.status(500).json({
    success: false,
    error: {
      code: 500,
      type: "InternalServerError",
      message: "Internal Server Error"
    }
  });
  return;
};

// eventually gotta add unauthorized and forbidden errors