You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## Project State

Starter template: Angular 22, TypeScript 6.0, pnpm 12 (ESM), Vitest 5, Storybook 10, `sass-embedded` for SCSS, **zoneless** (`provideZonelessChangeDetection()` in `app.config.ts`, no `zone.js` in the dependency graph). Full tooling/script reference is in `README.md`.

- Placeholder names are intentional: package/project `placeholder-project-name`, selector prefix `templ`. The prefix's single source of truth is `angular.json`; `eslint.config.ts` reads it at runtime — never hardcode the prefix in ESLint config.
- Import order (perfectionist): node-module imports first, local imports last, one blank line between groups. `eslint.config.ts` is lint-ignored.
- Verify work with the gates below. Lint must pass with zero errors and zero warnings.

### Gates

| Command                | What it checks                                                                                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm build`           | Production build (`@angular/build:application`)                                                                                                                           |
| `pnpm lint`            | Type-checked ESLint (flat config, `typescript-eslint` strict + `angular-eslint`), then Stylelint over `src/**/*.{css,scss}`, then markdownlint-cli2 over every `.md` file |
| `pnpm lint:dist`       | doiuse browser-feature check over compiled `dist/**/*.css` (needs a fresh `pnpm build` first)                                                                             |
| `pnpm format:check`    | Prettier formatting of the whole repo (must pass without changes)                                                                                                         |
| `pnpm test`            | Unit tests — Vitest via the `@angular/build:unit-test` builder                                                                                                            |
| `pnpm test:storybook`  | Story tests — standalone Vitest in **browser mode** (Playwright) via `vitest.config.ts`                                                                                   |
| `pnpm build-storybook` | Static Storybook build                                                                                                                                                    |
| `pnpm peers check`     | pnpm peer-dependency consistency (must be clean)                                                                                                                          |
| `pnpm audit`           | Security audit — known vulnerabilities in the dependency tree (must be clean)                                                                                             |

### Tooling Gotchas (learned the hard way)

- **pnpm**: `autoInstallPeers: false` — when adding a package, also add any of its required peers explicitly as devDependencies, then run `pnpm peers check`. `pnpm-workspace.yaml` overrides pin `@angular/animations` to the current Angular version (keep in sync on Angular upgrades), pin `@napi-rs/wasm-runtime` to `1.2.5` (1.2.7 — pulled via `@angular/build` → oxc-parser 0.156.0's wasm32-wasi binding — declares an `@emnapi` peer range that rejects the `2.0.0-alpha.6` that binding itself ships, failing `peers check`; 1.2.5's range accepts every `@emnapi` version in the tree, and the wasm binding is never loaded on a native platform), carry range-limited security bumps for transitive dev tooling (keep `pnpm audit` clean), and forbid `zone.js` (`zone.js: '-'`) — the app is zoneless, and any transitive resolution of `zone.js` (e.g. optional peers of `@angular/core`) breaks `@angular/build:unit-test`, see the unit-test gotcha below.
- **Storybook**: `dev`/`build`/`test` CLI commands do not exist in SB 10 — dev/build run as Angular targets (`@storybook/angular-vite:start-storybook` / `:build-storybook` in `angular.json`), so `@storybook/cli` is not needed. Story tests run through `vitest.config.ts` (`storybookTest()` + `storybookAngularVitest()` plugins). Only use the `@storybook/angular-vite` framework and import story/preview types (`Meta`, `StoryObj`, `Preview`) from it — the legacy `@storybook/angular` (webpack) framework was removed because its required peer `@angular-devkit/build-angular` (deprecated in Angular 22, unused here) was the only reason that package would be needed; do not re-add either. `@analogjs/vite-plugin-angular` is a required (non-optional) peer of `@storybook/angular-vite` — keep it in devDependencies even though it is never imported directly.
- **Story-test browser**: `vitest.config.ts` runs story tests in **both Chromium and Firefox** (`browser.instances: [{ browser: 'chromium' }, { browser: 'firefox' }]`), so the matching Playwright browser binaries must already be installed — run `pnpm exec playwright install chromium firefox` first (they are not downloaded automatically and are not committed). Non-browser (jsdom/happy-dom) story-test mode is a known broken Storybook bug — keep browser mode. Specifics: storybookjs/storybook#32444 (S2, open as of Oct 2026) — reproduced on SB 10.6.3 + Vitest 5.0.5 + Angular 22 zoneless: every story suite fails at init with `Error: This object can't be observed.` thrown from `deepsignal` (Storybook's bundled reactive store) in `storybook/dist/preview/runtime.js`. The v9 root cause (unconditional static `@vitest/browser/context` import in `vitest-plugin/test-utils.ts`) is softened in the v10 dist (dynamic import with `.catch()`; the browser setup file is only injected when `browser.enabled === true`), but the non-browser runtime path still does not work.
- **Unit tests**: `pnpm test` runs Vitest in Node with DOM emulation — without a `browsers` option, `@angular/build:unit-test` requires `jsdom` or `happy-dom` to be installed and auto-selects `happy-dom` as the environment. `happy-dom` is never imported directly by project code but is mandatory. The builder picks its Zone.js testing strategy by resolving `zone.js` from the project; the `zone.js: '-'` override keeps that resolution failing so the generated TestBed init has no zone import and tests run zoneless. Without it, pnpm's hidden hoist (`node_modules/.pnpm/node_modules`) still contains `zone.js` via transitive optional peers, the builder emits a guarded `import('zone.js/testing')` that Vite cannot resolve, and every suite fails (angular/angular-cli#33435).
- **Vitest 5**: the runner is bundled into the `vitest` core — the standalone `@vitest/runner` package is not needed (a Vitest-4 leftover).
- **SBOM**: use the `create-sbom` script (wraps the built-in `pnpm sbom`, CycloneDX JSON output) — no third-party generator package is needed (e.g. `@cyclonedx/cyclonedx-npm` cannot read `pnpm-lock.yaml`). `pnpm audit` (the `audit` script) is the security check: it covers the same dependency set the SBOM describes (same lockfile), queried against the npm registry's advisory database. If `grype` or `trivy` is installed locally, it may be used in combination with the `create-sbom` task to scan the generated SBOM.
- **Coverage ignore comments**: do NOT use `/* v8 ignore file */` (or istanbul variants) to exclude whole files — `@vitest/coverage-v8` checks the file hint against the first line of the _compiled_ code, not the source, so it only works if the comment survives TS compilation, which depends on which syntax node the comment is attached to. Reproduced here: the identical comment excluded `app.config.ts` but not `app.routes.ts` in the story-test pipeline (its comment is erased with the type-only import it prefixes; verified with esbuild), while both were excluded in the unit-test pipeline. Use the config-based exclusions instead (`coverageExclude` in `angular.json`, `coverage.exclude` in `vitest.config.ts`). Note Vitest 5's default coverage excludes are empty, so every exclusion must be stated explicitly.
- **@angular/animations**: deprecated in Angular 22 (npm points to the `animate.enter`/`animate.leave` API) but still a required peer of `@storybook/angular-vite`; keep it pinned to the Angular version in devDependencies and in the workspace override.
- **Angular 22 testing API**: `TestBed.createComponent(Cmp, { bindings: [inputBinding('name', () => value)] })` — the old `{ inputs: {...} }` option no longer exists. `inputBinding` is exported from `@angular/core`.
- **TypeScript 6.0**: `baseUrl` is deprecated (breaks the build). Import aliases are bare `paths` in `tsconfig.json`, relative to that file; standalone Vite tooling (Storybook) needs the alias mirrored via `resolve.alias` / `viteFinal` — see README "Import aliases".
- **SCSS**: use `sass-embedded` (native, preferred by both `@angular/build` and Vite), not `sass`.
- **Stylelint**: on v18. Both CSS and SCSS are linted (`src/**/*.{css,scss}`). **Plain CSS is preferred** — `.scss` is only for real Sass (variables, mixins, interpolation, control flow, @use modules); the local rule `local/prefer-css-over-featureless-scss` (implementation in `tools/stylelint-prefer-css.ts`, a homegrown Stylelint plugin loaded via the config's `plugins` array) fails featureless `.scss` files, and it is a heuristic that deliberately allows false negatives — do not "improve" it into flagging native CSS nesting or `&`. `@import` is banned in SCSS only (standard in CSS); the ban and the local rule live in the config's `overrides` for `**/*.scss`. Build pipeline: only SCSS goes through `sass-embedded`; plain CSS skips the Sass compiler, and both are bundled + minified by esbuild's CSS minifier — `@angular/build` has no Lightning CSS option (Vite's `css.minify: 'lightningcss'` would only affect Storybook). Config is `stylelint.config.ts`: Stylelint 18 loads TS configs via Node's built-in type stripping — erasable syntax only (no `enum`/`namespace`/parameter properties, `import type` for type-only imports), Node >= 22.18. The auto-discovered filename is `stylelint.config.ts` (cosmiconfig's search list) — `stylelint.config.mts` is NOT auto-discovered, do not rename it. Recess property ordering is inlined as `order/properties-order` (`stylelint-order`) because `stylelint-config-recess-order` (latest 7.10.0) declares only `^16.18 || ^17` as peer — if it ever ships 18 support, replace the inlined list with the preset's `extends`. `stylelint-order` is an explicit devDependency (`autoInstallPeers: false`) and already declares `^18`. In stylelint-scss 7, `scss/at-import-no-partial-leading-underscore` was renamed to `scss/load-no-partial-leading-underscore`; banning `@import` itself is done via `at-rule-disallowed-list: ['import']`. The doiuse browser-feature rule only parses standard CSS, so it runs on the compiled build output: `pnpm lint:dist` lints `dist/**/*.css` with the separate `stylelint.dist.config.ts` (source-oriented standard rules are deliberately not applied to minified output); `dist` must NOT go into `.stylelintignore` while that gate exists. `unrs-resolver` (optional peer of eslint-plugin-import-x's `eslint-import-context`) needs its build script in `allowBuilds` to lay down its native bindings.
- **Markdown**: `markdownlint-cli2` (config `.markdownlint-cli2.jsonc`, auto-discovered) lints every `.md` file as part of `pnpm lint`. Rules that fight Prettier are disabled there (MD013 line length, MD010 hard tabs — the project indents with tabs, MD055/56/57 table cell formatting), as is MD041 (leading H1 — AGENTS.md and working notes are not documents). Keep new rule choices consistent with Prettier when editing the config.
- **Windows/PowerShell**: pnpm writes its banner to stderr, which PowerShell surfaces as `NativeCommandError` — judge success by `$LASTEXITCODE` and the actual output, not the stderr noise.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Omit `changeDetection` — `OnPush` is the default since Angular 22 (`Default` is now deprecated `Eager`); never opt out to `Eager`
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection
