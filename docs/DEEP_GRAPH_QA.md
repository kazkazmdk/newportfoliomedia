# Deep graph QA (final)

Generated from `pnpm graph:audit` + `pnpm test` on 2026-09-14.

Do not reuse the previous markdown as a metric source. This file replaces it.

## Claimed BEFORE (untrusted)

| Metric | Claim |
| --- | ---: |
| Entities | 794 |
| Relations | 1 186 |
| Rel/entity | ~1.49 |
| INDEXABLE | 890 |
| Quality mean / min | 90.2 / 80 |

## AFTER (recomputed from TypeScript objects)

| Product | Entities | Relations | Avg | Median | Decision rel/entity | INDEX | NOINDEX | GRAPH_ONLY |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| FixCode | 1961 | 5894 | 3.01 | 3 | 2.40 | 46 | 109 | 4 |
| AutoSpec | 435 | 506 | 1.16 | 1 | 0.77 | 102 | 0 | 0 |
| WearThere | 2383 | 6425 | 2.70 | 1 | 2.70 | 379 | 5 | 32 |
| ChargeMatch | 133 | 1507 | 11.33 | 2 | 11.30 | 64 | 0 | 0 |
| TripCost | 558 | 689 | 1.23 | 1 | 1.17 | 38 | 0 | 0 |
| **Total** | **5470** | **15021** | **2.75** | **1** | **2.49** | **629** | **114** | **36** |

Also: REVIEW_REQUIRED **111** (90 FixCode + 21 AutoSpec). CONFLICTED 0. STALE 0.

INDEXABLE 890 → **629**. A drop is a quality signal, not a regression to “fix” with more URLs.

## Quality distribution

See `docs/QUALITY_GATE_REALITY_CHECK.md`.

mean 80.3 · median 84 · p10 62 · p25 82 · p75 84 · p90 84 · min 59 · max 84.  
0% of pages ≥90. Editorial cap still piles 84.8% of pages into 80–84.

## Relation distribution

- isolated 11 · exactly 1: 2921 · 2–4: 1135 · ≥5: 1403 · ≥10: 739 · ≥20: 121
- classes: DECISION_RELEVANT 13610 · DESCRIPTIVE 1226 · NAVIGATION_ONLY 185 · UNKNOWN 0
- unique relations 14137 · duplicate keys 884 (mostly ChargeMatch parallel `EXPECTED_POWER` edges that differ by cable)

## Source / truth status

| Status | Count |
| --- | ---: |
| VERIFIED_PRIMARY | 9004 |
| VERIFIED_SECONDARY | 8806 |
| TESTED | 0 |
| REPORTED | 0 |
| INFERRED | 41 |
| ESTIMATED | 1081 |
| STALE | 0 |
| UNKNOWN | 1559 |
| CONFLICTING | 0 |

WearThere and TripCost contribute 0 “verified facts” in the health table because their sources are TRUSTED_THIRD_PARTY / THIRD_PARTY, not MANUFACTURER/OFFICIAL/TESTED. That is correct, not a missing counter.

## Conflicts and stale

- Stored conflicts: 0. Engine exists (`FactConflict`). Critical disagreements do not auto-promote.
- Stale current presented as current: hard fail → `STALE`.
- ChargeMatch lab measurements: **0**.

## Similarity

Nearest-5 computed at recompute time. INDEX sample siblings are 0.38–0.79 structured similarity. A page with structured >0.85 + same intent + same decision output cannot INDEX.

## Hard-gate failures (examples)

- FixCode obscure codes → NOINDEX_PRODUCT
- FixCode brand hubs → GRAPH_ONLY
- FixCode professional-only → REVIEW_REQUIRED
- WearThere destination hubs → GRAPH_ONLY
- LLM safety / AI-as-official / unresolved critical conflict / stale-as-current → never INDEX (unit tests)

## Weak vs strong entity types

**Weak (median degree 1, leaves):** tools, year_range, time_component, humidity/wind nodes, protocols, individual cost lines. Not punished by density gates.

**Strong (decision types with ≥5 or ≥10):** FixCode error_code/cause/test, WearThere month climate + packing, ChargeMatch device/charger (cartesian inferred edges), TripCost corridors with modes.

**Still shallow vs ambition:** AutoSpec 1.16 rel/entity, TripCost 1.23. ChargeMatch 11.33 is cartesian inferred, not measured.

## Tests

`pnpm test` — 45 passed, including:

- no hard-gate failure can INDEX
- stale current cannot INDEX as current
- AI_INFERRED cannot become OFFICIAL
- unresolved critical conflict → CONFLICTED
- sitemap excludes noindex (`PUBLIC_SITE_LIVE=false` still empties sitemap)
- indexable canonical = self
- score recomputed
- duplicate similarity blocks INDEX
- FixCode multi-cause + hazard
- AutoSpec ambiguous engine vs exact powertrain
- WearThere climate ≠ forecast
- ChargeMatch cable bottleneck, multi-port, Watch incompatible
- TripCost stale fuel, break-even, explicit toll

## Readiness

See `docs/SCALE_READINESS.md`.

| Product | READY_FOR_DATA_EXPANSION | READY_FOR_SEO_SCALE |
| --- | --- | --- |
| FixCode | YES | NO |
| AutoSpec | YES | NO |
| WearThere | CONDITIONAL | NO |
| ChargeMatch | YES | NO |
| TripCost | YES | NO |

## What this pass did *not* do

- Did not invent brands, cities, VINs, lab watts, or live fares.
- Did not raise INDEXABLE toward 2 500–6 000.
- Did not mark AI or editorial facts as VERIFIED.
- Did not change `lastReviewed` / `reviewed_at` except where a source already had `verified_at`.
- Did not claim “all pages unique” beyond nearest-neighbor math.
- Did not claim sources are verified because a URL exists.

Architecture now:

**LARGE-ish GRAPH (5.5k / 15k) + STRICTER TRUTH LAYER + DECISION ENGINES + HARD INDEX GATE → 629 INDEXABLE.**

Still short of 80k–195k relations. Depth before URL scale.
