# Monetization readiness v2

`PUBLIC_SITE_LIVE` remains `false`. This pass is a **secure multi-tenant foundation**, not a public launch.

Winner ranking is `internal_opportunity_only`. It is not an indexation input.

No invented partners, merchants, prices, conversion rates, or coverage percentages.

## Capability scores

Values are `READY` | `DEV_READY` | `BLOCKED_EXTERNAL` | `NOT_IMPLEMENTED`.

| Capability | Status | Notes |
| --- | --- | --- |
| AUTH | DEV_READY | Local actor (`X-Penta-Dev-Actor` / non-prod). No external IdP. |
| TENANCY | DEV_READY | Organization, user, membership, roles OWNER→VIEWER. |
| API | DEV_READY | `requireProductKey` binds bearer + scope + site + optional org/env. |
| WIDGET | DEV_READY | Installation id, origin allowlist, branded/unbranded entitlement, `/widgets/v1/{site}.js`. |
| LEADS | DEV_READY | Consent, honeypot, retention, routing. Zero partners → UNASSIGNED. |
| COMMERCE | NOT_IMPLEMENTED | Merchant/offer schema exists. Inventory stays empty. |
| AFFILIATE | NOT_IMPLEMENTED | Programs/links modelled. `affiliate_click` is `offer_unavailable`. |
| BILLING | NOT_IMPLEMENTED | `BillingProvider` + `NoopBillingProvider`. No Stripe. Plans are contact-sales. |
| DATA | DEV_READY | Observations have RECEIVED→MERGED_AS_SIGNAL. MERGED is not OFFICIAL. |
| LICENSING | NOT_IMPLEMENTED | Dataset / export models only. Export blocked without a license. |
| ANALYTICS | DEV_READY | Structured events + request logs. Business metric catalog has **null** values. |
| SECURITY | DEV_READY | See `SECURITY_READINESS.md`. Not production-hardened. |

`READY` is unused: hosted identity, durable Postgres query layer, and contracted commercial data are still missing.

## Isolation that must hold

- A FixCode key cannot call ChargeMatch (`403 wrong_product_key`).
- ChargeMatch usage never increments a FixCode bucket.
- Quota exceeded is `429 quota_exceeded`, not a log line.
- `POST /api/v1/keys` is closed outside local/dev.
- Revenue, affiliate availability, lead value, and partner existence do not enter `index-recompute.ts`.
- `PUBLIC_SITE_LIVE=false` → noindex, no public sitemap.
- Vercel Git deployments stay disabled (`git.deploymentEnabled: false`).

## Persistence

`PlatformRepository` is the only store API.

1. `PostgresRepository` when `DATABASE_URL` is set (schema + factory; query layer not wired to a driver yet).
2. `MemoryRepository` when `PENTA_PLATFORM_MEMORY=1`.
3. `FileFallbackRepository` for local DEV only (`data/platform/store.json`).

Product code must not call `readFileSync` / `writeFileSync` for platform data.

## Local flow

```bash
PENTA_PLATFORM_MEMORY=1 pnpm exec tsx scripts/platform-dev-flow.ts
pnpm --filter web dev --port 43141
# dashboard: /platform
```

## Empty states that must stay empty

| Surface | Honest empty |
| --- | --- |
| Partner network | No contracted workshops / dealers / OTAs / labs |
| Shop | No inventory |
| Affiliate | `409 offer_unavailable` |
| Rate card | `null` |
| SLA | `null` |
| Unknown entity | `unknown_entity` |

## How to try locally

```bash
pnpm --filter web dev --port 43141
curl -s http://127.0.0.1:43141/api/v1/contract
# keys: use /platform/keys (local session), not a public POST
```
