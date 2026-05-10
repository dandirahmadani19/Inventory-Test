import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../../application/errors/app.error';
import { ERROR_CODES } from '../../shared/constants/error-codes';
import logger from '../../infrastructure/logging/logger';

/**
 * Centralized error handler — the ONLY place that converts errors into HTTP responses.
 * Must be registered as the last middleware in app.ts.
 */
export function errorHandlerMiddleware(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  // ── Known Application Errors ──────────────────────────────────────────
  if (err instanceof AppError) {
    const level = err.httpStatus >= 500 ? 'error' : 'warn';
    logger[level]({
      method: req.method,
      path: req.path,
      status: err.httpStatus,
      ms: 0,
      errCode: err.errorCode,
      errMsg: err.message,
    });

    const body: Record<string, unknown> = {
      success: false,
      errorCode: err.errorCode,
      message: err.message,
    };

    // Attach field-level errors only for validation
    if (err instanceof ValidationError) {
      body.errors = err.errors;
    }

    res.status(err.httpStatus).json(body);
    return;
  }

  // ── Unknown / Unhandled Errors ─────────────────────────────────────────
  logger.error({
    method: req.method,
    path: req.path,
    status: 500,
    ms: 0,
    errCode: ERROR_CODES.INTERNAL_ERROR,
    errMsg: err.message,
  });

  res.status(500).json({
    success: false,
    errorCode: ERROR_CODES.INTERNAL_ERROR,
    // Never expose stack trace to client
    message: 'An unexpected error occurred',
  });
}
