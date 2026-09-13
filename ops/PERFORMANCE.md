# Performance

Budgets are per-site. Beyond Memories is a 3D experience and is not judged with the same first-load target as Dametis or Skat Designer.

Recorded 2026-09-13 on Node 22 after the hardening pass.

## Folio (root)

| | |
| --- | --- |
| Stack | Next.js 16, React 19, R3F |
| Source | app + components + lib |
| Production JS (`.next/static`) | 2.2 MB |
| Loading | Canvas is `dynamic(..., { ssr: false })` |
| Strategy | DPR clamped (1.5 mobile / 2 desktop). No duplicate Environment. N8AO + Vignette skipped on mobile and when `prefers-reduced-motion`. Sparkles skipped when reduced motion. |
| Risks | MeshTransmissionMaterial + Stage remain GPU-heavy on low-end laptops. |

## Beyond Memories

| | |
| --- | --- |
| Stack | Webpack 5, Three.js r124 (historical) |
| Dist | 38 MB |
| Models | 18 MB (MAP.gltf still 15 MB / 14.3 MB emitted) |
| Videos | 8.1 MB |
| Audio | 4.6 MB |
| Loading | Critical world assets first, optional audio after `criticalSettled`. HTML intro/outro videos stay in the document. |
| Strategy | Loader never waits forever: timeout 45s, `onError`, optional sounds, Retry UI. Progress is asset-count based, not a fake last-XHR percent. |
| Risks | `require.context` still emits the world into the webpack graph. MAP.gltf was **not** Draco/GLB-converted to avoid shader/loader regressions. |

### Heavy assets (source)

| File | Before | After | Method | Impact |
| --- | --- | --- | --- | --- |
| `src/models/MAP.gltf` | ~15 MB | 15 MB | unchanged | Keep original world geometry |
| `src/textures/video/INTRO.mp4` | 8.28 MB | 6.2 MB | H.264 recompress | Smaller intro download |
| `src/textures/video/OUTRO.mp4` | 8.26 MB | 1.9 MB | H.264 recompress | Smaller outro download |
| `src/sounds/BM_MAIN.ogg` | 4.66 MB | 2.5 MB | Vorbis recompress | Smaller looping music |

## Dametis

| | |
| --- | --- |
| Dist | 704 KB |
| Loading | No remote AI SDK. Prompt API is feature-detected, then user-enabled. |
| Strategy | Conversations in IndexedDB. Send disabled until a session exists. |
| Risks | Chakra + markdown keep the JS chunk around 703 KB. Acceptable for a prototype. |

## Skat Designer

| | |
| --- | --- |
| Dist | 652 KB |
| Loading | Static Vite SPA, hash router |
| Strategy | Devtools imported only in development. Public metadata is small. |
| Risks | Editorial hover animation; disabled under `prefers-reduced-motion`. |

## Three template

| | |
| --- | --- |
| Dist | 4.4 MB (mostly copied Draco decoder files) |
| JS bundle | ~869 KB |
| Strategy | DPR clamped to 2. Empty asset lists still reach `ressourcesReady`. |
| Risks | Draco copies are leftover template weight, not a product homepage. |

## Shared Node 22 notes

Beyond and Three webpack builds set `NODE_OPTIONS=--openssl-legacy-provider` because historical `file-loader` still hashes with MD4. Beyond also pins `postcss@8.4.31` via `overrides` so css-loader 5 can build on Node 22.
