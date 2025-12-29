import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { BootstrapLogger } from './app/core/utils/bootstrap-logger';

bootstrapApplication(App, appConfig)
.catch(err => BootstrapLogger.error('App failed to start', err));
