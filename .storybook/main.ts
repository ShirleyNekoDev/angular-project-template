import type { StorybookConfig } from '@storybook/angular-vite';

const config: StorybookConfig = {
	stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
	addons: ['@storybook/addon-vitest'],
	framework: '@storybook/angular-vite',
};

export default config;
