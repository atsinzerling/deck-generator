import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, printf, errors } = format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// Configure Daily Rotate File transport
const dailyRotateTransport = new DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d'
});

// Initialize logger
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }), // Capture stack trace
    logFormat
  ),
  transports: [
    new transports.Console(),
    dailyRotateTransport,
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' })
  ],
  exceptionHandlers: [
    new transports.File({ filename: 'logs/exceptions.log' })
  ]
});

export default logger; 