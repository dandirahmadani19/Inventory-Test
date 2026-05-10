import { Request, Response, NextFunction } from 'express';
import logger from '../../infrastructure/logging/logger';

function formatLocalTime(d: Date): string {
  return d.toISOString().replace('T', ' ').substring(0, 19);
}

export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startTime = new Date();
  const chunks: Buffer[] = [];

  const originalWrite = res.write.bind(res) as typeof res.write;
  const originalEnd = res.end.bind(res) as typeof res.end;

  (res as any).write = function (chunk: any, ...args: any[]): boolean {
    if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    return (originalWrite as any)(chunk, ...args);
  };

  (res as any).end = function (chunk: any, ...args: any[]): Response {
    if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    return (originalEnd as any)(chunk, ...args);
  };

  res.on('finish', () => {
    const endTime = new Date();
    const status = res.statusCode;

    let responseBody = '';
    try {
      responseBody = Buffer.concat(chunks).toString('utf-8');
    } catch {
      responseBody = '';
    }

    const requestBody = req.body && Object.keys(req.body).length > 0
      ? JSON.stringify(req.body)
      : '';

    const logMeta = {
      http_method: req.method,
      http_path: req.originalUrl,
      http_req_ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '',
      http_user_agent: req.headers['user-agent'] || '',
      http_request_body: requestBody,
      http_response_body: responseBody,
      http_status_code: status,
      http_start_time: formatLocalTime(startTime),
      http_end_time: formatLocalTime(endTime),
      http_duration_ms: endTime.getTime() - startTime.getTime(),
    };

    if (status >= 500) {
      logger.error({ message: 'http log', ...logMeta });
    } else if (status >= 400) {
      logger.warn({ message: 'http log', ...logMeta });
    } else {
      logger.info({ message: 'http log', ...logMeta });
    }
  });

  next();
}
