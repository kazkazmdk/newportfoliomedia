# Graph semantics report

## Three logical graphs

| Kind | Count | Meaning |
| --- | ---: | --- |
| SOURCE_TRUTH | 3087 | Acquired or directly established from a source (climate normal, OEM spec row, error-on-appliance). |
| DERIVED_RULE | 6777 | Deterministic rule or heuristic (packing list, CAN_CHARGE, PowerScenario, cause ranking). |
| PERSONALIZED_DECISION | 0 | Output for a specific user situation. None stored — we do not persist user trips. |
| UNKNOWN | 4183 | Taxonomy / navigation / unclassified. Not counted as source truth. |

Do not publish “relations total” as graph depth.

## GRAPH_INFORMATION_DENSITY

| Metric | Value |
| --- | ---: |
| RAW_RELATION_COUNT | 14047 |
| Unique relation keys | 13603 |
| Cartesian expansion ratio | 1.033 |
| Source truth / entity | 0.56 |
| GRAPH_INFORMATION_DENSITY (source/raw) | 0.22 |

ChargeMatch raw relations BEFORE cartesian pass: **1507**. AFTER PowerScenario: **533**.

Duplicate relation keys BEFORE **884** AFTER **444**. Remaining duplicates are repeated typed edges (e.g. same pair, different property bags), not forced to zero.

## WearThere

- TYPICAL_CLIMATE = SOURCE_TRUTH (compiled normals, dataset `compiled-monthly-normals` / `penta-climate-v1`, period 1991-2020).
- PACKS / HAS_PACKING_DECISION = DERIVED_RULE (packing-v1). Not a measured wardrobe.
- No PERSONALIZED_DECISION stored for “I run 3h in the rain”.

## ChargeMatch

PowerScenario connects Device, Charger, Cable. expected_power is CALCULATED_EXPECTED / HEURISTIC_EXPECTED. measured_curve = null. EXPECTED_POWER cartesian edges = 0.

## FixCode

Cause → test → result → fix → safety remain decision edges (DERIVED_RULE when inferred from document priors). Labels LIKELY / POSSIBLE / UNCOMMON. No calibrated %. outcome_count = 0.

## AutoSpec

Fitment is only FITS when a verified row exists. same generation ≠ FITS. VIN_SUPPORT = NOT_IMPLEMENTED.

## TripCost

HAS_COST_COMPONENT is DERIVED / heuristic snapshot. Price kind HEURISTIC_PRICE. live_fare = false.
