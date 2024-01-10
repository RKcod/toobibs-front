/***************************************************************************************************
 * Zone JS is required by default for Angular itself.
 */
// import 'zone.js/dist/zone';  // Included with Angular CLI.

/// <reference types="@angular/localize" />
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
