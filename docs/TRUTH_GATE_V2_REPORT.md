# Truth Gate V2 — report

> **HISTORICAL.** This report is not the current source of truth. Live metrics: [`docs/PENTA_STATE.md`](./PENTA_STATE.md).
>
> It recorded 50 SEO_CANDIDATE at an earlier SHA. Do not compare it to live recalculation.

Recalculated 2026-09-14T13:02:31.188Z from in-memory GraphStore.
Previous markdown was not reused as proof.

## What changed

The quality gate no longer accepts a positive boolean as truth.

- `required_fields_present` inspects PAGE_REQUIREMENTS per family (mandatory + decision-critical).
- `product_action` is detected from payload outputs, not from the page family.
- `interactive` requires user input + computed output. A CTA is not an interaction.
- `distinct_from_parent` is computed (overlap, unique facts). `page.id` is not evidence.
- `VERIFIED_PRIMARY` comes from `validateFactProvenance`. Generic manufacturer URLs are PRIMARY_GENERAL.
- Editorial / demand level 0 cannot produce INDEXABLE. Ceiling is SEO_CANDIDATE.
- Edges are classified SOURCE_TRUTH / DERIVED_RULE / PERSONALIZED_DECISION.
- ChargeMatch cartesian EXPECTED_POWER / COMPATIBLE_IF / DEVICE_NEGOTIATES_WITH was replaced by PowerScenario.
- WearThere climate rows carry an explicit dataset citation (no WMO station invented).
- PUBLIC_SITE_LIVE remains false. Public sitemap is empty.

## Final metrics

### Graph

| Metric | Value |
| --- | ---: |
| Entities | 5512 |
| Raw relations | 14047 |
| Unique relation keys | 13603 |
| Duplicate relation keys | 444 |
| SOURCE_TRUTH edges | 3087 |
| DERIVED_RULE edges | 6777 |
| PERSONALIZED_DECISION edges | 0 |
| UNKNOWN edges | 4183 |
| Rel/entity mean | 2.55 |
| Rel/entity median | 1 |
| Entities 0 edges | 11 |
| Entities 1 edge | 2921 |
| Entities 2–3 edges | 1036 |
| Entities 4–10 edges | 841 |
| Entities 10+ edges | 703 |
| GRAPH_INFORMATION_DENSITY | 0.22 |
| Cartesian expansion ratio | 1.033 |
| Source truth / entity | 0.56 |

### Provenance (validator, not enum)

| Status | Count |
| --- | ---: |
| Facts (entities + relations) | 19559 |
| VERIFIED exact primary (PRIMARY_EXACT) | 0 |
| VERIFIED exact regulatory | 0 |
| Trusted dataset exact | 0 |
| Cross-source confirmed | 862 |
| Single source | 19559 |
| Conflicted | 0 |
| Enum VERIFIED_PRIMARY (validator) | 0 |
| VERIFIED_SECONDARY | 5897 |
| INFERRED | 145 |
| ESTIMATED | 3120 |
| UNKNOWN | 10397 |
| Facts with exact source URL | 3038 |
| Facts with identifiable document name | 10761 |
| Facts with field-level provenance record | 18306 |
| Facts with only generic domain | 4507 |
| Facts without provenance | 0 |

### Pages

| State | Count |
| --- | ---: |
| Total candidates | 890 |
| INDEXABLE | 0 |
| SEO_CANDIDATE | 50 |
| NOINDEX_PRODUCT | 299 |
| GRAPH_ONLY | 385 |
| REVIEW_REQUIRED | 156 |

### Demand

| Kind | Pages |
| --- | ---: |
| GSC | 0 |
| Keyword provider | 0 |
| SERP | 0 |
| Autocomplete | 0 |
| Internal search | 0 |
| Editorial only | 890 |

### Quality distribution (non-compensable floors)

mean 61 · median 68 · p10 46 · p25 49 · p75 68 · p90 68 · min 38 · max 68

The 80–84 pile-up is gone. Soft score is capped when verified exact facts < 3 (currently 0). That cluster at 68 is a **cap**, not a claim of quality.

### Honesty flags

- MEASURED_CURVES = 0
- VIN_SUPPORT = NOT_IMPLEMENTED
- DIAGNOSTIC_OUTCOMES = 0
- PowerScenario measured_curve all null = true
- PUBLIC_SITE_LIVE = false
- public sitemap entries = 0

# Before / after

| METRIC | BEFORE | AFTER | CHANGE | INTERPRETATION |
| --- | ---: | ---: | ---: | --- |
| Entities | 5470 | 5512 | 42 | PowerScenario entities added; no catalog scale. |
| Raw relations | 15021 | 14047 | -974 | ChargeMatch cartesian removed. |
| Duplicate relation keys | 884 | 444 | -440 | Fewer parallel EXPECTED_POWER keys. |
| Rel/entity mean | 2.75 | 2.55 | -0.2 | Raw mean fell; that is not a depth loss of source truth. |
| Rel/entity median | 1 | 1 | 0 | Still 1 — many taxonomy nodes. |
| SOURCE_TRUTH edges | n/a (mixed) | 3087 | n/a | First honest split. |
| VERIFIED_PRIMARY | 9004 | 0 | -9004 | Enum “manufacturer” is no longer primary. |
| Generic-source facts | uncounted | 4507 | n/a | Now visible. |
| Field-level provenance records | 0 | 18306 | +18306 | Records exist; locators still thin. |
| INDEXABLE | 629 | 0 | -629 | Editorial cannot index. |
| SEO_CANDIDATE | 0 | 50 | 50 | New honest bucket. |
| GRAPH_ONLY | 36 | 385 | 349 | WearThere matrix + near-duplicates. |
| ChargeMatch relations | 1507 | 533 | -974 | PowerScenario, not cartesian. |
| Pages | 890 | 890 | 0 | No SEO scale. |

Median **source truth** depth is now measurable (0.56/entity) instead of being hidden inside 15k mixed edges.
