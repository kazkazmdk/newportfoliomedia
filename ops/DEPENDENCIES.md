# Dependencies

No blanket upgrades. Historical Three.js stays on r124 (Beyond) and r134 (template).

## A. CURRENT / HEALTHY

- Root folio: Next 16.3.5, React 19.2, R3F 9 / drei 10
- Dametis: Vite 6, React 19, TypeScript 5.8

## B. OLD BUT STABLE

- Beyond Memories: Webpack 5.16, Three 0.124, css-loader 5, html-loader 1
- Three template: Webpack 5.61, Three 0.134
- Skat Designer: Vite 4, React 18, ESLint 8

## C. DEPRECATED

- `babel-eslint` (Beyond / Three) — replaced upstream by `@babel/eslint-parser`. Not migrated here.
- `file-loader` MD4 hashing → OpenSSL legacy flag on Node 17+
- Skat `react-helmet` (v6) — still works; no domain to justify a helmet-async rewrite

## D. SECURITY UPDATE REQUIRED

npm audit reports many findings in the historical webpack trees (71 on Beyond, 57 historically on Three). They are mostly webpack/loader/dev-server issues.

Not auto-fixed: an `npm audit fix --force` would pull Three.js and Webpack majors.

Dametis/Skat also report high/critical advisories in the Vite 4 / axios / older eslint tooling. Review before a later dedicated security pass.

## E. MIGRATION REQUIRED LATER

- Beyond / Three: Three.js r15x would need a dedicated rendering QA (loaders, sRGB, shaders, postprocessing).
- Skat: ESLint 9 flat config (currently forced to eslintrc via `ESLINT_USE_FLAT_CONFIG=false` so the root Next config is not inherited).
- Dametis: Prompt API types will keep moving with Chromium.

## Node / CI compatibility already applied

- `NODE_OPTIONS=--openssl-legacy-provider` on Beyond and Three scripts and CI jobs
- Beyond `overrides.postcss = 8.4.31` for Node 22 `package.json` exports
- Skat lockfile is now committed; `prepare`/Husky removed so nested install works
