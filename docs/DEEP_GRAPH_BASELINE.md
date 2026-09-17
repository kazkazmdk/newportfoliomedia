# Deep graph baseline

Generated: 2026-09-17T10:35:44.233Z

Recalculated from in-memory GraphStore after populateDecisionGraph + page builders. Stored README/JSON reports were not read. quality_score comes from evaluatePageQuality at page-build/recompute time, not from a previous markdown.

## Claimed previous state (not trusted)

794 entities · 1 186 relations (~1.49/entity) · 890 INDEXABLE · quality mean 90.2 / min 80.

## Recalculated now

- Entities: **40779**
- Relations: **75277** (unique 74329, duplicate 948)
- Relations/entity avg **1.85** · median **1** · P25 1 · P75 3 · P90 6
- Decision-relevant relations: **68526** (1.68/entity, median degree 1)
- Pages INDEXABLE **0** · SEO_CANDIDATE **4516** · NOINDEX_PRODUCT **34** · GRAPH_ONLY **299** · REVIEW_REQUIRED **0** · CONFLICTED **0** · STALE **0**
- Edge kinds SOURCE_TRUTH **10801** · DERIVED_RULE **41990** · PERSONALIZED_DECISION **0** · UNKNOWN **22486**

### Entity degree

isolated 11 · exactly 1: 27165 · 2–4: 8556 · ≥5: 5047 · ≥10: 3372 · ≥20: 1688

### Relation classes

- DECISION_RELEVANT: 68526
- DESCRIPTIVE: 3342
- NAVIGATION_ONLY: 3409
- UNKNOWN: 0

### Truth status (entities + relations)

- VERIFIED_PRIMARY: 0
- VERIFIED_SECONDARY: 82685
- TESTED: 0
- REPORTED: 0
- INFERRED: 170
- ESTIMATED: 8431
- STALE: 0
- UNKNOWN: 24770
- CONFLICTING: 0

### Entities by type

- cost_component: 11166
- mode: 7246
- corridor: 1507
- distance: 1507
- consumption: 1507
- energy_required: 1507
- toll: 1507
- break_even: 1507
- cause: 1272
- fix: 1272
- historical_climate: 888
- temperature_range: 888
- precipitation: 888
- humidity: 888
- wind: 888
- packing_decision: 888
- test_result: 884
- safety_hazard: 722
- service: 512
- test: 441
- error_code: 361
- component: 315
- symptom: 246
- power_profile: 109
- part: 106
- vehicle_configuration: 105
- recall: 105
- transmission: 105
- year_range: 105
- vin_scope: 105
- engine: 99
- generation: 95
- issue: 95
- model: 89
- trim: 78
- place: 76
- fluid_spec: 74
- destination: 74
- climate_profile: 74
- device: 72
- device_port: 69
- model_family: 56
- family: 43
- power_scenario: 42
- allocation_profile: 38
- charger_port: 37
- manufacturer: 26
- charger: 26
- garment: 13
- tool: 12
- brand: 11
- protocol: 6
- appliance_type: 5
- drivetrain: 5
- safety_state: 3
- cable: 3
- market: 2
- airline: 2
- diy_or_tech: 2
- vehicle_profile: 2
- wear_model: 1
- depreciation_model: 1
- time_value: 1

### Relation types

