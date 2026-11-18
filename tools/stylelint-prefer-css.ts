// Local Stylelint plugin — enforces the project convention: prefer plain `.css`
// over `.scss` when no Sass feature is actually used.
//
// Plain CSS is lighter (no Sass compile step in the build) and modern CSS
// (custom properties, native nesting, :has(), color-mix(), @scope, ...) covers
// most styling needs. `.scss` is for when you actually need Sass: variables,
// mixins, interpolation, control flow, or the @use/@forward module system.
//
// Sass syntax detection is intentionally heuristic and errs on the side of NOT
// flagging (false negatives keep the rule safe):
// - detected: `$variable` declarations, `$reference`/`#{interpolation}`/
//   `:extend()` in values, selectors, and at-rule parameters; Sass at-rules
//   (@mixin @include @function @use @forward @if @else @for @each @while
//   @error @warn @debug @at-root @nest @extend); `!default`/`!global`/
//   `!optional` flags (they only ever appear on `$` declarations / @use, which
//   are caught above).
// - NOT detected (accepted): Sass operators in values (`width: 100% - 16px`),
//   Sass-only function calls without variables (`darken(...)`), maps.
// - Nesting and `&` are NOT treated as Sass features — native CSS nesting is
//   supported by the project's browser targets and is a legitimate reason to
//   stay in (or move to) plain CSS.
//
// Loaded by Stylelint 18 via Node's type stripping: erasable TS syntax only.
// Deliberately has no imports beyond `stylelint` itself: the file is not part
// of any tsconfig program, so structural types are used instead of postcss's.
// Lives in tools/ with the other non-source tooling implementations.

import stylelint from 'stylelint';

const ruleName = 'local/prefer-css-over-featureless-scss';

const sassAtRules = new Set([
	'mixin',
	'include',
	'function',
	'use',
	'forward',
	'if',
	'else',
	'for',
	'each',
	'while',
	'error',
	'warn',
	'debug',
	'at-root',
	'nest',
	'extend',
]);

// Structural subset of a PostCSS node / Root — see file comment.
type SassSyntaxNode = {
	type: string;
	prop?: string;
	value?: string;
	selector?: string;
	params?: string;
	name?: string;
};
type SassSyntaxRoot = {
	walk: (callback: (node: SassSyntaxNode) => boolean | void) => void;
};

function containsSassSyntax(source: string | undefined): boolean {
	return source !== undefined && (source.includes('$') || source.includes('#{') || source.includes(':extend('));
}

function hasSassFeatures(root: SassSyntaxRoot): boolean {
	let found = false;

	// `false` from the callback stops the walk — bail out on the first hit.
	root.walk((node) => {
		switch (node.type) {
			case 'decl':
				found = found || (node.prop ?? '').startsWith('$') || containsSassSyntax(node.value);
				break;
			case 'rule':
				found = found || containsSassSyntax(node.selector);
				break;
			case 'atrule':
				found = found || sassAtRules.has(node.name) || containsSassSyntax(node.params);
				break;
		}

		return !found;
	});

	return found;
}

// Enabled only for **/*.scss via the config's `overrides` block — plain CSS
// files can never trip it.
const rule = stylelint.createPlugin(ruleName, (_primary) => (root, result) => {
	if (!hasSassFeatures(root)) {
		stylelint.utils.report({
			message: 'This file does not use any Sass features; use a .css file instead.',
			node: root,
			result,
			ruleName,
		});
	}
});

export default rule;
