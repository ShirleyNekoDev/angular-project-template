// Stylelint config for production build output (`dist/**/*.css`) — plain compiled CSS only.
// doiuse cannot parse SCSS, so browser-feature checks run on the compiled output, after
// `pnpm build`. Run with `pnpm lint:dist`.
// Kept separate from `stylelint.config.ts` so the source-oriented standard rules
// do not run against generated, minified CSS.
//
// Like `stylelint.config.ts`, this is loaded by Node.js's type stripping (Stylelint 18):
// erasable TypeScript syntax only.

import type { Config } from 'stylelint';

const config: Config = {
	plugins: [
		// Browser-support checks via doiuse + caniuse; browsers are read from .browserslistrc
		'stylelint-no-unsupported-browser-features',
	],
	rules: {
		// Fail on CSS features the .browserslistrc targets do not support
		'plugin/no-unsupported-browser-features': true,
	},
};

export default config;
