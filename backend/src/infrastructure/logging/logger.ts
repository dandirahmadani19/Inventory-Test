import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'log');
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

const jsonFileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
  winston.format.printf((info) => {
    const { timestamp, level, message, [Symbol.for('level') as any]: _sym, ...meta } = info as any;
    return JSON.stringify({ level: (level as string).toUpperCase(), time: timestamp, message, ...meta });
  }),
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf((info) => {
    const { timestamp, level, http_method, http_path, http_status_code, http_duration_ms } = info as any;
    return `[${timestamp}] ${level} ${http_method ?? '-'} ${http_path ?? '-'} ${http_status_code ?? '-'} ${http_duration_ms ?? '-'}ms`;
  }),
);

const dailyRotateTransport = new DailyRotateFile({
  dirname: LOG_DIR,
  filename: 'app-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxFiles: '14d',
  level: LOG_LEVEL,
  format: jsonFileFormat,
});

const consoleTransport = new winston.transports.Console({
  level: LOG_LEVEL,
  format: consoleFormat,
});

const logger = winston.createLogger({
  level: LOG_LEVEL,
  transports: [
    dailyRotateTransport,
    ...(process.env.NODE_ENV !== 'production' ? [consoleTransport] : []),
  ],
});

export default logger;
