import { logger } from "./logger";

export class LoggingService {
  static info(message: string, meta?: any) {
    logger.info(message, meta);
  }

  static warn(message: string, meta?: any) {
    logger.warn(message, meta);
  }

  static error(message: string, meta?: any) {
    logger.error(message, meta);
  }
}

