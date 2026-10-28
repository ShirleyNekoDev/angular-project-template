import { readFileSync } from 'node:fs';

import { playwright } from '@vitest/browser-playwright';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { storybookAngularVitest } from '@storybook/angular-vite/vitest';
import { defineConfig } from 'vitest/config';

type AngularCoverageConfiguration = {
	coverage?: boolean;
	coverageExclude?: string[];
	coverageInclude?: string[];
	coverageReporters?: (string | [string, Record<string, unknown>])[];
};

type AngularProject = {
	architect?: {
		test?: {
			configurations?: Record<string, AngularCoverageConfiguration>;
		};
	};
};

type AngularJson = {
	projects: Record<string, AngularProject>;
};

type StoryCoverageOptions = {
	exclude: string[];
	include: string[];
	reporter: (string | [string, Record<string, unknown>])[];
};

function readAngularCoverageOptions(): StoryCoverageOptions {
	const angularJson = JSON.parse(readFileSync(new URL('./angular.json', import.meta.url), 'utf8')) as AngularJson;
	for (const project of Object.values(angularJson.projects)) {
		const coverage = project.architect?.test?.configurations?.coverage;
		if (coverage?.coverage === true) {
			return {
				exclude: coverage.coverageExclude ?? [],
				include: coverage.coverageInclude ?? [],
				reporter: coverage.coverageReporters ?? [],
			};
		}
	}
	throw new Error('angular.json: no test target with a "coverage" configuration found; cannot derive coverage options.');
}

export default defineConfig({
	plugins: [storybookAngularVitest(), await storybookTest()],
	test: {
		browser: {
			enabled: true,
			provider: playwright({ launchOptions: { channel: 'msedge' } }),
			instances: [{ browser: 'chromium', headless: true }],
		},
		coverage: {
			provider: 'v8',
			reportsDirectory: 'coverage/storybook',
			...readAngularCoverageOptions(),
		},
	},
});
