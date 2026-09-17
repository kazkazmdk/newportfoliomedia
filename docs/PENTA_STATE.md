# Penta state (canonical)

> Generated report. Do not edit by hand.
>
> git SHA: `67a3d579882eda99d42e9b4d87cc84ba3f5c4a01`
> generated: `2026-09-17T10:37:21.997Z`
> metrics snapshot hash: `57130e0cc008f611`

This is the **only** current source of truth for live metrics. Older reports in `docs/` are historical unless they carry this same SHA + hash.

## Overall

| Metric | Value |
| ------ | ----: |
| pages | 4859 |
| entities | 40779 |
| relations | 75277 |
| PRIMARY_EXACT | 379 |
| REGULATORY_EXACT | 0 |
| TRUSTED_DATASET_EXACT | 0 |
| PRIMARY_GENERAL | 7087 |
| DATASET_GENERAL | 33694 |
| heuristic | 0 |
| unknown | 0 |
| SEO_CANDIDATE | 4516 |
| INDEXABLE | 0 |
| REVIEW_REQUIRED | 0 |
| GRAPH_ONLY | 299 |
| NOINDEX_PRODUCT | 34 |
| real demand observations | 111 |
| validated demand | 0 |

## Per product

| Product | Pages | SEO_CANDIDATE | INDEXABLE | REVIEW |
| ------- | ----: | ------------: | --------: | -----: |
| FixCode | 652 | 607 | 0 | 0 |
| WearThere | 1462 | 1191 | 0 | 0 |
| ChargeMatch | 614 | 587 | 0 | 0 |
| AutoSpec | 605 | 605 | 0 | 0 |
| TripCost | 1526 | 1526 | 0 | 0 |

## Source depth (this pass)

- exact OEM pages: **25**
- exact source documents: **4** (Samsung washer table, Samsung 4E article, LG washer list, Bosch E15)
- PRIMARY_EXACT graph facts: **379** (projections, not independent OEM documents)
- WearThere climate: compiled in-repo normals classified as **DATASET_GENERAL**, not TRUSTED_DATASET_EXACT
- WearThere surfaces after consolidation: **694** season/month pages + city hubs
- AutoSpec EXACT facts (oil/tyre/battery scopes): **315**
- ChargeMatch devices/chargers in catalog: **72 / 26** (rated specs, MEASURED empty)
- TripCost cost fields: **12056** heuristic / **0** non-heuristic

## Demand

Real observations imported: **111** (AUTOCOMPLETE). Collection queue: `ops/DEMAND_COLLECTION_BATCH.csv`. Validated Path A/B/C pages: **0**.

## Flags

- `PUBLIC_SITE_LIVE=false`
- `INDEXABLE=0` is acceptable
- Scale stops: critical_provenance
