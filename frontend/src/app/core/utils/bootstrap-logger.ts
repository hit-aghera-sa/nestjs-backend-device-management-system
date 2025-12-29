// src/app/core/utils/bootstrap-logger.ts
export class BootstrapLogger {
  static error(message: string, data?: any) {
    console.error('[BOOTSTRAP ERROR]', message, data ?? '');
  }
}
