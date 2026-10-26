You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## Project State

Starter template: Angular 22, TypeScript 6.0, pnpm 12 (ESM), Vitest 5, Storybook 10, `sass-embedded` for SCSS. Full tooling/script reference is in `README.md`.

- Placeholder names are intentional: package/project `placeholder-project-name`, selector prefix `templ`. The prefix's single source of truth is `angular.json`; `eslint.config.ts` reads it at runtime — never hardcode the prefix in ESLint config.
- Import order (perfectionist): node-module imports first, local imports last, one blank line between groups. `eslint.config.ts` is lint-ignored.
- Verify work with the gates below. Lint must pass with zero errors and zero warnings.

### Gates

| Command | What it checks |
| --- | --- |
| `pnpm build` | Production build (`@angular/build:application`) |
| `pnpm lint` | Type-checked ESLint (flat config, `typescript-eslint` strict + `angular-eslint`) |
| `pnpm test` | Unit tests — Vitest via the `@angular/build:unit-test` builder |
| `pnpm test:storybook` | Story tests — standalone Vitest in **browser mode** (Playwright) via `vitest.config.mts` |
| `pnpm build-storybook` | Static Storybook build |
| `pnpm peers check` | pnpm peer-dependency consistency (must be clean) |

### Tooling Gotchas (learned the hard way)

- **pnpm**: `autoInstallPeers: false` — when adding a package, also add any of its required peers explicitly as devDependencies, then run `pnpm peers check`. `pnpm-workspace.yaml` overrides pin `@angular/animations` to the current Angular version (keep in sync on Angular upgrades) and carry range-limited security bumps for transitive dev tooling (keep `pnpm audit` clean).
- **Storybook**: `dev`/`build`/`test` CLI commands do not exist in SB 10 — dev/build run as Angular targets (`@storybook/angular-vite:start-storybook` / `:build-storybook` in `angular.json`), so `@storybook/cli` is not needed. Story tests run through `vitest.config.mts` (`storybookTest()` + `storybookAngularVitest()` plugins). Only use the `@storybook/angular-vite` framework and import story/preview types (`Meta`, `StoryObj`, `Preview`) from it — the legacy `@storybook/angular` (webpack) framework was removed because its required peer `@angular-devkit/build-angular` (deprecated in Angular 22, unused here) was the only reason that package would be needed; do not re-add either. `@analogjs/vite-plugin-angular` is a required (non-optional) peer of `@storybook/angular-vite` — keep it in devDependencies even though it is never imported directly.
- **Story-test browser**: `vitest.config.mts` sets `launchOptions: { channel: 'msedge' }` (system Edge, no browser download). Stock Playwright Chromium = remove `launchOptions` and run `pnpm exec playwright install chromium`. Non-browser (jsdom/happy-dom) story-test mode is a known broken Storybook bug — keep browser mode.
- **Unit tests**: `pnpm test` runs Vitest in Node with DOM emulation — without a `browsers` option, `@angular/build:unit-test` requires `jsdom` or `happy-dom` to be installed and auto-selects `happy-dom` as the environment. `happy-dom` is never imported directly by project code but is mandatory.
- **Vitest 5**: the runner is bundled into the `vitest` core — the standalone `@vitest/runner` package is not needed (a Vitest-4 leftover).
- **@angular/animations**: deprecated in Angular 22 (npm points to the `animate.enter`/`animate.leave` API) but still a required peer of `@storybook/angular-vite`; keep it pinned to the Angular version in devDependencies and in the workspace override.
- **Angular 22 testing API**: `TestBed.createComponent(Cmp, { bindings: [inputBinding('name', () => value)] })` — the old `{ inputs: {...} }` option no longer exists. `inputBinding` is exported from `@angular/core`.
- **TypeScript 6.0**: `baseUrl` is deprecated (breaks the build). Import aliases are bare `paths` in `tsconfig.json`, relative to that file; standalone Vite tooling (Storybook) needs the alias mirrored via `resolve.alias` / `viteFinal` — see README "Import aliases".
- **SCSS**: use `sass-embedded` (native, preferred by both `@angular/build` and Vite), not `sass`.
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
