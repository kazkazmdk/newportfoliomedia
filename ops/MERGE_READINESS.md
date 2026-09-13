# Merge Readiness

## Branch

`cursor/lissandre-portfolio-origin-01ee`

## Head

Recorded after the hardening pass. See the PR for the current SHA.

## Projects

### Folio

Build: PASS (`next build`)
Lint: PASS (`eslint app components lib --max-warnings=0`)
Tests: PASS (Vitest media query + metadata)
Known debt: the page is still an under-construction vitrine; GPU scene remains desktop-oriented.

### Beyond Memories

Build: PASS (Webpack 5 + OpenSSL legacy + postcss override)
Lint: PASS (Prettier issues are warnings, not errors)
Tests: PASS (load tracker, intro `currentTime`, optional failure)
Known debt: MAP.gltf still ~15 MB; webpack `require.context` still ships the world in one graph; many historical npm audit findings.

### Dametis

Build: PASS (`tsc --noEmit && vite build`, dist 704K)
Lint: PASS
Tests: PASS (capability mapping, send gating, persistence helpers, streaming append)
Known debt: live Prompt API still needs Chrome; IndexedDB not exercised in Node tests (memory store is).

### Skatdesigner

Build: PASS (Vite 4, dist 652K)
Typecheck: PASS
Lint: PASS (`ESLINT_USE_FLAT_CONFIG=false` so nested ESLint 8 is used)
Tests: PASS (links, routes, metadata)
Known debt: Store remains a non-link struck-through label; no public social URLs existed in the repo so they were removed rather than invented.

### Three Template

Build: PASS (Webpack 5 + OpenSSL legacy)
Lint: PASS (Prettier warnings only)
Tests: PASS (loader tracker, DPR clamp, DOM mount)
Known debt: template ships Draco decoder copies (~3 MB); no default suzanne model in this checkout.

## P0 remaining

None known after local checks. CI must still be green on GitHub Actions.

## P1 remaining

- MAP.gltf compression / GLB+Draco after a dedicated 3D QA
- Historical npm audit on webpack trees
- Beyond webpack still eager-emits world assets (runtime phases only delay audio fetch start, not the JS graph)
- Dametis Chakra bundle size

## P2 remaining

- babel-eslint → @babel/eslint-parser
- Skat ESLint 9 native flat config
- Optional Helmet async migration
- Preview hosting / real domain canonicals (none invented)

## Security

- No committed `.env` or API keys found
- External links use `rel="noopener noreferrer"` where `target="_blank"` is used
- Dametis has no remote model endpoint
- See `ops/DEPENDENCIES.md` for audit posture

## Performance

See `ops/PERFORMANCE.md`. Beyond remains a large 3D experience by design.

## CI

`.github/workflows/ci.yml` — independent jobs: folio, beyond, dametis, skatdesigner, three-template.

## Recommendation

`SAFE_TO_MERGE = YES`

All expected local builds, lints, and tests passed. Loaders can fail closed with Retry. Dametis no longer calls `LanguageModel` without feature detection or a user Enable step. Skat has no empty `href=""`. Do not merge automatically from this agent; a human should confirm GitHub Actions is green.
