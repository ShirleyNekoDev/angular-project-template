# placeholder-project-name

Starter template for Angular 22 applications: pnpm, TypeScript 6, Vitest, and Storybook 10.

## Tooling

| Concern | Tooling |
| --- | --- |
| Framework | Angular 22 (standalone components, signals, OnPush), ES2025 target |
| Language | TypeScript 6.0 — `strict` plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`, `noUncheckedSideEffectImports` |
| Package manager | pnpm 12 (`packageManager` pinned), ESM (`"type": "module"`) |
| Build / dev server | `@angular/build` application + dev-server builders; SCSS via `sass-embedded` |
| Lint | ESLint 10 (flat config) with `typescript-eslint` (strict, type-checked) and `angular-eslint`; component prefix read from `angular.json` |
| Format | Prettier 3 (`.prettierrc.yaml`, enforced as an ESLint rule) |
| Import order | `eslint-plugin-perfectionist` — local imports after node-module imports |
| Unit tests | Vitest 5 via the `@angular/build:unit-test` builder |
| Storybook | Storybook 10 (`@storybook/angular-vite`), run as Angular targets, `eslint-plugin-storybook` for story files |
| Story tests | `@storybook/addon-vitest` — stories run as Vitest tests in a real browser (Playwright) |

## Scripts

| Command | Description |
| --- | --- |
| `pnpm start` | Dev server at `http://localhost:4200` |
| `pnpm build` | Production build to `dist/` |
| `pnpm watch` | Rebuild on change (development configuration) |
| `pnpm lint` | Type-checked ESLint |
| `pnpm test` | Unit tests (Vitest) |
| `pnpm test:storybook` | Story tests (Vitest, browser mode) |
| `pnpm storybook` | Storybook dev server at `http://localhost:6006` |
| `pnpm build-storybook` | Static Storybook build to `storybook-static/` |

`test:storybook` launches a real browser via Playwright. `vitest.config.mts` currently sets
`launchOptions: { channel: 'msedge' }` so it uses the system Edge without downloading a browser.
To use stock Playwright Chromium instead, remove `launchOptions` and run
`pnpm exec playwright install chromium`.

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

  - Storybook tests — `vitest.config.mts`:

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
