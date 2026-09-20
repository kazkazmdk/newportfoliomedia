# Security readiness

Not production-ready. This document lists the model, the controls that exist, and the blockers.

## Threat model (local → hosted)

| Threat | Current control | Residual risk |
| --- | --- | --- |
| Cross-product API key | `requireProductKey` checks `key.site` | Hosted key store must stay hashed |
| Cross-tenant read | Keys and widgets carry `organizationId` | Postgres RLS not applied yet |
| Public key minting | `POST /api/v1/keys` requires local/dev actor | Must stay closed in production |
| Quota bypass | `consumeQuota` before increment | Needs durable counters when hosted |
| In-memory rate limit | `RateLimiter` interface + memory adapter | Hosted needs Redis/durable store |
| Widget origin spoof | Allowlist + required Origin | Browser Origin can be omitted; reject empty |
| PII leak in logs | Request logs omit bodies; IP/UA hashed | File fallback still holds contact locally |
| Observation promotion | MERGED_AS_SIGNAL ≠ OFFICIAL | Moderator process is local only |
| XSS / HTML injection | Widget config is a safe schema (no HTML) | Product UIs still need CSP review |
| Iframe abuse | `sandbox="allow-scripts allow-forms allow-same-origin"` | `allow-same-origin` + scripts is a known combo |
| Secret in client | B2B pages do not issue keys | Dashboard is local-only |
| SEO contamination | Isolation test on `index-recompute.ts` | Must not regress |

## Auth model

- **API:** Bearer `penta_local_<site>_…` or `penta_prod_<site>_…`. Hash stored, raw token shown once.
- **Dashboard:** local/dev session. No public account. External IdP is a blocker.
- **Guards:** `requireUser`, `requireOrganization`, `requireRole`, `requireProductKey`, `requireProductAccess`.

Roles: OWNER, ADMIN, DEVELOPER, ANALYST, VIEWER.

## Key model

`organization + site + environment + scopes`. Default developer scopes: `engine:read`, `usage:read`.

Lifecycle: create, list, rename, rotate, revoke, delete-after-revoke.

## PII model

Leads store contact + message with `consent_version`, `consent_timestamp`, `privacy_notice_version`, optional IP/UA hashes, `retention_until`, `deleted_at`.

Export and delete exist for the local actor. Expired rows are anonymized by `anonymizeExpiredLeads`.

Analytics events must not copy raw PII.

## Rate limit vs quota

- Rate limit: anti-abuse (IP / key / org / widget). Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After`.
- Quota: contractual volume (`api_calls`, `widget_checks`, …). `429 quota_exceeded`.
- Metering: actual increment on the **calling** org+site.
- Billing: not enabled.

## Widget origin model

Installation has `allowedOrigins`. Check endpoint requires origin, active install, matching site, entitlement, remaining quota.

UNBRANDED requires `unbranded_widget` entitlement.

## Logging

`X-Request-Id` on every v1 error/success helper. Request log: id, org, key, site, route, status, latency, error code, entity. No default body capture.

## Secrets

No Stripe. No production auth provider. `DATABASE_URL` optional. File store is gitignored.

## Production blockers

1. External identity provider
2. Wired Postgres driver + migrations applied
3. Durable rate limiter
4. Hosted secret management
5. CSP / frame-ancestors for real partner origins
6. Review of iframe `allow-same-origin`
7. `PUBLIC_SITE_LIVE` remains false
8. Vercel Git deployments remain disabled
9. No contracted partners / merchants / affiliate programs
