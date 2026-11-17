// Stylelint config — the only SCSS/CSS linter in this project.
// `.mjs` is the newest supported config filename (Stylelint dropped `.stylelintrc*`;
// `.mts` is NOT in its supported list, so keep `.mjs`).
// ESLint handles TS and Angular templates, Prettier handles formatting, Stylelint
// handles actual Sass/CSS linting.

/** @type {import('stylelint').Config} */
export default {
	extends: [
		// Standard ruleset tuned for Sass: SCSS syntax validation, invalid property
		// detection, duplicate property/selector detection, modern Sass syntax checks
		'stylelint-config-standard-scss',
		// Property ordering: Recess (BEM-ish) order for declarations and at-rules
		'stylelint-config-recess-order',
	],
	rules: {
		// Allow any class naming scheme (Angular BEM-ish selectors like
		// `templ-foo__bar--active` would fail the default kebab-case pattern)
		'selector-class-pattern': null,
		// Allow descending specificity — it is frequently intentional in component styles
		'no-descending-specificity': null,
		// Allow any `$variable` naming convention
		'scss/dollar-variable-pattern': null,

		// Nesting validation: cap nesting depth (keep selectors short and predictable)
		'max-nesting-depth': 8,
		// Cap the number of compound selectors (`.a.b.c`) a single selector may contain
		'selector-max-compound-selectors': 6,

		// Flag a `$variable` declared twice in the same scope
		'scss/no-duplicate-dollar-variables': true,
		// Flag a mixin defined twice
		'scss/no-duplicate-mixins': true,

		// `@use 'partial'` / `@forward 'partial'`, not with a leading underscore or extension
		'scss/load-no-partial-leading-underscore': true,
		// Ban @import entirely — use the modern `@use`/`@forward` module system
		'at-rule-disallowed-list': ['import'],

		// No ID selectors — they are too specific for component-encapsulated styles
		'selector-max-id': 0,
		// Require hex/rgb() colors; named colors are ambiguous and hard to theme
		'color-named': 'never',
	},
};
