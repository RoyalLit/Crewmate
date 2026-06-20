/**
 * Central Express error-handling middleware.
 *
 * This is the ONLY place where errors are converted to HTTP responses.
 * It must be registered last in the Express middleware chain (after all routes).
 *
 * Per AGENT_RULES.md §20.1:
 *   - AppError subclasses → use their statusCode and code
 *   - Mongoose validation errors → 400
 *   - Mongoose cast errors (invalid ObjectId) → 404
 *   - Unknown errors → 500, stack logged (never exposed to client in production)
 */

import type { ErrorRequestHandler, Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { StatusCodes } from 'http-status-codes';
import multer from 'multer';
import { Error as MongooseError } from 'mongoose';

import env from '../config/env';
import { AppError } from '../shared/errors';
import logger from '../shared/logger';

/**
 * Formats the error response body per AGENT_RULES.md §11.2.
 */
function formatErrorResponse(
  code: string,
  message: string,
  details?: Record<string, unknown>
): { success: false; error: { code: string; message: string; details?: Record<string, unknown> } } {
  const error: { code: string; message: string; details?: Record<string, unknown> } = {
    code,
    message,
  };
  if (details) {
    error.details = details;
  }
  return { success: false, error };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler: ErrorRequestHandler = (err: unknown, req: Request, res: Response, _next: NextFunction): void => {
  // ── Operational AppError subclasses (expected domain failures) ──────────
  if (err instanceof AppError) {
    const level = err.statusCode >= 500 ? 'error' : 'warn';
    logger[level](
      { requestId: req.headers['x-request-id'], err, statusCode: err.statusCode },
      err.message
    );
    res.status(err.statusCode).json(formatErrorResponse(err.code, err.message, err.details));
    return;
  }

  // ── Mongoose ValidationError → 400 ──────────────────────────────────────
  if (err instanceof MongooseError.ValidationError) {
    const details: Record<string, unknown> = {};
    for (const [field, validationError] of Object.entries(err.errors)) {
      details[field] = validationError.message;
    }
    logger.warn({ requestId: req.headers['x-request-id'], err }, 'Mongoose validation error');
    res
      .status(StatusCodes.BAD_REQUEST)
      .json(formatErrorResponse('VALIDATION_ERROR', 'One or more fields are invalid.', details));
    return;
  }

  // ── ZodError → 400 ───────────────────────────────────────────────────────
  if (err instanceof ZodError) {
    const details: Record<string, unknown> = {};
    for (const issue of err.issues) {
      const path = issue.path.join('.');
      details[path] = issue.message;
    }
    logger.warn({ requestId: req.headers['x-request-id'], err }, 'Zod validation error');
    res
      .status(StatusCodes.BAD_REQUEST)
      .json(formatErrorResponse('VALIDATION_ERROR', 'One or more fields are invalid.', details));
    return;
  }

  // ── Mongoose CastError (invalid ObjectId) → 404 ─────────────────────────
  if (err instanceof MongooseError.CastError) {
    logger.warn({ requestId: req.headers['x-request-id'], err }, 'Mongoose cast error');
    res
      .status(StatusCodes.NOT_FOUND)
      .json(formatErrorResponse('NOT_FOUND', 'The requested resource was not found.'));
    return;
  }

  // ── MulterError (file upload) → 400 or 413 ──────────────────────────────
  if (err instanceof multer.MulterError) {
    const statusCode = err.code === 'LIMIT_FILE_SIZE' ? StatusCodes.REQUEST_TOO_LONG : StatusCodes.BAD_REQUEST;
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'File size exceeds the 5MB limit.'
      : err.code === 'LIMIT_UNEXPECTED_FILE'
        ? 'Only JPEG, PNG, and WebP images are allowed.'
        : 'File upload error.';
    logger.warn({ requestId: req.headers['x-request-id'], err }, 'Multer upload error');
    res.status(statusCode).json(formatErrorResponse('UPLOAD_ERROR', message));
    return;
  }

  // ── Unknown errors → 500 ────────────────────────────────────────────────
  // Stack is logged for debugging but NEVER returned to the client.
  logger.error({ requestId: req.headers['x-request-id'], err }, 'Unhandled error');
  const message =
    env.nodeEnv === 'production'
      ? 'An unexpected error occurred. Please try again later.'
      : (err instanceof Error ? err.message : 'An unexpected error occurred.');

  res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .json(formatErrorResponse('INTERNAL_ERROR', message));
};

export default errorHandler;
