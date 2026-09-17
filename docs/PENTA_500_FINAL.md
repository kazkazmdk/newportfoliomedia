# Penta 500 final

`catalog_publish_state === "PUBLISHABLE"` from the existing quality/truth gate. Gates were not lowered. `PUBLIC_SITE_LIVE` remains `false`.

data_version: `2026.09.17-depth-500`  
graph_version: `graph-v4-depth-500`

| Product | Generated | Publishable | Limited | Noindex | Tier A | B | C | Entities | Relations | Real source coverage |
| ------- | --------: | ----------: | ------: | ------: | -----: | -: | -: | -------: | --------: | -------------------: |
| fixcode | 652 | 607 | 34 | 11 | 134 | 231 | 242 | 5330 | 15769 | 1.000 |
| autospec | 605 | 605 | 0 | 0 | 134 | 230 | 241 | 2021 | 2489 | 1.000 |
| wearthere | 1462 | 1027 | 0 | 435 | 226 | 391 | 410 | 5491 | 14688 | 1.000 |
| chargematch | 614 | 571 | 0 | 43 | 126 | 217 | 228 | 402 | 2529 | 1.000 |
| tripcost | 1526 | 1526 | 0 | 0 | 336 | 580 | 610 | 41101 | 53368 | 1.000 |
| **total** | **4859** | **4336** | **34** | **489** | | | | **40779** | **75277** | |

INDEXABLE remains 0 (editorial demand only). Duplicate clusters: WearThere  climate-near-duplicates consolidated; ChargeMatch 14 identical pair decisions.

## FixCode

- target 500 / achieved 607
- remaining blocker: none for the 500 target
- 34 LIMITED: obscure codes with seed demand below the existing obscure gate
- 11 NOINDEX: alias glyphs (`4C`→`4E`, `E17`→`F17`, …) as `REDIRECT`

## AutoSpec

- target 500 / achieved 605
- remaining blocker: none for the 500 target
- fitment stays scoped; generation-level rows are not promoted to EXACT variant fitment
- hubs no longer copy topic facts (that was collapsing sibling distinctness)

## WearThere

- target 500 / achieved 1027
- remaining blocker: none for the 500 target
- 435 NOINDEX: same climate band + capsule + activity after fingerprint
- equatorial cities stay hub-only
- packing lists are a different family from wear decisions

## ChargeMatch

- target 500 / achieved 571
- remaining blocker: none for the 500 target
- calculable pairs ≫ SEO surfaces; SSG is `SEO_SURFACE_CANDIDATE` only
- 43 NOINDEX: same match / wattage / bottleneck / connector decision

## TripCost

- target 500 / achieved 1526
- remaining blocker: none for the 500 target
- pages are labelled `MODELLED` / `HEURISTIC_PRICE` with declared assumptions
- no live fare claim; `INDEXABLE` stays closed

## Source coverage

`sourceCoverage = weighted sourced decision facts / weighted decision facts`.

- critical = 3, supporting = 2, descriptive = 0.5
- qualifying evidence: PRIMARY_EXACT / PRIMARY_GENERAL / REGULATORY_EXACT / TRUSTED_DATASET_EXACT / DATASET_GENERAL / PRIMARY_DATABASE_GENERAL / TRUSTED_THIRD_PARTY / CROSS_SOURCE_CONFIRMED
- DERIVED_HEURISTIC qualifies only when `modelled && assumptionsDeclared`
- PUBLISHABLE floor 0.75, with the documented MODELLED exception

## Demand

PUBLISHABLE is a quality state. INDEXABLE still needs a real demand path. Prioritized queue: `ops/DEMAND_VALIDATION_2500.csv`.