- HAS_COST_COMPONENT: 11166
- ROUTE_ALTERNATIVE: 7827
- HAS_MODE: 7246
- PACKS: 6636
- CAN_CHARGE: 1872
- PACKS_FOR_ACTIVITY: 1836
- TESTED_BY: 1640
- FROM_PLACE: 1507
- TO_PLACE: 1507
- HAS_DISTANCE: 1507
- HAS_CONSUMPTION: 1507
- VEHICLE_CONSUMPTION: 1507
- ROUTE_ENERGY_REQUIRED: 1507
- ROUTE_WEAR_COST: 1507
- ROUTE_BREAK_EVEN: 1507
- REQUIRES_TOOL: 1315
- MAY_BE_CAUSED_BY: 1272
- FIXED_BY: 1272
- SAFETY_CLASS: 1272
- RISK_LEVEL: 1272
- DIY_OR_TECH: 1272
- NEXT_ACTION: 1272
- ROUTE_HAS_TOLL: 1022
- TYPICAL_CLIMATE: 962
- HAS_TEMPERATURE_RANGE: 888
- HAS_PRECIPITATION: 888
- HAS_HUMIDITY: 888
- HAS_WIND: 888
- HAS_PACKING_DECISION: 888
- RETURNS: 884
- DIFFERS_FROM: 814
- SAFETY_HAZARD: 722
- OBSERVED_ON_MODEL: 582
- HAS_ERROR: 582
- INDICATES: 554
- MAY_INDICATE: 542
- HAS_SERVICE_INTERVAL: 512
- ROUTE_NO_TOLL: 485
- ON_APPLIANCE: 361
- HAS_ERROR_CODE: 361
- IN_FAMILY: 361
- COVERS_YEARS: 210
- HAS_SCENARIO: 126
- SOLD_IN: 109
- FITS: 108
- AVAILABLE_WITH_ENGINE: 106
- IS_CONFIGURATION_OF: 105
- USES_ENGINE: 105
- SUBJECT_TO_RECALL: 105
- HAS_COMPONENT: 105
- USES_TRANSMISSION: 105
- HAS_BATTERY: 105
- HAS_WIPERS: 105
- HAS_TRIM: 105
- USES_DRIVETRAIN: 105
- HAS_GENERATION: 95
- HAS_ISSUE: 95
- SUPPORTS_PROTOCOL: 94
- HAS_MODEL: 89
- REQUIRES_FLUID_SPEC: 88
- OIL_CAPACITY: 84
- NEXT_TEST: 80
- FAMILY_HAS_MODEL: 76
- MAX_INPUT: 72
- DEVICE_HAS_PORT: 69
- DEVICE_ACCEPTS_MAX_WATTAGE: 69
- PORT_SUPPORTS_PROTOCOL: 66
- BRAND_HAS_FAMILY: 43
- HAS_PORT: 37
- MAX_OUTPUT: 37
- HAS_POWER_ALLOCATION: 37
- CHARGER_SPLITS_POWER_AS: 37
- MAKES_APPLIANCE: 34
- HAS_TRANS_FLUID: 30
- HAS_BRAKE_FLUID: 16
- SUPPORTS: 3
- CABLE_MAX_CURRENT: 3
- CABLE_EMARKED: 3
- CABLE_MAX_WATTAGE: 3
- HAS_COOLANT_SPEC: 2
- ALLOCATION_UNKNOWN: 1

## Per product

| Product | Entities | Relations | Avg | Median | Decision rel/entity | Isolated | ≥5 | ≥10 | INDEX | NOINDEX | GRAPH_ONLY |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| fixcode | 5330 | 15769 | 2.96 | 3 | 2.41 | 0 | 2265 | 612 | 0 | 34 | 1 |
| autospec | 2021 | 2489 | 1.23 | 1 | 0.83 | 0 | 130 | 112 | 0 | 0 | 0 |
| wearthere | 5491 | 14688 | 2.67 | 1 | 2.67 | 4 | 973 | 973 | 0 | 0 | 271 |
| chargematch | 402 | 2529 | 6.29 | 2 | 6.28 | 4 | 103 | 100 | 0 | 0 | 27 |
| tripcost | 27535 | 39802 | 1.45 | 1 | 1.34 | 3 | 1576 | 1575 | 0 | 0 | 0 |

## Quality distribution (recomputed scores, not a previous report)

mean 67.1 · median 68 · p10 68 · p25 68 · p75 68 · p90 68 · min 0 · max 81

INDEXABLE mean 0 · min 0

Share of pages ≥90: **0%** — gate suspect: **false**

| Bucket | Count | % | INDEXABLE |
| --- | ---: | ---: | ---: |
| 0-49 | 10 | 0.2% | 0 |
| 50-59 | 248 | 5.1% | 0 |
| 60-69 | 4579 | 94.2% | 0 |
| 70-79 | 17 | 0.3% | 0 |
| 80-84 | 5 | 0.1% | 0 |
| 85-89 | 0 | 0% | 0 |
| 90-94 | 0 | 0% | 0 |
| 95-100 | 0 | 0% | 0 |
