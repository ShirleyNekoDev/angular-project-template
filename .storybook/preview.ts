import type { Preview } from '@storybook/angular-vite';

const preview: Preview = {
	parameters: {
		// Fail story tests on axe-core violations (Storybook a11y addon); a story can
		// relax to { a11y: { test: 'todo' } } or skip with { a11y: { test: 'off' } }
		a11y: { test: 'error' },
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/,
			},
		},
	},
};

export default preview;
