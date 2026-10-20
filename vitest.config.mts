import { playwright } from '@vitest/browser-playwright';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { storybookAngularVitest } from '@storybook/angular-vite/vitest';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [storybookAngularVitest(), await storybookTest()],
	test: {
		browser: {
			enabled: true,
			provider: playwright({ launchOptions: { channel: 'msedge' } }),
			instances: [{ browser: 'chromium', headless: true }],
		},
	},
});
