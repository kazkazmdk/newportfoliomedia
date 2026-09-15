# Penta V3 execution

> Canonical live metrics: [`docs/PENTA_STATE.md`](./PENTA_STATE.md). This document explains the pass. Do not treat older reports as current.

Starting SHA audited: `940ec6b24ee1c984c22933f2900b200c2009be90`  
`PUBLIC_SITE_LIVE=false` for the entire pass. No public launch.

This pass did **not** rebuild the framework. It closed five structural QA defects, then spent the remainder on sources, datasets, demand, and honest recomputation.

## Overall

| Metric | Before (`940ec6b`) | After |
| ------ | -----------------: | ----: |
| pages | 890 | 806 |
| entities | 5512 | see PENTA_STATE |
| relations | 14047 | see PENTA_STATE |
| source truth | mixed / stale reports | one canonical report + SHA/hash |
| PRIMARY_EXACT | 0 | 379 graph facts / **25** FixCode OEM pages |
| REGULATORY_EXACT | 0 | 0 |
| TRUSTED_DATASET_EXACT | 2381 (bug) | **0** |
| PRIMARY_GENERAL | — | 2453+ |
| DATASET_GENERAL | — | 2381 (compiled climate, not exact) |
| heuristic | — | 302 graph / 152 TripCost fields |
| unknown | — | 0 |
| SEO_CANDIDATE | 217 (unreliable WearThere climate) | **255** (FixCode 79 + WearThere 170 editorial + ChargeMatch 6) |
| INDEXABLE | 0 | **0** |
| REVIEW | 98 | 98 |
| real demand observations | 0 | **111** autocomplete (no SERP) |
| validated demand (Path A/B/C) | 0 | **0** |

## Per product

| Product | Pages | Exact facts | Dataset exact | Heuristic | Real demand | SEO candidates | Indexable | Main blocker |
| ------- | ----: | ----------: | ------------: | --------: | ----------: | -------------: | --------: | ------------ |
| FixCode | 249 | 25 OEM locators | 0 | remaining GENERAL | autocomplete attempted | live | 0 | no SERP Path A; Miele/Bosch depth incomplete |
| WearThere | 332 | 0 | 0 | compiled normals | autocomplete attempted | live editorial | 0 | climate not externally reconstructable |
| ChargeMatch | 64 | 0 PDO exact | 0 | rated catalog | 111-wave includes device queries | 6 | 0 | no public PDO tables; autocomplete ≠ Path A |
| AutoSpec | 123 | 63 EXACT scope / 0 VERIFIED | 0 | all UNVERIFIED | autocomplete attempted | 0 | 0 | no handbook locator |
| TripCost | 38 | 0 | 0 | 152 / 0 reference | autocomplete attempted | 0 | 0 | no dated official fare/fuel snapshot |

## Source depth

- **FixCode exact OEM docs:** 25 pages, **4** source documents (Samsung washer table dated 2025-02-19, Samsung 4E article, LG washer list, Bosch E15). PRIMARY_EXACT graph facts (379) are projections, not 379 documents. HE/HC meanings aligned to the official “water temperature” row. Mismatched codes stay GENERAL.
- **AutoSpec exact handbook facts:** 0. Fitment can be EXACT by required dimensions; verification stays UNVERIFIED without a page/table locator. Queue: `ops/AUTOSPEC_SOURCE_QUEUE.csv`.
- **WearThere traceable climate records:** compiled in-repo monthly normals, now **DATASET_GENERAL**. No invented ERA5/station mapping. Consolidation applied (Singapore hub-only; temperate seasons).
- **ChargeMatch exact manufacturer specs:** 2 verified Apple support articles (iPhone 16 tech specs, iPhone charge speeds) as PRIMARY_GENERAL. No invented MacBook URLs (false IDs rejected). MEASURED_CURVES remains `[]`.
- **TripCost observed/reference cost inputs:** 0. CostValue is used; every current field is HEURISTIC.

## Demand

| Signal | Count |
| ------ | ----: |
| queries attempted | 142 |
| queries observed (autocomplete HTTP 200 + suggestions) | 111 |
| strong SERP | 0 |
| autocomplete | 111 |
| PAA | 0 |
| related searches | 0 |
| volume evidence | 0 |
| Path A validations | 0 |
| Path B validations | 0 |
| Path C validations | 0 |

Queue: `ops/DEMAND_COLLECTION_BATCH.csv`. Import: `data/demand/*/evidence.csv`. PRELAUNCH batch: `ops/PRELAUNCH_BATCH_V4.json` (0 rows — no SERP, no Path A/B/C).

A six-month-old SERP cannot validate (TTL 75 days). `en-US` cannot validate an `en-GB` country-specific page.

## Product scores /10

| Product | Utility | Data truth | Source depth | Decision engine | SEO readiness | Scale readiness | Overall |
| ------- | ------: | ---------: | -----------: | --------------: | ------------: | --------------: | ------: |
| FixCode | 8 | 7 | 7 | 8 | 4 | 6 | **8** |
| WearThere | 7 | 5 | 4 | 8 | 3 | 5 | **6.5** |
| ChargeMatch | 7 | 5 | 4 | 8 | 2 | 5 | **6** |
| AutoSpec | 6 | 4 | 3 | 7 | 2 | 4 | **5** |
| TripCost | 7 | 3 | 2 | 7 | 2 | 3 | **4.5** |

## What this pass changed (engineering, not a new framework)

1. TRUSTED_DATASET_EXACT requires dataset id + external URL or official id + version **and** period + retrievedAt + usable locator.
2. WearThere surfaces follow consolidation (equatorial collapse, seasonal routes).
3. SERP TTL 75 days + locale/country match.
4. AutoSpec EXACT = all required dimensions for that fact; HIGH ≠ VERIFIED; VIN still NOT_IMPLEMENTED.
5. ChargeMatch negotiates selected-port PDO ∩ device ∩ cable ∩ allocation; `allocate()` returns `byPort`.
6. FixCode interactive diagnose consumes the branched tree; PROFESSIONAL_ONLY / STOP_USE stop DIY.
7. TripCost CostValue per input; UI does not call heuristic “live”.
8. ActionEvidence: declared output/decision fields must exist on the payload.
9. `pnpm lint` is web ESLint only. Package typecheck is not lint.
10. Scale-stop rates for trusted_dataset_exact and primary_exact are informational and not gamed by in-repo compiled data.
11. Canonical report: `docs/PENTA_STATE.md` + CI `state:check`.

## Next expansion (truth + demand first)

- FixCode: more OEM articles (Bosch/Miele) only when the meaning matches; import real SERP for the 25 exact pages.
- WearThere: replace compiled normals only after a real fetch (station/grid/period). Do not add cities first.
- ChargeMatch: attach SKU manuals with PDO tables; keep measured empty.
- AutoSpec: 10 handbook locators beat 100 approximate vehicles.
- TripCost: dated official fuel/toll references on existing corridors.
