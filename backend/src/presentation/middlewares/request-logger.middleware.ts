import { Request, Response, NextFunction } from 'express';
import logger from '../../infrastructure/logging/logger';

/**
 * Logs every HTTP request with method, path, status code, and response time.
 * Format: [timestamp] LEVEL  METHOD path statusCode responseTimeMs
 */
export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startAt = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(startAt);
    const ms = Math.round(diff[0] * 1e3 + diff[1] * 1e-6);
    const status = res.statusCode;

    const logMeta = {
      method: req.method,
      path: req.path,
      status,
      ms,
    };

    if (status >= 500) {
      logger.error({ ...logMeta, level: 'error' });
    } else if (status >= 400) {
      logger.warn({ ...logMeta, level: 'warn' });
    } else {
      logger.info({ ...logMeta, level: 'info' });
    }
  });

  next();
}
