# placeholder-project-name

Starter template for Angular 22 applications: pnpm, TypeScript 6, Vitest, and Storybook 10.

## Tooling

| Concern            | Tooling                                                                                                                                                                                                                                                                                                  |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework          | Angular 22 (standalone components, signals, OnPush), ES2025 target                                                                                                                                                                                                                                       |
| Language           | TypeScript 6.0 — `strict` plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`, `noUncheckedSideEffectImports`                                                                                                                                                          |
| Package manager    | pnpm 12 (`packageManager` pinned), ESM (`"type": "module"`)                                                                                                                                                                                                                                              |
| Build / dev server | `@angular/build` application + dev-server builders; SCSS via `sass-embedded`                                                                                                                                                                                                                             |
| Lint               | ESLint 10 (flat config) with `typescript-eslint` (strict, type-checked) and `angular-eslint` (TS + Angular templates, incl. inline templates); component prefix read from `angular.json`                                                                                                                 |
| Style lint         | Stylelint 18 (`stylelint-config-standard-scss` + `stylelint-order` with Recess property order, TS config) for all CSS and SCSS; plain CSS is preferred over Sass (enforced by a local rule); doiuse browser-feature check on compiled `dist/` CSS via `pnpm lint:dist` (browsers from `.browserslistrc`) |
| Format             | Prettier 3 (`.prettierrc.yaml`, enforced as an ESLint rule for TS, plus `pnpm format` / `pnpm format:check` for the rest)                                                                                                                                                                                |
| Markdown lint      | `markdownlint-cli2` over every `.md` file (`.markdownlint-cli2.jsonc`; rules that fight Prettier are disabled)                                                                                                                                                                                           |
| Import order       | `eslint-plugin-perfectionist` — local imports after node-module imports                                                                                                                                                                                                                                  |
| Unit tests         | Vitest 5 via the `@angular/build:unit-test` builder                                                                                                                                                                                                                                                      |
| Storybook          | Storybook 10 (`@storybook/angular-vite`), run as Angular targets, `eslint-plugin-storybook` for story files                                                                                                                                                                                              |
| Story tests        | `@storybook/addon-vitest` — stories run as Vitest tests in a real browser (Playwright)                                                                                                                                                                                                                   |
| SBOM               | `pnpm create-sbom` (built-in `pnpm sbom`) — CycloneDX JSON to `sbom/`                                                                                                                                                                                                                                    |
| Security audit     | `pnpm audit` — npm registry advisory database                                                                                                                                                                                                                                                            |

## Scripts

| Command                        | Description                                                                            |
| ------------------------------ | -------------------------------------------------------------------------------------- |
| `pnpm start`                   | Dev server at `http://localhost:4200`                                                  |
| `pnpm build`                   | Production build to `dist/`                                                            |
| `pnpm watch`                   | Rebuild on change (development configuration)                                          |
| `pnpm lint`                    | Type-checked ESLint, then Stylelint over `src/**/*.{css,scss}`, then markdownlint-cli2 |
| `pnpm lint:fix`                | Auto-fix ESLint, Stylelint, and markdownlint-cli2                                      |
| `pnpm lint:dist`               | doiuse browser-feature check over the compiled CSS in `dist/` (run after `pnpm build`) |
| `pnpm format`                  | Prettier over the whole repo (`--write`)                                               |
| `pnpm format:check`            | Prettier check without writing (`--check`)                                             |
| `pnpm test`                    | Unit tests (Vitest)                                                                    |
| `pnpm test:coverage`           | Unit tests with coverage (report → `coverage/placeholder-project-name/`)               |
| `pnpm test:storybook`          | Story tests (Vitest, browser mode)                                                     |
| `pnpm test:storybook:coverage` | Story tests with coverage (report → `coverage/storybook/`)                             |
| `pnpm coverage`                | Both coverage runs above                                                               |
| `pnpm storybook`               | Storybook dev server at `http://localhost:6006`                                        |
| `pnpm build-storybook`         | Static Storybook build to `storybook-static/`                                          |
| `pnpm create-sbom`             | CycloneDX SBOM to `sbom/<name>-<version>.cdx.json`                                     |
| `pnpm audit`                   | Security audit against the npm advisory database                                       |

`test:storybook` launches real browsers via Playwright (Chromium and Firefox, headless).
Before running story tests, install the browser binaries once:

```bash
pnpm exec playwright install chromium firefox
```

## Stylelint

SCSS/CSS linting is Stylelint's job — ESLint handles TS and Angular templates, Prettier handles
formatting (Stylelint and Prettier can disagree on ordering; Stylelint's property-order rule wins
for CSS/SCSS, Prettier only formats).

