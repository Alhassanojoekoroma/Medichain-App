/**
 * Mobile App Logger Service
 * Provides structured logging for the MediChain mobile application
 * Replaces console.log/error/warn statements with proper logging
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: any;
}

class Logger {
  private module: string;

  constructor(module: string) {
    this.module = module;
  }

  private format(level: LogLevel, message: string, data?: any): string {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      module: this.module,
      message,
      data,
    };
    return `[${entry.timestamp}] [${entry.level}] [${entry.module}] ${message}${data ? ` ${JSON.stringify(data)}` : ''}`;
  }

  debug(message: string, data?: any): void {
    if (__DEV__) {
      console.log(this.format(LogLevel.DEBUG, message, data));
    }
  }

  info(message: string, data?: any): void {
    console.log(this.format(LogLevel.INFO, message, data));
  }

  warn(message: string, data?: any): void {
    console.warn(this.format(LogLevel.WARN, message, data));
  }

  error(message: string, data?: any): void {
    console.error(this.format(LogLevel.ERROR, message, data));
  }
}

export function createLogger(module: string): Logger {
  return new Logger(module);
}

// Default logger for general use
export const logger = new Logger('App');
