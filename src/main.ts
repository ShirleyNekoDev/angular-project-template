import { bootstrapApplication } from '@angular/platform-browser';

import { App } from './app/app';
import { appConfig } from './app/app.config';

import 'temporal-polyfill/global';

bootstrapApplication(App, appConfig).catch((err: unknown) => {
	console.error(err);
});