- Both `src/**/*.css` and `src/**/*.scss` are linted. **Plain CSS is preferred** — use `.scss`
  only when you actually need Sass (variables, mixins, interpolation, control flow,
  @use/@forward modules). This is enforced by the local rule
  `local/prefer-css-over-featureless-scss` (implementation in `tools/stylelint-prefer-css.ts`),
  which fails `.scss` files that use no Sass features. Inline component styles
  (`inlineStyleLanguage` in `angular.json`) default to `css`; switch it to `scss`
  project-wide if inline Sass is ever needed.
- How the build handles the two: `.scss`/`.sass` files are compiled by `sass-embedded` first;
  plain `.css` files skip the Sass compiler entirely. Both end up in the same esbuild CSS
  bundle, which also does the production CSS minification (`minify` in
  `bundle-options.js`) — `@angular/build` has no Lightning CSS option. (Vite does support
  `css.minify: 'lightningcss'`, but that would only affect Storybook output.)
- `@import` is banned in SCSS (use `@use`/`@forward`) but allowed in plain CSS, where it is the
  standard import mechanism.
- Config lives in `stylelint.config.ts` — Stylelint 18 loads TypeScript configs via Node's
  built-in type stripping (erasable syntax only: no `enum`/`namespace`, `import type` for
  type-only imports; needs Node >= 22.18). The auto-discovered filename is `stylelint.config.ts`
  — `.mts` is NOT in cosmiconfig's discovery list, so `.ts` is the choice here (the package is
  ESM via `"type": "module"`, so `.ts` is ESM).
- Property ordering (Recess order) is inlined in the config via `order/properties-order`
  (`stylelint-order`) because `stylelint-config-recess-order` has no Stylelint-18-compatible
  release yet.
- Ignored paths are in `.stylelintignore` (`coverage`, `node_modules`, `storybook-static`).
- The browser-support rule (`plugin/no-unsupported-browser-features`, doiuse + caniuse, browsers
  from `.browserslistrc`) only understands standard CSS, so it runs on the compiled output:
  `pnpm lint:dist` checks `dist/**/*.css` with the separate `stylelint.dist.config.ts`
  (after `pnpm build`).
- `@angular/build` always prefers `sass-embedded` (`useSassEmbedded`, overridable only via the
  `NG_BUILD_SASS_EMBEDDED` environment variable) — there is no `sass.implementation` option for
  the application builder; just install the package.

## Coverage

Both suites report with the `v8` provider (`@vitest/coverage-v8`): unit tests run in Node (a V8
runtime), and story tests run in both Chromium and Firefox (headless). The V8 coverage provider
collects from the Chromium instance (via CDP); Firefox instances execute the tests but do not
contribute coverage data.

- `pnpm test:coverage` — `@angular/build:unit-test` with its native `coverage` options
  (`angular.json` `coverage` configuration); report written to `coverage/placeholder-project-name/`.
- `pnpm test:storybook:coverage` — `vitest run --coverage`; the coverage options live in
  `vitest.config.ts` and the report is written to `coverage/storybook/`.

Both scope the report to `src/app/**/*.ts` and explicitly exclude test scaffolding
(`*.spec.ts`, `*.stories.ts`) and bootstrap wiring (`app.config.ts`, `app.routes.ts`) — Vitest 5's
default coverage excludes are empty, so the exclusions must be stated. They are defined once in the
`coverage` configuration of the `test` target in `angular.json`; `vitest.config.ts` reads
`coverageInclude`/`coverageExclude`/`coverageReporters` from there at load time. The `provider` and
`reportsDirectory` stay in the Vitest config, and story-test coverage remains gated on the
`--coverage` CLI flag. Reports (`html`, `lcov`, `text`, `text-summary`) land under `coverage/`,
which is gitignored.

## Import aliases

Aliases are plain TypeScript path mappings. In `tsconfig.json`:

```json
"compilerOptions": {
  "paths": {
    "@templ/*": ["./src/*"]
  }
}
```

- Do not add `baseUrl` — it is deprecated in TypeScript 6.0. Without it, `paths` entries resolve relative to `tsconfig.json`.
- `ng build`, `ng serve`, `ng test`, and type-checked ESLint honor it out of the box.
- Standalone Vite tooling (Storybook) does not read tsconfig paths, so mirror the alias there:

  - Storybook tests — `vitest.config.ts`:

    ```ts
    import { fileURLToPath } from 'node:url';

    export default defineConfig({
    	resolve: {
    		alias: { '@templ': fileURLToPath(new URL('./src', import.meta.url)) },
    	},
    });
    ```

  - Storybook build — `viteFinal` in `.storybook/main.ts`:

    ```ts
    async viteFinal(config) {
      return {
        ...config,
        resolve: {
          ...config.resolve,
          alias: { '@templ': fileURLToPath(new URL('../src', import.meta.url)) },
        },
      };
    },
    ```
