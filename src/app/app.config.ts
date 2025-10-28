import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, isDevMode } from '@angular/core';
import { provideRouter, TitleStrategy, withHashLocation } from '@angular/router';

import { routes } from './app.routes';
import { provideLocalPersistence } from './persistence/persistence.provider';
import { CustomTitleStrategy } from './routing/custom.title-strategy';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    { provide: TitleStrategy, useClass: CustomTitleStrategy },
    provideRouter(routes, withHashLocation()),
    provideLocalPersistence(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    { provide: Window, useValue: window }
  ]
};
