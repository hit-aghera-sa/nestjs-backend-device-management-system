import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LoggingService {

  info(message: string, data?: any) {
    if (!environment.production) {
      console.info(`[INFO] ${message}`, data ?? '');
    }
  }

  warn(message: string, data?: any) {
    if (!environment.production) {
      console.warn(`[WARN] ${message}`, data ?? '');
    }
  }

  error(message: string, data?: any) {
    console.error(`[ERROR] ${message}`, data ?? '');
  }
}
