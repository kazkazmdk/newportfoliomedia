# Vercel deploy policy

Penta is one Next.js app (`apps/web`) published as **five Vercel projects**. Each project builds the same root with a different `PENTA_PREVIEW_PRODUCT`. Routine agent work must not deploy all five.

Canonical production path:

```text
local install → lint → typecheck → tests → production build → local QA
→ intentional merge/push to main
→ GitHub Git integration
→ Ignored Build Step
→ at most one Vercel build per actually affected project
```

There is no second production path. GitHub Actions CI does not deploy.

## Projects

| Vercel project | Project ID | App / product | Root directory | Production branch |
| --- | --- | --- | --- | --- |
| `penta-fixcode` | `prj_6fcDJqRN6mk7Y79yBBC6VHcRefYN` | FixCode | repository root (`apps/web`) | `main` |
| `penta-autospec` | `prj_kXCgXqtxYOWVGPUA1gauzPi8ZcHO` | AutoSpec | repository root (`apps/web`) | `main` |
| `penta-wearthere` | `prj_ejTzO7LKXhhv3zBK7GbS6nP22cxC` | WearThere | repository root (`apps/web`) | `main` |
| `penta-chargematch` | `prj_4dCY7nzzDTxLjamgiPSsJKhl1Ne5` | ChargeMatch | repository root (`apps/web`) | `main` |
| `penta-tripcost` | `prj_0pFQTqkBKFSDyWGnjSL1VvDbK9IK` | TripCost | repository root (`apps/web`) | `main` |

All five use:

- install: `pnpm install --frozen-lockfile`
- build: `pnpm --filter web build`
- output: `apps/web/.next`
- env: `PUBLIC_SITE_LIVE=false`, `PENTA_PREVIEW_PRODUCT=<product>`

## Ignored Build Step

Repository command (also in `vercel.json`):

```bash
node scripts/vercel-should-build.mjs
```

Exit codes:

| Exit | Meaning |
| --- | --- |
| `0` | Skip the Vercel build |
| `1` | Continue / build |

The script identifies the current project from `VERCEL_PROJECT_NAME`, `VERCEL_PROJECT_ID`, or `PENTA_PREVIEW_PRODUCT`. It diffs `VERCEL_GIT_PREVIOUS_SHA` → `VERCEL_GIT_COMMIT_SHA`. It does **not** fall back to `HEAD^` or `HEAD~1`.

If those SHAs are missing or not in the clone on `main` / `master` / `release/**`, it **builds** (fail open). It never skips a production release because Git history was incomplete.

Override only when a release is explicitly forced:

```bash
FORCE_VERCEL_BUILD=1
```

## What triggers a build

For project `penta-<product>` on `main` / `master` / `release/**`:

**This product builds** when any of these change:

- `apps/<product>/**`
- `apps/web/src/app/<product>/**`
- `apps/web/src/app/api/<product>/**`
- `data/demand/<product>/**`

**Every product builds** when a consumed shared surface changes:

- `apps/web` shell: layout, hub, globals, legal pages, ops, shared components, `src/lib`, `next.config.ts`, `package.json`, `proxy.ts`
- shared packages actually imported by the web app / engines: `packages/{graph-core,quality-gate,data-provenance,demand,publishing-core,analytics,ui-primitives,ai-core,catalog}`
- `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `vercel.json`
- `scripts/vercel-should-build.mjs`

**No product builds** when only these change:

- `docs/**`, `*.md`, `AGENTS.md`, `README.md`
- `tests/**`, `**/*.test.ts`, `**/*.spec.ts`
- `.github/**`
- `ops/**` (release manifests, not bundled by Next)
- root tooling scripts other than the ignore script
- `playwright.config.ts`, `vitest.config.ts`

A FixCode-only change must not rebuild AutoSpec, WearThere, ChargeMatch, or TripCost.

A `packages/graph-core` change rebuilds all five, because every engine and the web app depend on it.

A `scripts/penta-state.ts` change does not rebuild any Vercel app.

## Agent branches

These prefixes never deploy:

```text
cursor/**
claude/**
codex/**
agent/**
qa/**
design/**
fix/**
```

Any other non-`main` / non-`master` / non-`release/**` branch is also skipped. Vercel is not the QA environment.

`vercel.json` also disables Git deployments for those agent prefixes. Unspecified branches still default to `true` on Vercel’s side; the ignore script is the complete gate.

## Duplicate deployment audit

| Mechanism | Status |
| --- | --- |
| GitHub → Vercel Git integration | **Canonical**. One path. Filtered by the ignore script. |
| `.github/workflows/ci.yml` | Local quality only. Does not call Vercel. |
| `scripts/create-penta-vercel-projects.mjs` | Project configuration helper only. **No longer creates deployments.** |
| `package.json` `vercel:previews` | **Removed.** It used to POST `/v13/deployments`. |
| Deploy Hooks / `VERCEL_DEPLOY_HOOK` | None in the repository. |
| `curl` to `api.vercel.com` from CI | None. |

Do not reintroduce a CI or script deploy for the same Git SHA that Git integration already handles.

## Dashboard settings that this repository cannot finish

`ignoreCommand` in `vercel.json` is the repo-side control. Confirm each of the five projects in the Vercel Dashboard:

1. **Settings → Git → Ignored Build Step**
   - Command: `node scripts/vercel-should-build.mjs`
   - If a dashboard value overrides the repo and differs, set it to the same command.
2. **Settings → Git → Deploy Hooks**
   - Delete any hook. None should exist. A hook would be a second production path.
3. **Preview deployments**
   - Agent branches are skipped by the script. If a future Vercel UI offers “Production only”, enable it. The repo cannot set “only `main`” globally because unspecified `git.deploymentEnabled` keys still default to `true`.
4. Do **not** turn off Git for `main`. Production must still deploy when affected files change.

This document does not claim those Dashboard rows are already saved. They must be checked once per project.

## Local validation (required)

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm qa:visual   # when UI changed
```

Simulate an ignore decision:

```bash
node scripts/vercel-should-build.mjs --product fixcode --branch main --files apps/fixcode/src/data.ts
node scripts/vercel-should-build.mjs --product autospec --branch main --files apps/fixcode/src/data.ts
node scripts/vercel-should-build.mjs --product fixcode --branch cursor/local-qa --files apps/web/src/app/fixcode/page.tsx
```
