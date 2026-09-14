# Deep graph baseline

Generated: 2026-09-14T09:59:51.167Z

Recalculated from in-memory GraphStore after populateDecisionGraph + page builders. Stored README/JSON reports were not read. quality_score comes from evaluatePageQuality at page-build/recompute time, not from a previous markdown.

## Claimed previous state (not trusted)

794 entities · 1 186 relations (~1.49/entity) · 890 INDEXABLE · quality mean 90.2 / min 80.

## Recalculated now

- Entities: **5470**
- Relations: **15021** (unique 14137, duplicate 884)
- Relations/entity avg **2.75** · median **1** · P25 1 · P75 5 · P90 16
- Decision-relevant relations: **13610** (2.49/entity, median degree 1)
- Pages INDEXABLE **629** · NOINDEX_PRODUCT **114** · GRAPH_ONLY **36** · REVIEW_REQUIRED **111** · CONFLICTED **0** · STALE **0**

### Entity degree

isolated 11 · exactly 1: 2921 · 2–4: 1135 · ≥5: 1403 · ≥10: 739 · ≥20: 121

### Relation classes

- DECISION_RELEVANT: 13610
- DESCRIPTIVE: 1226
- NAVIGATION_ONLY: 185
- UNKNOWN: 0

### Truth status (entities + relations)

- VERIFIED_PRIMARY: 9004
- VERIFIED_SECONDARY: 8806
- TESTED: 0
- REPORTED: 0
- INFERRED: 41
- ESTIMATED: 1081
- STALE: 0
- UNKNOWN: 1559
- CONFLICTING: 0

### Entities by type

- cause: 458
- fix: 458
- historical_climate: 384
- temperature_range: 384
- precipitation: 384
- humidity: 384
- wind: 384
- packing_decision: 384
- test_result: 312
- safety_hazard: 262
- time_component: 180
- test: 155
- cost_component: 139
- error_code: 131
- service: 104
- mode: 103
- symptom: 98
- component: 63
- power_profile: 38
- model_family: 36
- destination: 32
- climate_profile: 32
- fluid_spec: 27
- family: 25
- part: 22
- device: 22
- model: 21
- generation: 21
- vehicle_configuration: 21
- recall: 21
- transmission: 21
- year_range: 21
- vin_scope: 21
- device_port: 21
- engine: 20
- trim: 20
- corridor: 19
- distance: 19
- consumption: 19
- energy_required: 19
- toll: 19
- break_even: 19
- allocation_profile: 17
- place: 17
- charger_port: 16
- manufacturer: 14
- garment: 13
- tool: 12
- issue: 11
- charger: 10
- protocol: 6
- appliance_type: 5
- drivetrain: 5
- brand: 4
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

