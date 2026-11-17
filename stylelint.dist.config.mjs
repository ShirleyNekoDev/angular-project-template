// Stylelint config for production build output (`dist/**/*.css`) — plain compiled CSS only.
// doiuse cannot parse SCSS, so browser-feature checks run on the compiled output, after
// `pnpm build`. Run with `pnpm lint:dist`.
// Kept separate from `stylelint.config.mjs` so the source-oriented standard/recess rules
// do not run against generated, minified CSS.

/** @type {import('stylelint').Config} */
export default {
	plugins: [
		// Browser-support checks via doiuse + caniuse; browsers are read from .browserslistrc
		'stylelint-no-unsupported-browser-features',
	],
	rules: {
		// Fail on CSS features the .browserslistrc targets do not support
		'plugin/no-unsupported-browser-features': true,
	},
};
