import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../../application/errors/app.error';
import { ERROR_CODES } from '../../shared/constants/error-codes';

/**
 * Centralized error handler — the ONLY place that converts errors into HTTP responses.
 * Must be registered as the last middleware in app.ts.
 * Logging is handled by requestLoggerMiddleware via res.on('finish').
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
    const body: Record<string, unknown> = {
      success: false,
      errorCode: err.errorCode,
      message: err.message,
    };

    if (err instanceof ValidationError) {
      body.errors = err.errors;
    }

    res.status(err.httpStatus).json(body);
    return;
  }

  // ── Unknown / Unhandled Errors ─────────────────────────────────────────
  res.status(500).json({
    success: false,
    errorCode: ERROR_CODES.INTERNAL_ERROR,
    message: 'An unexpected error occurred',
  });
}
