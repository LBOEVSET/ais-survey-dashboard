import { Injectable, LoggerService, Scope, LogLevel } from '@nestjs/common';
import * as winston from 'winston';

// Default scope (singleton) — works with app.get()
@Injectable({ scope: Scope.DEFAULT })
export class CustomLoggerService implements LoggerService {
  private readonly logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(
          ({ timestamp, level, message }) => `[${timestamp}] [${level.toUpperCase()}] ${message}`,
        ),
      ),
      transports: [new winston.transports.Console()],
    });
  }

    log(message: string, context?: string) {
        this.logger.info(message, { context });
    }

    error(message: any, trace?: string, context?: string) {
        this.logger.error(message, { trace, context });
    }

    warn(message: any, context?: string) {
        this.logger.warn(message, { context });
    }

    debug(message: any, object: object, context?: string) {
        const logMessage = `[${context}] ${message}`;
        if (object) {
            this.logger.debug(logMessage, object, context);
        } else {
            this.logger.debug(logMessage, context);
        }
    }

    verbose(message: any, context?: string) {
        this.logger.verbose(message, { context });
    }

    setLogLevel(level: LogLevel) {
        this.logger.level = level;
    }
}
