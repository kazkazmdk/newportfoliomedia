# Monetization readiness — local only

`PUBLIC_SITE_LIVE` remains `false`. Nothing in this pass is a Vercel deploy, a public rate card, or a partner network.

Winner ranking is `internal_opportunity_only`. It is not an indexation input.

## 20-point status

1. **Shared schema** — `@penta/monetization` defines sites, intents, events, leads, observations, outbound, commerce surfaces, flywheel counts.
2. **Intent** — `classifyIntent(path)` maps product URLs to diagnose / compatibility / corridor / vehicle / capsule / operator. Operator surfaces are not product decisions.
3. **Events** — Shared analytics names now include `outbound_click`, `lead_submitted`, `observation_submitted`, `api_called`, `widget_*`, `key_*`, `meter_exceeded`. Persisted locally via `POST /api/v1/events`.
4. **Flywheel** — Observations and feedback write `USER_REPORTED` / `USER_OBSERVED` only. Provenance promotion to OFFICIAL / MANUFACTURER / TESTED throws.
5. **Outbound** — Official URLs already on file (Apple support, manufacturer/recall portals) are marked `affiliate: false`, `partnerId: null`. `affiliate_click` is rejected with 409.
6. **Commerce** — Each product has a next-action surface. `shopEnabled=false`, `pricesPublished=false`, `inventory=[]`. No invented SKUs.
7. **Leads** — `POST /api/v1/leads` stores `STORED_LOCAL` rows with `assignedPartnerId: null`. Empty-network copy is product-specific.
8. **B2B API** — Versioned engines at `/api/v1/{product}/…` require `Authorization: Bearer penta_local_…`. First-party `/api/{product}/…` stays keyless for the UI.
9. **Widgets** — `/widgets/{site}` injects a same-origin iframe to `/embed/{site}`. Empty / unknown entities stay unknown.
10. **Developer surfaces** — Distinct pages per product: `/developers`, `/api`, `/widgets`, `/data`, `/business`, `/docs`, `/contact-sales`. Copy is product-specific; no invented clients.
11. **Local keys** — `POST /api/v1/keys` hashes the secret. Token shown once. Prefix `penta_local_`.
12. **Metering** — Daily soft cap 200. `price` and `rateCard` are always `null`. Exceeding records `meter_exceeded`.
13. **Retention** — Feedback now persists. No accounts, no email, no hosted identity.
14. **Licensing** — `/data` + `data_license` lead kind only. No dataset dump.
15. **Sponsorship** — Not implemented. No invented sponsors.
16. **i18n** — Not in this slice. Surfaces stay English product copy.
17. **Ops winner signal** — `GET /api/v1/ops/readiness` ranks sites from catalog INDEXABLE counts, engine routes, and local events. Not revenue.
18. **Truth gates** — `opportunityScore` / `monetization_potential` stay out of `index-recompute.ts`. Isolation test covers this.
19. **Hosting** — Store is `data/platform/store.json` on this machine (gitignored). Contract `hosted: local_only`.
20. **Distribution** — Preview is local. Do not push `github` (would trigger Vercel). Do not run `vercel`. Publish button stays hidden.

## Empty states that must stay empty

| Surface | Honest empty |
| --- | --- |
| Partner network | No contracted workshops / dealers / OTAs / labs |
| Shop | No inventory |
| Affiliate | 409 `affiliate_unavailable` |
| Rate card | `null` |
| Unknown entity | `unknown_entity` — not a generated page |

## How to try locally

```bash
pnpm --filter web dev --port 43133
curl -s http://127.0.0.1:43133/api/v1/contract
curl -s http://127.0.0.1:43133/api/v1/keys -H 'content-type: application/json' \
  -d '{"site":"chargematch","label":"local bench"}'
```
