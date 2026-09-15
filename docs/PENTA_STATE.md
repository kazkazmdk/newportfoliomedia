# Penta state (canonical)

> Generated report. Do not edit by hand.
>
> git SHA: `b12f49645545f066407f8122dd44bd5a46938643`
> generated: `2026-09-15T11:46:18.512Z`
> metrics snapshot hash: `3e0dc816203f3f42`

This is the **only** current source of truth for live metrics. Older reports in `docs/` are historical unless they carry this same SHA + hash.

## Overall

| Metric | Value |
| ------ | ----: |
| pages | 806 |
| entities | 5512 |
| relations | 14047 |
| PRIMARY_EXACT | 379 |
| REGULATORY_EXACT | 0 |
| TRUSTED_DATASET_EXACT | 0 |
| PRIMARY_GENERAL | 2455 |
| DATASET_GENERAL | 2381 |
| heuristic | 302 |
| unknown | 0 |
| SEO_CANDIDATE | 255 |
| INDEXABLE | 0 |
| REVIEW_REQUIRED | 98 |
| GRAPH_ONLY | 264 |
| NOINDEX_PRODUCT | 189 |
| real demand observations | 111 |
| validated demand | 0 |

## Per product

| Product | Pages | SEO_CANDIDATE | INDEXABLE | REVIEW |
| ------- | ----: | ------------: | --------: | -----: |
| FixCode | 249 | 79 | 0 | 98 |
| WearThere | 332 | 170 | 0 | 0 |
| ChargeMatch | 64 | 6 | 0 | 0 |
| AutoSpec | 123 | 0 | 0 | 0 |
| TripCost | 38 | 0 | 0 | 0 |

## Source depth (this pass)

- exact OEM pages: **25**
- exact source documents: **4** (Samsung washer table, Samsung 4E article, LG washer list, Bosch E15)
- PRIMARY_EXACT graph facts: **379** (projections, not independent OEM documents)
- WearThere climate: compiled in-repo normals classified as **DATASET_GENERAL**, not TRUSTED_DATASET_EXACT
- WearThere surfaces after consolidation: **300** season/month pages + city hubs
- AutoSpec EXACT facts (oil/tyre/battery scopes): **63**
- ChargeMatch devices/chargers in catalog: **22 / 10** (rated specs, MEASURED empty)
- TripCost cost fields: **152** heuristic / **0** non-heuristic

## Demand

Real observations imported: **111** (AUTOCOMPLETE). Collection queue: `ops/DEMAND_COLLECTION_BATCH.csv`. Validated Path A/B/C pages: **0**.

## Flags

- `PUBLIC_SITE_LIVE=false`
- `INDEXABLE=0` is acceptable
- Scale stops: none triggered
