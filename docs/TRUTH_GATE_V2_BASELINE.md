# Truth Gate V2 — baseline (before code change)

Recalculated 2026-09-14 from in-memory `GraphStore` via `pnpm graph:audit`.
Previous markdown reports were not reused as proof.

## Recalculated counts

| Metric | Value |
| --- | ---: |
| Entities | 5470 |
| Relations (raw) | 15021 |
| Unique relation keys | 14137 |
| Duplicate relation keys | 884 |
| Rel/entity mean | 2.75 |
| Rel/entity median | 1 |
| Isolated (0 edges) | 11 |
| Exactly 1 edge | 2921 |
| Pages total | 890 |
| INDEXABLE | 629 |
| SEO_CANDIDATE | 0 (state does not exist yet) |
| NOINDEX_PRODUCT | 114 |
| GRAPH_ONLY | 36 |
| REVIEW_REQUIRED | 111 |

### Per product

| Product | Entities | Relations | INDEX | NOINDEX | GRAPH_ONLY | REVIEW |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| FixCode | 1961 | 5894 | 46 | 109 | 4 | 90 |
| AutoSpec | 435 | 506 | 102 | 0 | 0 | 21 |
| WearThere | 2383 | 6425 | 379 | 5 | 32 | 0 |
| ChargeMatch | 133 | 1507 | 64 | 0 | 0 | 0 |
| TripCost | 558 | 689 | 38 | 0 | 0 | 0 |

### Demand

100% of INDEXABLE pages are **EDITORIAL_JUDGMENT**. GSC / keyword / SERP / autocomplete / internal search: **0**.

### Provenance (current classifier — enum only, not field-level)

| Truth status (enum) | Count |
| --- | ---: |
| VERIFIED_PRIMARY | 9004 |
| VERIFIED_SECONDARY | 8806 |
| TESTED | 0 |
| INFERRED | 41 |
| ESTIMATED | 1081 |
| UNKNOWN | 1559 |
| CONFLICTING | 0 |

Field-level provenance: **not implemented**.
Facts with exact document/page/table: **0**.
Multi-source facts: **not modelled**.
Conflicts: **0** (each fact has one compiled source — 0 conflicts is not evidence of agreement).

`VERIFIED_PRIMARY` is assigned whenever `source_type ∈ {OFFICIAL, MANUFACTURER, REGULATORY}`.
A homepage or `/us/support` URL is treated the same as a handbook table.

## Hardcoded / declarative truth (must be removed)

| Location | Problem |
| --- | --- |
| `packages/catalog/src/index-recompute.ts` | `distinct_from_parent: true` hardcoded |
| same | `product_action` inferred from **page family** |
| same | `interactive = product_action` |
| same | `required_fields_present = min(total, unique key count)` |
| same | `distinct_reason = page.id` fallback |
| same | `provenance_valid` = “any provenance array non-empty” |
| same | `verified_fact_count` = entity with MANUFACTURER enum + non-inferred edges |
| `apps/*/pages` builders | `product_cta: true`, `distinct_from_parent: true`, `provenance_valid: true`, hardcoded `verified_fact_count` |
| `packages/quality-gate` | editorial pages can still become INDEXABLE if score ≥ 80 |
| ChargeMatch graph | device × charger × cable cartesian `EXPECTED_POWER` / `COMPATIBLE_IF` inflates depth |
| WearThere | city × month pages INDEX because they exist; climate source is a compiled note, not a dataset citation |
| AutoSpec | OEM handbook compiled as MANUFACTURER without document locator |
| TripCost | snapshot prices INDEXABLE with THIRD_PARTY + editorial demand |

## Edge mixing

All 15021 edges are counted as one graph. There is no split into:

- SOURCE_TRUTH
- DERIVED_RULE
- PERSONALIZED_DECISION

PACKS (heuristic capsule) and TYPICAL_CLIMATE (compiled normal) share the same “decision_relevant” bucket.

## Quality distribution (mechanical)

mean 80.3 · median 84 · p10 62 · p90 84 · **84.8% of pages in 80–84**.
Editorial cap 84, not observed quality.

## This pass will not

- Add 50k relations
- Add thousands of URLs
- Invent GSC, lab curves, outcomes, or VIN decode