- PACKS: 2909
- PACKS_FOR_ACTIVITY: 828
- EXPECTED_POWER: 660
- TESTED_BY: 570
- REQUIRES_TOOL: 469
- MAY_BE_CAUSED_BY: 458
- FIXED_BY: 458
- SAFETY_CLASS: 458
- RISK_LEVEL: 458
- DIY_OR_TECH: 458
- NEXT_ACTION: 458
- TYPICAL_CLIMATE: 416
- HAS_TEMPERATURE_RANGE: 384
- HAS_PRECIPITATION: 384
- HAS_HUMIDITY: 384
- HAS_WIND: 384
- HAS_PACKING_DECISION: 384
- DIFFERS_FROM: 352
- OBSERVED_ON_MODEL: 313
- HAS_ERROR: 313
- RETURNS: 312
- SAFETY_HAZARD: 262
- CAN_CHARGE: 220
- DEVICE_NEGOTIATES_WITH: 220
- COMPATIBLE_IF: 220
- INDICATES: 201
- MAY_INDICATE: 192
- HAS_TIME_COMPONENT: 180
- HAS_COST_COMPONENT: 139
- ON_APPLIANCE: 131
- HAS_ERROR_CODE: 131
- IN_FAMILY: 131
- HAS_SERVICE_INTERVAL: 104
- HAS_MODE: 103
- ROUTE_ALTERNATIVE: 96
- FAMILY_HAS_MODEL: 56
- COVERS_YEARS: 42
- SUPPORTS_PROTOCOL: 28
- SOLD_IN: 25
- BRAND_HAS_FAMILY: 25
- FITS: 24
- NEXT_TEST: 24
- AVAILABLE_WITH_ENGINE: 22
- MAX_INPUT: 22
- HAS_MODEL: 21
- HAS_GENERATION: 21
- IS_CONFIGURATION_OF: 21
- USES_ENGINE: 21
- SUBJECT_TO_RECALL: 21
- HAS_COMPONENT: 21
- USES_TRANSMISSION: 21
- HAS_BATTERY: 21
- HAS_WIPERS: 21
- HAS_TRIM: 21
- USES_DRIVETRAIN: 21
- DEVICE_HAS_PORT: 21
- DEVICE_ACCEPTS_MAX_WATTAGE: 21
- FROM_PLACE: 19
- TO_PLACE: 19
- HAS_DISTANCE: 19
- HAS_CONSUMPTION: 19
- VEHICLE_CONSUMPTION: 19
- ROUTE_ENERGY_REQUIRED: 19
- ROUTE_WEAR_COST: 19
- ROUTE_BREAK_EVEN: 19
- PORT_SUPPORTS_PROTOCOL: 18
- REQUIRES_FLUID_SPEC: 17
- OIL_CAPACITY: 17
- MAKES_APPLIANCE: 16
- HAS_PORT: 16
- MAX_OUTPUT: 16
- HAS_POWER_ALLOCATION: 16
- CHARGER_SPLITS_POWER_AS: 16
- ROUTE_HAS_TOLL: 12
- HAS_ISSUE: 11
- HAS_TRANS_FLUID: 7
- ROUTE_NO_TOLL: 7
- HAS_BRAKE_FLUID: 4
- SUPPORTS: 3
- CABLE_MAX_CURRENT: 3
- CABLE_EMARKED: 3
- CABLE_MAX_WATTAGE: 3
- HAS_COOLANT_SPEC: 2
- ALLOCATION_UNKNOWN: 1

## Per product

| Product | Entities | Relations | Avg | Median | Decision rel/entity | Isolated | ≥5 | ≥10 | INDEX | NOINDEX | GRAPH_ONLY |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| fixcode | 1961 | 5894 | 3.01 | 3 | 2.4 | 0 | 835 | 236 | 46 | 109 | 4 |
| autospec | 435 | 506 | 1.16 | 1 | 0.77 | 0 | 25 | 22 | 102 | 0 | 0 |
| wearthere | 2383 | 6425 | 2.7 | 1 | 2.7 | 4 | 427 | 427 | 379 | 5 | 32 |
| chargematch | 133 | 1507 | 11.33 | 2 | 11.3 | 4 | 36 | 33 | 64 | 0 | 0 |
| tripcost | 558 | 689 | 1.23 | 1 | 1.17 | 3 | 80 | 21 | 38 | 0 | 0 |

## Quality distribution (recomputed scores, not a previous report)

mean 80.3 · median 84 · p10 62 · p25 82 · p75 84 · p90 84 · min 59 · max 84

INDEXABLE mean 83.7 · min 80

Share of pages ≥90: **0%** — gate suspect: **false**

| Bucket | Count | % | INDEXABLE |
| --- | ---: | ---: | ---: |
| 0-49 | 0 | 0% | 0 |
| 50-59 | 4 | 0.4% | 0 |
| 60-69 | 130 | 14.6% | 0 |
| 70-79 | 1 | 0.1% | 0 |
| 80-84 | 755 | 84.8% | 629 |
| 85-89 | 0 | 0% | 0 |
| 90-94 | 0 | 0% | 0 |
| 95-100 | 0 | 0% | 0 |
