# Baseline audit

Recorded on 2026-09-13 from `cursor/lissandre-portfolio-origin-01ee` @ `3b6300801dfffa169632603b5844d95f3dacedaa`.

Node `v22.14.0`. Checks run as-is, without `|| true`.

| Project | Install | Typecheck | Lint | Build | Tests | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Folio (root) | PASS (`node_modules` already present) | FAIL | FAIL | FAIL | none | Root `tsconfig` / ESLint include `sites/**`. Next typecheck fails on Skatdesigner files. Lint reports 64 issues from nested webpack sources. |
| Beyond Memories | PASS (`npm install`, 72 vulns reported) | n/a (JS) | FAIL (219 Prettier errors) | FAIL | `npm test` exits 1 (`no test specified`) | Webpack 5 + `file-loader` hash uses OpenSSL MD4. Node 22: `error:0308010C:digital envelope routines::unsupported`. Loader has no `onError`. `this.introVideo.currenTime` typo. |
| Dametis | PASS (`npm ci`) | PASS (via `tsc -b`) | PASS | PASS (`dist` 704K) | none | Prompt API called without feature detection. Session created on mount. Download progress is `console.log`. Starter title/favicon. `/:id` unused. |
| Skatdesigner | FAIL | PASS* | FAIL | PASS* (`dist` 592K) | none | No lockfile. `prepare` / `husky install` fails (git root is the monorepo). Lint uses `--ext` against ESLint 9 from the parent tree. Typecheck/build ran on a partial install. Starter metadata, fake `href=""`, `user-scalable=0`, React Query Devtools in prod, unused Next.js boilerplate about page. |
| Three template | PASS (`npm ci`, 57 vulns reported) | n/a (JS) | FAIL (28 Prettier errors) | FAIL | `npm test` exits 1 | Same OpenSSL / `file-loader` failure as Beyond. Loader has no `onError`. `document.body.innerHTML +=`. No `destroy()`. Unclamped DPR. |

\*Skatdesigner typecheck/build are not a reliable baseline until install succeeds without Husky.

## Root coupling

- `tsconfig.json` `include: ["**/*.ts", "**/*.tsx"]` pulls every site into the Next.js typecheck.
- `eslint.config.mjs` does not ignore `sites/`.

## Security / privacy (scan)

- No committed `.env` or API keys found in source.
- Skatdesigner `target="_blank"` on boilerplate about page (dead code).
- Folio GitHub/LinkedIn links already use `rel="noopener noreferrer"`.
- Historical webpack projects report many npm audit findings; not auto-upgraded (Three.js 0.124 / 0.134).
