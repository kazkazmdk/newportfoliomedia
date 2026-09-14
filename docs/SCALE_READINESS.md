# Scale readiness

Recalculated 2026-09-14. Ambition ranges (7k–18k entities, 80k–195k relations, 2.5k–6k INDEX) are **targets, not quotas**. No invented brands, cities, or lab rows were added to chase them.

## Freeze

INDEXABLE expansion is frozen for this pass.

| | Claimed before (untrusted) | Previous live report (untrusted until recalc) | Now (recomputed) |
| --- | ---: | ---: | ---: |
| Entities | 794 | ~3 088 | **5 470** |
| Relations | 1 186 | ~9 682 | **15 021** |
| Rel/entity | 1.49 | ~3.14 | **2.75** (median **1**) |
| INDEXABLE | 890 | ~817 | **629** |
| NOINDEX_PRODUCT | — | — | **114** |
| GRAPH_ONLY | — | ~0 | **36** |
| REVIEW_REQUIRED | — | — | **111** |

INDEXABLE **fell** (890/817 → 629). That is intended. Do not add URL templates to recover the count.

## Per product

| Product | Entities | Relations | Avg | Median | Decision rel/entity | INDEX | NOINDEX | GRAPH_ONLY | REVIEW |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| FixCode | 1961 | 5894 | 3.01 | 3 | 2.40 | 46 | 109 | 4 | 90 |
| AutoSpec | 435 | 506 | 1.16 | 1 | 0.77 | 102 | 0 | 0 | 21 |
| WearThere | 2383 | 6425 | 2.70 | 1 | 2.70 | 379 | 5 | 32 | 0 |
| ChargeMatch | 133 | 1507 | 11.33 | 2 | 11.30 | 64 | 0 | 0 | 0 |
| TripCost | 558 | 689 | 1.23 | 1 | 1.17 | 38 | 0 | 0 | 0 |

ChargeMatch avg is high because device×charger×cable `EXPECTED_POWER` / `COMPATIBLE_IF` edges are cartesian and **inferred**. That is graph depth, not lab truth. Median 2 shows most nodes are still leaves (ports, protocols).

AutoSpec / TripCost averages stay low because fluid/year/time-component leaves have degree 1. Decision entities (vehicle_configuration, corridor) are richer than the average.

## Readiness

| Product | READY_FOR_DATA_EXPANSION | READY_FOR_SEO_SCALE | Why |
| --- | --- | --- | --- |
| FixCode | **YES** | **NO** | Diagnostic tree exists (cause→test→next). Only 4 real brands. Demand is editorial. 90 pages REVIEW_REQUIRED. Expand manuals, not URLs. |
| AutoSpec | **YES** | **NO** | Identity chain is strict. VIN is still a stub. Rel/entity median 1. Depth before more vehicles. |
| WearThere | **CONDITIONAL** | **NO** | Climate normals vs forecast is enforced. 379 INDEX month pages is already a large SEO surface; adjacent-month uniqueness is the risk. Cite station/normals files before adding cities. |
| ChargeMatch | **YES** | **NO** | Protocol graph is the strongest. 0 MEASURED curves. Do not scale pair URLs. Measure watts. |
| TripCost | **YES** | **NO** | Corridors + break-even exist. Prices are THIRD_PARTY snapshots. 0 official toll/fuel. No city×city explosion. |

`CONDITIONAL` = expand climate **citations and activity graphs**, not destination count.

## Auto-stop rules (still armed)

Stop a batch if:

- hard-gate regression > 5%
- near-duplicates > 10%
- isolated entities grow without new decision types
- unknown critical facts exceed the previous audit

## Phase 2 / 3

Not started. Batch 1 = graph fix + hard gates (this pass). Batch 2 (+20% data) is allowed only from **real sources**, after this report.

`READY_FOR_SEO_SCALE = NO` for every product.
