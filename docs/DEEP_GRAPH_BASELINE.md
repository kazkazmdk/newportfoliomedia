# Deep graph baseline

Generated: 2026-09-17T09:33:56.347Z

Recalculated from in-memory GraphStore after populateDecisionGraph + page builders. Stored README/JSON reports were not read. quality_score comes from evaluatePageQuality at page-build/recompute time, not from a previous markdown.

## Claimed previous state (not trusted)

794 entities · 1 186 relations (~1.49/entity) · 890 INDEXABLE · quality mean 90.2 / min 80.

## Recalculated now

- Entities: **5512**
- Relations: **14047** (unique 13603, duplicate 444)
- Relations/entity avg **2.55** · median **1** · P25 1 · P75 5 · P90 16
- Decision-relevant relations: **12636** (2.29/entity, median degree 1)
- Pages INDEXABLE **0** · SEO_CANDIDATE **265** · NOINDEX_PRODUCT **305** · GRAPH_ONLY **316** · REVIEW_REQUIRED **98** · CONFLICTED **0** · STALE **0**
- Edge kinds SOURCE_TRUTH **3087** · DERIVED_RULE **6777** · PERSONALIZED_DECISION **0** · UNKNOWN **4183**

### Entity degree

isolated 11 · exactly 1: 2921 · 2–4: 1177 · ≥5: 1403 · ≥10: 740 · ≥20: 100

### Relation classes

- DECISION_RELEVANT: 12636
- DESCRIPTIVE: 1226
- NAVIGATION_ONLY: 185
- UNKNOWN: 0

### Truth status (entities + relations)

- VERIFIED_PRIMARY: 0
- VERIFIED_SECONDARY: 5897
- TESTED: 0
- REPORTED: 0
- INFERRED: 145
- ESTIMATED: 3120
- STALE: 0
- UNKNOWN: 10397
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
- power_scenario: 42
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
- INDICATES: 201
- MAY_INDICATE: 192
- HAS_TIME_COMPONENT: 180
- HAS_COST_COMPONENT: 139
- ON_APPLIANCE: 131
- HAS_ERROR_CODE: 131
- IN_FAMILY: 131
- HAS_SCENARIO: 126
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
| fixcode | 1961 | 5894 | 3.01 | 3 | 2.4 | 0 | 835 | 236 | 0 | 52 | 20 |
| autospec | 435 | 506 | 1.16 | 1 | 0.77 | 0 | 25 | 22 | 0 | 60 | 63 |
| wearthere | 2383 | 6425 | 2.7 | 1 | 2.7 | 4 | 427 | 427 | 0 | 3 | 159 |
| chargematch | 175 | 533 | 3.05 | 2 | 3.02 | 4 | 36 | 34 | 0 | 152 | 74 |
| tripcost | 558 | 689 | 1.23 | 1 | 1.17 | 3 | 80 | 21 | 0 | 38 | 0 |

## Quality distribution (recomputed scores, not a previous report)

mean 63.4 · median 68 · p10 48 · p25 61 · p75 68 · p90 68 · min 38 · max 81

INDEXABLE mean 0 · min 0

Share of pages ≥90: **0%** — gate suspect: **false**

| Bucket | Count | % | INDEXABLE |
| --- | ---: | ---: | ---: |
| 0-49 | 123 | 12.5% | 0 |
| 50-59 | 120 | 12.2% | 0 |
| 60-69 | 716 | 72.8% | 0 |
| 70-79 | 18 | 1.8% | 0 |
| 80-84 | 7 | 0.7% | 0 |
| 85-89 | 0 | 0% | 0 |
| 90-94 | 0 | 0% | 0 |
| 95-100 | 0 | 0% | 0 |
