# Platform architecture

Local monetization prototype → secure multi-tenant foundation.

The five product engines (FixCode, AutoSpec, ChargeMatch, TripCost, WearThere) are unchanged. This layer sits beside them.

```
User / Developer
    → Auth (local_dev | bearer API key)
    → Organization + Membership + Role
    → API Key / Widget Installation
    → Gateway (requireProductKey, origin, request_id)
    → Entitlement / Quota / Rate limit
    → Product Engine (provenance intact)
    → Events + Request logs
    → Data store (PlatformRepository)
    → Analytics (null until measured)
    → Revenue ledger (empty in production)
```

## Packages

| Package | Role |
| --- | --- |
| `@penta/platform-api` | Keys, scopes, auth guards, errors, quota, rate limiter, billing noop, contract |
| `@penta/platform-data` | Repository, schema, memory / file-dev / postgres factory, widgets, retention |
| `@penta/monetization` | Intent v2, orchestrator, routing, observations, revenue, licensing models |
| `apps/web` | v1 routes, `/platform` dashboard, product B2B surfaces, widgets |

## Persistence

```
PlatformRepository
  → PostgresRepository     DATABASE_URL (schema ready, driver not wired)
  → MemoryRepository       PENTA_PLATFORM_MEMORY=1
  → FileFallbackRepository DEV ONLY (data/platform/store.json)
```

Callers use `repo()` from `apps/web/src/lib/platform-store.ts`. No product route opens the JSON file.

## Tenancy

Organization owns keys, widgets, entitlements, usage.

A key is `(org, site, environment, scopes)`. Site isolation is enforced before the engine runs.

## Monetization surfaces

`resolveMonetizationSurface(context)` returns only surfaces that exist:

- official outbound if a sourced URL is on file
- affiliate offer only if a **live** offer exists
- lead CTA as UNASSIGNED when no active partner exists
- B2B CTA on operator pages
- never an empty generic commerce card

## SEO boundary

Truth Gates and `index-recompute.ts` do not import monetization, platform-data, revenue, affiliate, or partner state.

## Deploy policy

GitHub sync is allowed. Vercel Git deployments stay off. No `vercel deploy`. `PUBLIC_SITE_LIVE=false`.
