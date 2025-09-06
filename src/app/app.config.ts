import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, TitleStrategy } from '@angular/router';

import { routes } from './app.routes';
import { provideLocalPersistence } from './persistence/persistence.provider';
import { CustomTitleStrategy } from './routing/custom.title-strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    { provide: TitleStrategy, useClass: CustomTitleStrategy },
    provideRouter(routes),
    provideLocalPersistence()
  ]
};
