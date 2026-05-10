import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'log');
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

/**
 * Custom single-line format:
 * [timestamp] LEVEL  METHOD path statusCode responseTimeMs | errorCode: message (if error)
 */
const singleLineFormat = winston.format.printf(
  ({ timestamp, level, method, path: reqPath, status, ms, errCode, errMsg }) => {
    const levelStr = level.toUpperCase().padEnd(5);
    const base = `[${timestamp}] ${levelStr} ${method ?? '-'} ${reqPath ?? '-'} ${status ?? '-'} ${ms ?? '-'}ms`;
    return errCode ? `${base} | ${errCode}: ${errMsg}` : base;
  },
);

const dailyRotateTransport = new DailyRotateFile({
  dirname: LOG_DIR,
  filename: 'app-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxFiles: '14d',
  level: LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ssZ' }),
    singleLineFormat,
  ),
});

const consoleTransport = new winston.transports.Console({
  level: LOG_LEVEL,
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    singleLineFormat,
  ),
});

const logger = winston.createLogger({
  level: LOG_LEVEL,
  transports: [
    dailyRotateTransport,
    // Console only in development
    ...(process.env.NODE_ENV !== 'production' ? [consoleTransport] : []),
  ],
});

export default logger;
