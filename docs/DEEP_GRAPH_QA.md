# Deep graph QA

Generated: 2026-09-13T00:27:20.484Z

Reference commit announced: `35f3633` — Expand the five catalogs with gated structured data.

PUBLIC_SITE_LIVE remains **false**. Global **noindex** remains on. Homepages were not redesigned. URL count was not a target.

## Verdict

These products are decision engines with thin but real graphs — not yet dense knowledge graphs, and not SEO-scale catalogs. They are no longer page-first keyword shells. They are also not ready to multiply URLs.

## 101. Before vs after

| Metric | Before (35f3633 announced) | After this pass |
| --- | --- | --- |
| Entities | 794 | 3088 |
| Relations | 1186 | 9682 |
| Decision relations | n/a (not measured) | 9628 |
| Relations / entity | 1.49 | 3.14 |
| Verified relations | n/a | 8971 |
| Inferred relations | n/a | 690 |
| Estimated relations | n/a | 871 |
| INDEXABLE | 890 | 817 |
| NOINDEX_PRODUCT | n/a | 73 |
| GRAPH_ONLY pages | n/a | 0 |
| Quality avg (INDEXABLE) | 90.2 | 82.4 |
| Quality min (INDEXABLE) | 80 | 75 |

A drop in INDEXABLE or in average quality is treated as success when it removes self-declared 90+ scores and unsupported claims.

## 102. Per product

| Product | Entities | Relations | Decision relations | Rel/entity | Indexable | Noindex product | Readiness |
| --- | --- | --- | --- | --- | --- | --- | --- |
| fixcode | 1672 | 4480 | 4464 | 2.68 | 244 | 5 | PRODUCT READY |
| autospec | 377 | 429 | 429 | 1.14 | 96 | 27 | DATA READY |
| wearthere | 431 | 3293 | 3293 | 7.64 | 416 | 0 | PRODUCT READY |
| chargematch | 112 | 982 | 982 | 8.77 | 42 | 22 | DATA READY |
| tripcost | 496 | 498 | 460 | 1 | 19 | 19 | PRODUCT READY |

## KPI block (all sites)

| KPI | Value |
| --- | --- |
| entity_count | 3088 |
| relation_count | 9682 |
| decision_relevant_relation_count | 9628 |
| relations_per_entity | 3.14 |
| decision_relations_per_entity | 3.12 |
| isolated_entity_count | 8 |
| single_relation_entity_count | 1016 |
| entities_with_3plus_relations | 1889 |
| entities_with_5plus_relations | 972 |
| entities_with_10plus_relations | 324 |
| verified_relation_count | 8971 |
| inferred_relation_count | 690 |
| estimated_relation_count | 871 |
| stale_relation_count | 0 |
| unknown_relation_count | 222 |

## 103. Quality distribution

| Bucket | Count | % of pages | Indexable in bucket |
| --- | --- | --- | --- |
| 0-49 | 0 | 0% | 0 |
| 50-59 | 0 | 0% | 0 |
| 60-69 | 6 | 0.7% | 0 |
| 70-79 | 201 | 22.6% | 134 |
| 80-89 | 683 | 76.7% | 683 |
| 90-100 | 0 | 0% | 0 |

Before this pass, INDEXABLE pages sat on an editorial floor of 80 with a mean of 90.2 — self-declared uniqueness and uncapped seed demand. Soft score now weights verified facts and decision relations; editorial demand is capped; word count / title uniqueness / internal links are not dimensions. A cluster in 70–84 is expected. A remaining pile-up in 80–84 is the editorial cap, not a claim of observed GSC quality.

## 104. Source table (entity + relation provenance records)

| Source type | Count |
| --- | --- |
| OFFICIAL | 0 |
| MANUFACTURER | 6936 |
| REGULATORY | 0 |
| TESTED | 0 |
| TRUSTED_THIRD_PARTY | 3722 |
| THIRD_PARTY | 2112 |
| USER_OBSERVED | 0 |
| USER_REPORTED | 0 |
| AI_INFERRED | 0 |

| Provenance coverage | % |
| --- | --- |
| Important facts/relations with any source | 100 |
| Important with primary source (official/mfr/regulatory/tested) | 56.9 |
| Pages with ≥1 primary source on an entity | 24.2 |
| Pages with ≥2 source types | 0 |

## 105–109. Domain coverage

```json
{
  "fixcode": {
    "brands": 4,
    "models": 36,
    "error_codes": 131,
    "symptoms": 98,
    "causes": 458,
    "tests": 155,
    "test_results": 312,
    "fixes": 458,
    "safety_relations": 458,
    "outcomes": 0
  },
  "autospec": {
    "models": 21,
    "generations": 21,
    "configurations": 21,
    "engines": 20,
    "fluids": 15,
    "services": 104,
    "components": 63,
    "markets": 2,
    "fitments": 24,
    "recalls": 21
  },
  "wearthere": {
    "destinations": 32,
    "climate_records": 384,
    "garments": 13,
    "packing_relations": 2909,
    "climate_kind": "CLIMATE_NORMAL"
  },
  "chargematch": {
    "devices": 22,
    "chargers": 10,
    "ports": 16,
    "cables": 3,
    "protocols": 6,
    "compatibility": 220,
    "expected_power": 660,
    "lab_measurements": 0
  },
  "tripcost": {
    "corridors": 19,
    "modes": 103,
    "cost_components": 139,
    "time_components": 180,
    "distances": 19,
    "volatile_cost_relations": 120,
    "evergreen_cost_relations": 19
  }
}
```

### Graph health by product

| Product | Rel/entity | Decision rel/entity | Verified % | Inferred % | Unknown % | Stale % | Isolated | Shallow | Connected | Rich | Avg relation quality |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| fixcode | 2.68 | 2.67 | 100 | 0 | 0 | 0 | 0 | 379 | 939 | 354 | 87 |
| autospec | 1.14 | 1.14 | 94.9 | 0.2 | 0 | 0 | 0 | 315 | 39 | 23 | 74 |
| wearthere | 7.64 | 7.64 | 100 | 0 | 0 | 0 | 4 | 0 | 84 | 343 | 81 |
| chargematch | 8.77 | 8.77 | 29.8 | 70.2 | 22.6 | 0 | 4 | 75 | 0 | 33 | 59 |
| tripcost | 1 | 0.93 | 100 | 0 | 0 | 0 | 0 | 422 | 41 | 33 | 77 |

Depth classes: ISOLATED (degree 0), SHALLOW (<3), CONNECTED, RICH (≥8 for decision types such as error_code / vehicle_configuration / device / charger / corridor / destination / historical_climate; ≥5 otherwise). Taxonomy nodes are not required to be RICH.

## 110. Top shallow high-value entities

### fixcode

No isolated/shallow decision entities in the priority types — remaining work is completeness of *relation quality*, not missing nodes.

### autospec

No isolated/shallow decision entities in the priority types — remaining work is completeness of *relation quality*, not missing nodes.

### wearthere

| Entity | Type | Degree | Depth |
| --- | --- | --- | --- |
| Tokyo month 1 typical climate | historical_climate | 7 | CONNECTED |
| Tokyo month 2 typical climate | historical_climate | 7 | CONNECTED |
| Tokyo month 12 typical climate | historical_climate | 7 | CONNECTED |
| Barcelona month 1 typical climate | historical_climate | 7 | CONNECTED |
| Barcelona month 2 typical climate | historical_climate | 7 | CONNECTED |
| Barcelona month 3 typical climate | historical_climate | 7 | CONNECTED |
| Barcelona month 4 typical climate | historical_climate | 7 | CONNECTED |
| Barcelona month 5 typical climate | historical_climate | 7 | CONNECTED |
| Barcelona month 6 typical climate | historical_climate | 7 | CONNECTED |
| Barcelona month 9 typical climate | historical_climate | 7 | CONNECTED |
| Barcelona month 10 typical climate | historical_climate | 7 | CONNECTED |
| Barcelona month 11 typical climate | historical_climate | 7 | CONNECTED |
| Barcelona month 12 typical climate | historical_climate | 7 | CONNECTED |
| Dubai month 1 typical climate | historical_climate | 7 | CONNECTED |
| Dubai month 2 typical climate | historical_climate | 7 | CONNECTED |
| Dubai month 12 typical climate | historical_climate | 7 | CONNECTED |
| Lisbon month 3 typical climate | historical_climate | 7 | CONNECTED |
| Lisbon month 4 typical climate | historical_climate | 7 | CONNECTED |
| Lisbon month 5 typical climate | historical_climate | 7 | CONNECTED |
| Lisbon month 6 typical climate | historical_climate | 7 | CONNECTED |

### chargematch

No isolated/shallow decision entities in the priority types — remaining work is completeness of *relation quality*, not missing nodes.

### tripcost

No isolated/shallow decision entities in the priority types — remaining work is completeness of *relation quality*, not missing nodes.

## 111. Top 20 opportunities (recommendations only — no pages auto-created)

| Site | Opportunity | Demand | Product value | Graph completeness |
| --- | --- | --- | --- | --- |
| fixcode | Verified outcome loop (what actually fixed it) — 0 VERIFIED rows | 90 | 95 | 5 |
| fixcode | Primary manufacturer PDF pages per error (not compiled notes) | 80 | 90 | 40 |
| autospec | Licensed VIN + market-specific oil rows beyond EU handbook compile | 88 | 92 | 35 |
| autospec | Fitment catalog with VERIFIED OEM part numbers (not oil/wiper only) | 85 | 90 | 20 |
| wearthere | Climate-normal source dataset citation (station IDs, 1991-2020 files) | 70 | 80 | 45 |
| wearthere | Garment thermal lab ratings (clo) instead of editorial 1-5 scales | 60 | 85 | 30 |
| chargematch | Lab MEASURED watts for popular pairs (Anker 100W × Steam Deck) | 85 | 95 | 0 |
| chargematch | Published C1+A allocation tables — currently ALLOCATION_UNKNOWN | 70 | 90 | 10 |
| tripcost | Live rail/flight fares with expiresAt — snapshot is not CURRENT | 90 | 95 | 25 |
| tripcost | Observed pump prices per corridor instead of one EUR/L snapshot | 75 | 80 | 20 |
| fixcode | GSC queries for error codes — demand is editorial | 50 | 70 | 0 |
| autospec | Recall freshness feed (NHTSA / manufacturer campaigns) | 70 | 85 | 15 |
| wearthere | Activity-specific packing graphs with measured volume/weight | 65 | 80 | 40 |
| chargematch | E-marker / cable certification registry | 60 | 85 | 20 |
| tripcost | Door-to-door observed times vs scheduled buffers | 55 | 75 | 35 |
| fixcode | Parts graph (FIX → REQUIRES → PART) with OEM SKUs | 80 | 88 | 15 |
| autospec | US vs EU market split on oil spec (LL-04 vs LL-01) | 75 | 90 | 40 |
| chargematch | PPS vs PD-only measured charge curves | 70 | 88 | 0 |
| wearthere | Airline cabin-bag live rules (currently LOW confidence snapshots) | 60 | 70 | 20 |
| tripcost | Party-size sensitivity tests published as traces, not new URLs | 50 | 80 | 55 |

## 113. Readiness

| Product | State | Why |
| --- | --- | --- |
| fixcode | PRODUCT READY | Diagnostic tree, SAFETY_CLASS, tests/results exist. Outcome store is empty (0 VERIFIED). Demand is editorial. Not SEO SCALE READY. |
| autospec | DATA READY | VehicleConfiguration identity (make→gen→engine→market) exists. VIN is a stub. Fitment catalog is thin. Not SEO SCALE READY. |
| wearthere | PRODUCT READY | CLIMATE_NORMAL provenance + garment properties + packing rules. Exact-date trips stay noindex. Climate source is compiled, not a station file. Not SEO SCALE READY. |
| chargematch | DATA READY | Ports, protocols, allocations, cable limits modelled. 0 lab MEASURED rows. C1+A unpublished on the 3C1A class. Not SEO SCALE READY. |
| tripcost | PRODUCT READY | Cash vs true cost, door-to-door buffers, party-size break-even, volatile vs evergreen facts. Fares are snapshots. Not SEO SCALE READY. |

None are SEO SCALE READY.

## Ultimate tests

- **fixcode:** Can explain likely cause from document-weighted priors + tests — not from observed repair rates.
- **autospec:** Can explain a HIGH/MEDIUM OEM row; cannot explain an arbitrary aftermarket part for MY exact VIN.
- **wearthere:** Can trace temperature/rain/activity → garment properties. Cannot cite a WMO station series.
- **chargematch:** Can name the bottleneck (device input / port allocation / cable). Cannot show measured watts.
- **tripcost:** Can explain why car is cheaper for N travellers from snapshot arithmetic. Cannot prove a live SNCF fare.

## LLM audit

| Class | Site | Function | Status |
| --- | --- | --- | --- |
| SHOULD_BE_DETERMINISTIC | autospec | oil / capacity lookup | deterministic graph lookup; no LLM |
| DANGEROUS | autospec | fitment | OEM row only; LLM compatibility is forbidden; LOW shows Possible fitment — verify. |
| SHOULD_BE_DETERMINISTIC | autospec | VIN decode | MockVinProvider stub — not a licensed VIN API |
| SHOULD_BE_DETERMINISTIC | wearthere | climate normals | compiled monthly normals (CLIMATE_NORMAL) |
| OPTIONAL | wearthere | Open-Meteo forecast | live HTTP optional; never mixed into climate normals |
| SHOULD_BE_DETERMINISTIC | wearthere | packing optimizer | packing-v1 property rules |
| SHOULD_BE_DETERMINISTIC | chargematch | USB-PD compatibility | compatibility-v2 min(device,port,cable); evidence never MEASURED without lab |
| SHOULD_BE_DETERMINISTIC | chargematch | lab watt measurement | not present; EXPECTED_POWER is INFERRED overlap |
| SHOULD_BE_DETERMINISTIC | tripcost | route compare | tripcost-v1 seed fares + door-to-door buffers |
| DANGEROUS | tripcost | live transport price | LLM must not invent current fares; snapshot labelled, stale ≠ current |
| SHOULD_BE_DETERMINISTIC | fixcode | diagnose() | diagnostic-v3 document priors; % hidden until VERIFIED outcomes |
| DANGEROUS | fixcode | repair probability without evidence | priors are document weights; labels High/Medium/Possible only |
| OPTIONAL | fixcode | explainDiagnosis | template over ranked causes; no model call in this pass |
| GOOD_USE | fixcode | visionGuard / scan | upload gated; vision not executed without confirmation |

## 82–84. Sampled pages (10 per product) + nearest siblings

### fixcode

#### /fixcode/bosch/washer/f43-error

- score 83 · INDEXABLE · intent family `fixcode:error:Bosch:Washer:F43`
- This page is indexable because hard gates passed for family error-code, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 83 is secondary and demand 16 is not claimed as GSC. Distinct structured reason: fix:bosch:washer:f43. Title uniqueness is not used as proof.
- facts: meaning, models
- sources: MANUFACTURER:bosch-support
- relations: ON_APPLIANCE, HAS_ERROR_CODE, OBSERVED_ON_MODEL, HAS_ERROR, MAY_BE_CAUSED_BY, INDICATES, MAY_INDICATE (14 decision-relevant)
- demand 16 (editorial unless GSC is wired) · confidence HIGH
- distinct_reason (not title uniqueness): fix:bosch:washer:f43
- nearest 5:
  - 0.5 /fixcode/bosch/washer/f44-error
  - 0.4 /fixcode/samsung/washer/3c-error
  - 0.4 /fixcode/samsung/washer/3e-error
  - 0.4 /fixcode/samsung/washer/3c1-error
  - 0.4 /fixcode/samsung/washer/3c3-error

#### /fixcode/lg/washer/not-heating

- score 77 · INDEXABLE · intent family `fixcode:symptom:fix:lg:washer:not-heating`
- This page is indexable because hard gates passed for family symptom, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 77 is secondary and demand 25 is not claimed as GSC. Distinct structured reason: fix:lg:washer:not-heating. Title uniqueness is not used as proof.
- facts: likely_codes
- sources: THIRD_PARTY:fixcode-service-corpus
- relations: INDICATES, MAY_INDICATE (2 decision-relevant)
- demand 25 (editorial unless GSC is wired) · confidence MEDIUM
- distinct_reason (not title uniqueness): fix:lg:washer:not-heating
- nearest 5:
  - 0.714 /fixcode/samsung/washer/not-heating
  - 0.714 /fixcode/lg/dishwasher/not-heating
  - 0.714 /fixcode/bosch/washer/not-heating
  - 0.714 /fixcode/miele/washer/not-heating
  - 0.571 /fixcode/samsung/dishwasher/not-heating

#### /fixcode/miele/washer/not-heating

- score 76 · INDEXABLE · intent family `fixcode:symptom:fix:miele:washer:not-heating`
- This page is indexable because hard gates passed for family symptom, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 76 is secondary and demand 19 is not claimed as GSC. Distinct structured reason: fix:miele:washer:not-heating. Title uniqueness is not used as proof.
- facts: likely_codes
- sources: THIRD_PARTY:fixcode-service-corpus
- relations: INDICATES, MAY_INDICATE (4 decision-relevant)
- demand 19 (editorial unless GSC is wired) · confidence MEDIUM
- distinct_reason (not title uniqueness): fix:miele:washer:not-heating
- nearest 5:
  - 0.714 /fixcode/samsung/washer/not-heating
  - 0.714 /fixcode/lg/washer/not-heating
  - 0.714 /fixcode/bosch/washer/not-heating
  - 0.714 /fixcode/miele/dishwasher/not-heating
  - 0.571 /fixcode/samsung/dishwasher/not-heating

#### /fixcode/bosch/dishwasher/e22-error

- score 83 · INDEXABLE · intent family `fixcode:error:Bosch:Dishwasher:E22`
- This page is indexable because hard gates passed for family error-code, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 83 is secondary and demand 26 is not claimed as GSC. Distinct structured reason: fix:bosch:dishwasher:e22. Title uniqueness is not used as proof.
- facts: meaning, models
- sources: MANUFACTURER:bosch-support
- relations: ON_APPLIANCE, HAS_ERROR_CODE, OBSERVED_ON_MODEL, HAS_ERROR, MAY_BE_CAUSED_BY, INDICATES, MAY_INDICATE (15 decision-relevant)
- demand 26 (editorial unless GSC is wired) · confidence HIGH
- distinct_reason (not title uniqueness): fix:bosch:dishwasher:e22
- nearest 5:
  - 0.5 /fixcode/bosch/dishwasher/e24-error
  - 0.4 /fixcode/bosch/washer/e18-error
  - 0.4 /fixcode/samsung/dishwasher/5e-error
  - 0.4 /fixcode/lg/dishwasher/oe-error
  - 0.4 /fixcode/miele/dishwasher/f11-error

#### /fixcode/bosch/washer/wont-spin

- score 78 · INDEXABLE · intent family `fixcode:symptom:fix:bosch:washer:wont-spin`
- This page is indexable because hard gates passed for family symptom, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 78 is secondary and demand 17 is not claimed as GSC. Distinct structured reason: fix:bosch:washer:wont-spin. Title uniqueness is not used as proof.
- facts: likely_codes
- sources: THIRD_PARTY:fixcode-service-corpus
- relations: INDICATES, MAY_INDICATE (4 decision-relevant)
- demand 17 (editorial unless GSC is wired) · confidence MEDIUM
- distinct_reason (not title uniqueness): fix:bosch:washer:wont-spin
- nearest 5:
  - 0.714 /fixcode/lg/washer/wont-spin
  - 0.714 /fixcode/bosch/dishwasher/wont-spin
  - 0.571 /fixcode/samsung/washer/shakes
  - 0.571 /fixcode/samsung/dishwasher/wont-spin
  - 0.571 /fixcode/samsung/dryer/wont-spin

#### /fixcode/samsung/fridge/of-error

- score 78 · INDEXABLE · intent family `fixcode:error:Samsung:Fridge:OF`
- This page is indexable because hard gates passed for family error-code, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 78 is secondary and demand 14 is not claimed as GSC. Distinct structured reason: fix:samsung:fridge:of. Title uniqueness is not used as proof.
- facts: meaning, models
- sources: MANUFACTURER:samsung-support
- relations: ON_APPLIANCE, HAS_ERROR_CODE, OBSERVED_ON_MODEL, HAS_ERROR, MAY_BE_CAUSED_BY, INDICATES, MAY_INDICATE (11 decision-relevant)
- demand 14 (editorial unless GSC is wired) · confidence MEDIUM
- distinct_reason (not title uniqueness): fix:samsung:fridge:of
- nearest 5:
  - 0.5 /fixcode/samsung/fridge/22e-error
  - 0.5 /fixcode/samsung/fridge/88-error
  - 0.4 /fixcode/lg/fridge/f-error
  - 0.2 /fixcode/samsung/fridge/5e-error
  - 0.2 /fixcode/samsung/washer/not-draining

#### /fixcode/samsung/dishwasher/wont-spin

- score 78 · INDEXABLE · intent family `fixcode:symptom:fix:samsung:dishwasher:wont-spin`
- This page is indexable because hard gates passed for family symptom, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 78 is secondary and demand 18 is not claimed as GSC. Distinct structured reason: fix:samsung:dishwasher:wont-spin. Title uniqueness is not used as proof.
- facts: likely_codes
- sources: THIRD_PARTY:fixcode-service-corpus
- relations: INDICATES, MAY_INDICATE (2 decision-relevant)
- demand 18 (editorial unless GSC is wired) · confidence MEDIUM
- distinct_reason (not title uniqueness): fix:samsung:dishwasher:wont-spin
- nearest 5:
  - 0.714 /fixcode/samsung/dryer/wont-spin
  - 0.714 /fixcode/lg/dishwasher/wont-spin
  - 0.714 /fixcode/bosch/dishwasher/wont-spin
  - 0.714 /fixcode/miele/dishwasher/wont-spin
  - 0.571 /fixcode/samsung/washer/shakes

#### /fixcode/lg/washer/fe-error

- score 83 · INDEXABLE · intent family `fixcode:error:LG:Washer:FE`
- This page is indexable because hard gates passed for family error-code, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 83 is secondary and demand 26 is not claimed as GSC. Distinct structured reason: fix:lg:washer:fe. Title uniqueness is not used as proof.
- facts: meaning, models
- sources: MANUFACTURER:lg-support
- relations: ON_APPLIANCE, HAS_ERROR_CODE, OBSERVED_ON_MODEL, HAS_ERROR, MAY_BE_CAUSED_BY, INDICATES, MAY_INDICATE (13 decision-relevant)
- demand 26 (editorial unless GSC is wired) · confidence HIGH
- distinct_reason (not title uniqueness): fix:lg:washer:fe
- nearest 5:
  - 0.7 /fixcode/lg/dishwasher/fe-error
  - 0.4 /fixcode/samsung/washer/oe-error
  - 0.3 /fixcode/samsung/dishwasher/oe-error
  - 0.2 /fixcode/lg/washer/ie-error
  - 0.2 /fixcode/lg/washer/oe-error

#### /fixcode/samsung/dishwasher/he-error

- score 82 · INDEXABLE · intent family `fixcode:error:Samsung:Dishwasher:HE`
- This page is indexable because hard gates passed for family error-code, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 82 is secondary and demand 21 is not claimed as GSC. Distinct structured reason: fix:samsung:dishwasher:he. Title uniqueness is not used as proof.
- facts: meaning, models
- sources: MANUFACTURER:samsung-support
- relations: ON_APPLIANCE, HAS_ERROR_CODE, OBSERVED_ON_MODEL, HAS_ERROR, MAY_BE_CAUSED_BY, INDICATES, MAY_INDICATE (13 decision-relevant)
- demand 21 (editorial unless GSC is wired) · confidence HIGH
- distinct_reason (not title uniqueness): fix:samsung:dishwasher:he
- nearest 5:
  - 0.8 /fixcode/lg/dishwasher/he-error
  - 0.5 /fixcode/samsung/washer/he-error
  - 0.5 /fixcode/samsung/dryer/he-error
  - 0.4 /fixcode/bosch/dishwasher/e09-error
  - 0.4 /fixcode/bosch/dishwasher/e01-error

#### /fixcode/bosch/dishwasher/e11-error

- score 82 · INDEXABLE · intent family `fixcode:error:Bosch:Dishwasher:E11`
- This page is indexable because hard gates passed for family error-code, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 82 is secondary and demand 19 is not claimed as GSC. Distinct structured reason: fix:bosch:dishwasher:e11. Title uniqueness is not used as proof.
- facts: meaning, models
- sources: MANUFACTURER:bosch-support
- relations: ON_APPLIANCE, HAS_ERROR_CODE, OBSERVED_ON_MODEL, HAS_ERROR, MAY_BE_CAUSED_BY, INDICATES, MAY_INDICATE (13 decision-relevant)
- demand 19 (editorial unless GSC is wired) · confidence HIGH
- distinct_reason (not title uniqueness): fix:bosch:dishwasher:e11
- nearest 5:
  - 0.5 /fixcode/bosch/dishwasher/e06-error
  - 0.5 /fixcode/bosch/dishwasher/e13-error
  - 0.4 /fixcode/samsung/dishwasher/te-error
  - 0.4 /fixcode/lg/dishwasher/te-error
  - 0.3 /fixcode/samsung/washer/te-error

### autospec

#### /autospec/volkswagen/golf/mk8/2-0-tdi/tyres

- score 74 · NOINDEX_PRODUCT · intent family `autospec:tyre-pressure:DTSA / similar EA288 evo — confirm on data sticker-tyres`
- Not indexable (NOINDEX_PRODUCT). Soft score 74 cannot override a failed hard gate. The record can still power the product or remain graph-only.
- facts: engine, years, market_scope
- sources: THIRD_PARTY:oem-handbook
- relations: IS_CONFIGURATION_OF, USES_ENGINE, OIL_CAPACITY, SOLD_IN, HAS_SERVICE_INTERVAL, SUBJECT_TO_RECALL, FITS, HAS_COMPONENT, USES_TRANSMISSION, HAS_BATTERY, HAS_WIPERS, COVERS_YEARS (16 decision-relevant)
- demand 29 (editorial unless GSC is wired) · confidence MEDIUM
- distinct_reason (not title uniqueness): DTSA / similar EA288 evo — confirm on data sticker-tyres
- nearest 5:
  - 0.333 /autospec/toyota/corolla/e210/1-8-hybrid/tyres
  - 0.333 /autospec/audi/a4/b9/2-0-tdi/tyres
  - 0.333 /autospec/ford/focus/mk4/1-0-ecoboost/tyres
  - 0.333 /autospec/peugeot/308/t9/1-2-puretech/tyres
  - 0.222 /autospec/bmw/3-series/g20/320d-b47/tyres

#### /autospec/honda/civic/11/1-5-vtec/maintenance

- score 81 · INDEXABLE · intent family `autospec:maintenance-schedule:L15C-maint`
- This page is indexable because hard gates passed for family maintenance-schedule, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 81 is secondary and demand 32 is not claimed as GSC. Distinct structured reason: L15C-maint. Title uniqueness is not used as proof.
- facts: engine, years, market_scope
- sources: THIRD_PARTY:oem-handbook
- relations: IS_CONFIGURATION_OF, USES_ENGINE, OIL_CAPACITY, SOLD_IN, HAS_SERVICE_INTERVAL, SUBJECT_TO_RECALL, FITS, HAS_COMPONENT, USES_TRANSMISSION, HAS_BATTERY, HAS_WIPERS, COVERS_YEARS (17 decision-relevant)
- demand 32 (editorial unless GSC is wired) · confidence HIGH
- distinct_reason (not title uniqueness): L15C-maint
- nearest 5:
  - 0.2 /autospec/bmw/3-series/g20/320d-b47
  - 0.2 /autospec/bmw/3-series/g20/320d-b47/oil
  - 0.2 /autospec/bmw/3-series/g20/320d-b47/tyres
  - 0.2 /autospec/bmw/3-series/g20/320d-b47/battery
  - 0.2 /autospec/bmw/3-series/g20/320d-b47/problems

#### /autospec/tesla/model-3/highland/rwd

- score 84 · INDEXABLE · intent family `autospec:vehicle-hub:veh:tesla:model-3:highland:rwd`
- This page is indexable because hard gates passed for family vehicle-hub, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 84 is secondary and demand 82 is not claimed as GSC. Distinct structured reason: veh:tesla:model-3:highland:rwd. Title uniqueness is not used as proof.
- facts: engine, years, market_scope
- sources: THIRD_PARTY:oem-handbook
- relations: IS_CONFIGURATION_OF, USES_ENGINE, SOLD_IN, HAS_SERVICE_INTERVAL, SUBJECT_TO_RECALL, FITS, HAS_COMPONENT, USES_TRANSMISSION, HAS_BATTERY, HAS_WIPERS, COVERS_YEARS (15 decision-relevant)
- demand 82 (editorial unless GSC is wired) · confidence MEDIUM
- distinct_reason (not title uniqueness): veh:tesla:model-3:highland:rwd
- nearest 5:
  - 0.2 /autospec/bmw/3-series/g20/320d-b47/oil
  - 0.2 /autospec/bmw/3-series/g20/320d-b47/tyres
  - 0.2 /autospec/bmw/3-series/g20/320d-b47/battery
  - 0.2 /autospec/bmw/3-series/g20/320d-b47/maintenance
  - 0.2 /autospec/bmw/3-series/g20/320d-b47/problems

#### /autospec/volvo/xc60/spa/t8-recharge

- score 84 · INDEXABLE · intent family `autospec:vehicle-hub:veh:volvo:xc60:t8:recharge`
- This page is indexable because hard gates passed for family vehicle-hub, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 84 is secondary and demand 82 is not claimed as GSC. Distinct structured reason: veh:volvo:xc60:t8:recharge. Title uniqueness is not used as proof.
- facts: engine, years, market_scope
- sources: THIRD_PARTY:oem-handbook
- relations: IS_CONFIGURATION_OF, USES_ENGINE, OIL_CAPACITY, SOLD_IN, HAS_SERVICE_INTERVAL, SUBJECT_TO_RECALL, FITS, HAS_COMPONENT, USES_TRANSMISSION, HAS_BATTERY, HAS_WIPERS, COVERS_YEARS (16 decision-relevant)
- demand 82 (editorial unless GSC is wired) · confidence HIGH
- distinct_reason (not title uniqueness): veh:volvo:xc60:t8:recharge
- nearest 5:
  - 0.2 /autospec/bmw/3-series/g20/320d-b47/oil
  - 0.2 /autospec/bmw/3-series/g20/320d-b47/tyres
  - 0.2 /autospec/bmw/3-series/g20/320d-b47/battery
  - 0.2 /autospec/bmw/3-series/g20/320d-b47/maintenance
  - 0.2 /autospec/bmw/3-series/g20/320d-b47/problems

#### /autospec/bmw/3-series/g20/320d-b47/tyres

- score 78 · INDEXABLE · intent family `autospec:tyre-pressure:B47D20-tyres`
- This page is indexable because hard gates passed for family tyre-pressure, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 78 is secondary and demand 29 is not claimed as GSC. Distinct structured reason: B47D20-tyres. Title uniqueness is not used as proof.
- facts: engine, years, market_scope
- sources: THIRD_PARTY:oem-handbook
- relations: IS_CONFIGURATION_OF, USES_ENGINE, OIL_CAPACITY, SOLD_IN, HAS_SERVICE_INTERVAL, SUBJECT_TO_RECALL, FITS, HAS_COMPONENT, USES_TRANSMISSION, HAS_BATTERY, HAS_WIPERS, COVERS_YEARS (24 decision-relevant)
- demand 29 (editorial unless GSC is wired) · confidence HIGH
- distinct_reason (not title uniqueness): B47D20-tyres
- nearest 5:
  - 0.222 /autospec/toyota/corolla/e210/1-8-hybrid/tyres
  - 0.222 /autospec/volkswagen/golf/mk8/2-0-tdi/tyres
  - 0.222 /autospec/mercedes/c-class/w206/c220d/tyres
  - 0.222 /autospec/audi/a4/b9/2-0-tdi/tyres
  - 0.222 /autospec/hyundai/tucson/nx4/1-6-hybrid/tyres

#### /autospec/volvo/xc60/spa/t8-recharge/oil

- score 81 · INDEXABLE · intent family `autospec:oil:veh:volvo:xc60:t8:recharge`
- This page is indexable because hard gates passed for family oil-type, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 81 is secondary and demand 35 is not claimed as GSC. Distinct structured reason: B420-oil. Title uniqueness is not used as proof.
- facts: engine, years, market_scope
- sources: THIRD_PARTY:oem-handbook
- relations: IS_CONFIGURATION_OF, USES_ENGINE, OIL_CAPACITY, SOLD_IN, HAS_SERVICE_INTERVAL, SUBJECT_TO_RECALL, FITS, HAS_COMPONENT, USES_TRANSMISSION, HAS_BATTERY, HAS_WIPERS, COVERS_YEARS (16 decision-relevant)
- demand 35 (editorial unless GSC is wired) · confidence HIGH
- distinct_reason (not title uniqueness): B420-oil
- nearest 5:
  - 0.25 /autospec/hyundai/tucson/nx4/1-6-hybrid/oil
  - 0.25 /autospec/kia/sportage/nq5/1-6-hybrid/oil
  - 0.25 /autospec/volkswagen/polo/aw/1-0-tsi/oil
  - 0.25 /autospec/honda/cr-v/rw/2-0-hybrid/oil
  - 0.2 /autospec/bmw/3-series/g20/320d-b47

#### /autospec/ford/focus/mk4/1-0-ecoboost

- score 84 · INDEXABLE · intent family `autospec:vehicle-hub:veh:ford:focus:mk4:1-0-ecoboost`
- This page is indexable because hard gates passed for family vehicle-hub, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 84 is secondary and demand 82 is not claimed as GSC. Distinct structured reason: veh:ford:focus:mk4:1-0-ecoboost. Title uniqueness is not used as proof.
- facts: engine, years, market_scope
- sources: THIRD_PARTY:oem-handbook
- relations: IS_CONFIGURATION_OF, USES_ENGINE, OIL_CAPACITY, SOLD_IN, HAS_SERVICE_INTERVAL, SUBJECT_TO_RECALL, FITS, HAS_COMPONENT, USES_TRANSMISSION, HAS_BATTERY, HAS_WIPERS, COVERS_YEARS (17 decision-relevant)
- demand 82 (editorial unless GSC is wired) · confidence MEDIUM
- distinct_reason (not title uniqueness): veh:ford:focus:mk4:1-0-ecoboost
- nearest 5:
  - 0.2 /autospec/bmw/3-series/g20/320d-b47
  - 0.2 /autospec/bmw/3-series/g20/320d-b47/oil
  - 0.2 /autospec/bmw/3-series/g20/320d-b47/tyres
  - 0.2 /autospec/bmw/3-series/g20/320d-b47/battery
  - 0.2 /autospec/bmw/3-series/g20/320d-b47/maintenance

#### /autospec/hyundai/tucson/nx4/1-6-hybrid

- score 84 · INDEXABLE · intent family `autospec:vehicle-hub:veh:hyundai:tucson:nx4:1-6-hybrid`
- This page is indexable because hard gates passed for family vehicle-hub, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 84 is secondary and demand 82 is not claimed as GSC. Distinct structured reason: veh:hyundai:tucson:nx4:1-6-hybrid. Title uniqueness is not used as proof.
- facts: engine, years, market_scope
- sources: THIRD_PARTY:oem-handbook
- relations: IS_CONFIGURATION_OF, USES_ENGINE, SOLD_IN, HAS_SERVICE_INTERVAL, SUBJECT_TO_RECALL, FITS, HAS_COMPONENT, USES_TRANSMISSION, HAS_BATTERY, HAS_WIPERS, COVERS_YEARS, HAS_ISSUE (16 decision-relevant)
- demand 82 (editorial unless GSC is wired) · confidence HIGH
- distinct_reason (not title uniqueness): veh:hyundai:tucson:nx4:1-6-hybrid
- nearest 5:
  - 0.4 /autospec/kia/sportage/nq5/1-6-hybrid
  - 0.2 /autospec/bmw/3-series/g20/320d-b47/oil
  - 0.2 /autospec/bmw/3-series/g20/320d-b47/tyres
  - 0.2 /autospec/bmw/3-series/g20/320d-b47/battery
  - 0.2 /autospec/bmw/3-series/g20/320d-b47/maintenance

#### /autospec/volkswagen/golf/mk8/2-0-tdi/battery

- score 74 · NOINDEX_PRODUCT · intent family `autospec:battery:DTSA / similar EA288 evo — confirm on data sticker-battery`
- Not indexable (NOINDEX_PRODUCT). Soft score 74 cannot override a failed hard gate. The record can still power the product or remain graph-only.
- facts: engine, years, market_scope
- sources: THIRD_PARTY:oem-handbook
- relations: IS_CONFIGURATION_OF, USES_ENGINE, OIL_CAPACITY, SOLD_IN, HAS_SERVICE_INTERVAL, SUBJECT_TO_RECALL, FITS, HAS_COMPONENT, USES_TRANSMISSION, HAS_BATTERY, HAS_WIPERS, COVERS_YEARS (16 decision-relevant)
- demand 26 (editorial unless GSC is wired) · confidence MEDIUM
- distinct_reason (not title uniqueness): DTSA / similar EA288 evo — confirm on data sticker-battery
- nearest 5:
  - 0.286 /autospec/audi/a4/b9/2-0-tdi/battery
  - 0.286 /autospec/volvo/xc60/spa/t8-recharge/battery
  - 0.2 /autospec/bmw/3-series/g20/320d-b47
  - 0.2 /autospec/bmw/3-series/g20/320d-b47/oil
  - 0.2 /autospec/bmw/3-series/g20/320d-b47/tyres

#### /autospec/toyota/corolla/e210/1-8-hybrid

- score 84 · INDEXABLE · intent family `autospec:vehicle-hub:veh:toyota:corolla:e210:1-8-hybrid`
- This page is indexable because hard gates passed for family vehicle-hub, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 84 is secondary and demand 82 is not claimed as GSC. Distinct structured reason: veh:toyota:corolla:e210:1-8-hybrid. Title uniqueness is not used as proof.
- facts: engine, years, market_scope
- sources: THIRD_PARTY:oem-handbook
- relations: IS_CONFIGURATION_OF, USES_ENGINE, OIL_CAPACITY, SOLD_IN, HAS_SERVICE_INTERVAL, SUBJECT_TO_RECALL, FITS, HAS_COMPONENT, USES_TRANSMISSION, HAS_BATTERY, HAS_WIPERS, COVERS_YEARS (17 decision-relevant)
- demand 82 (editorial unless GSC is wired) · confidence HIGH
- distinct_reason (not title uniqueness): veh:toyota:corolla:e210:1-8-hybrid
- nearest 5:
  - 0.2 /autospec/bmw/3-series/g20/320d-b47/oil
  - 0.2 /autospec/bmw/3-series/g20/320d-b47/tyres
  - 0.2 /autospec/bmw/3-series/g20/320d-b47/battery
  - 0.2 /autospec/bmw/3-series/g20/320d-b47/maintenance
  - 0.2 /autospec/bmw/3-series/g20/320d-b47/problems

### wearthere

#### /wearthere/bangkok/january/what-to-wear

- score 84 · INDEXABLE · intent family `wearthere:wear:bangkok:1`
- This page is indexable because hard gates passed for family wear-month, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 84 is secondary and demand 33 is not claimed as GSC. Distinct structured reason: bangkok-1. Title uniqueness is not used as proof.
- facts: country, lat, lon
- sources: TRUSTED_THIRD_PARTY:climate-normals-compiled
- relations: TYPICAL_CLIMATE (12 decision-relevant)
- demand 33 (editorial unless GSC is wired) · confidence HIGH
- distinct_reason (not title uniqueness): bangkok-1
- nearest 5:
  - 0.6 /wearthere/bangkok/february/what-to-wear
  - 0.6 /wearthere/bangkok/july/what-to-wear
  - 0.6 /wearthere/bangkok/august/what-to-wear
  - 0.6 /wearthere/bangkok/september/what-to-wear
  - 0.6 /wearthere/bangkok/december/what-to-wear

#### /wearthere/chicago/november/what-to-wear

- score 84 · INDEXABLE · intent family `wearthere:wear:chicago:11`
- This page is indexable because hard gates passed for family wear-month, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 84 is secondary and demand 31 is not claimed as GSC. Distinct structured reason: chicago-11. Title uniqueness is not used as proof.
- facts: country, lat, lon
- sources: TRUSTED_THIRD_PARTY:climate-normals-compiled
- relations: TYPICAL_CLIMATE (12 decision-relevant)
- demand 31 (editorial unless GSC is wired) · confidence HIGH
- distinct_reason (not title uniqueness): chicago-11
- nearest 5:
  - 0.667 /wearthere/berlin/november/what-to-wear
  - 0.667 /wearthere/chicago/august/what-to-wear
  - 0.667 /wearthere/edinburgh/november/what-to-wear
  - 0.6 /wearthere/paris/february/what-to-wear
  - 0.6 /wearthere/new-york/november/what-to-wear

#### /wearthere/seoul/april/what-to-wear

- score 84 · INDEXABLE · intent family `wearthere:wear:seoul:4`
- This page is indexable because hard gates passed for family wear-month, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 84 is secondary and demand 34 is not claimed as GSC. Distinct structured reason: seoul-4. Title uniqueness is not used as proof.
- facts: country, lat, lon
- sources: TRUSTED_THIRD_PARTY:climate-normals-compiled
- relations: TYPICAL_CLIMATE (12 decision-relevant)
- demand 34 (editorial unless GSC is wired) · confidence HIGH
- distinct_reason (not title uniqueness): seoul-4
- nearest 5:
  - 0.667 /wearthere/seoul/september/what-to-wear
  - 0.667 /wearthere/istanbul/april/what-to-wear
  - 0.667 /wearthere/florence/april/what-to-wear
  - 0.6 /wearthere/paris/april/what-to-wear
  - 0.6 /wearthere/rome/april/what-to-wear

#### /wearthere/lisbon/september/what-to-wear

- score 84 · INDEXABLE · intent family `wearthere:wear:lisbon:9`
- This page is indexable because hard gates passed for family wear-month, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 84 is secondary and demand 32 is not claimed as GSC. Distinct structured reason: lisbon-9. Title uniqueness is not used as proof.
- facts: country, lat, lon
- sources: TRUSTED_THIRD_PARTY:climate-normals-compiled
- relations: TYPICAL_CLIMATE (12 decision-relevant)
- demand 32 (editorial unless GSC is wired) · confidence HIGH
- distinct_reason (not title uniqueness): lisbon-9
- nearest 5:
  - 0.6 /wearthere/barcelona/september/what-to-wear
  - 0.6 /wearthere/lisbon/january/what-to-wear
  - 0.6 /wearthere/lisbon/february/what-to-wear
  - 0.6 /wearthere/lisbon/march/what-to-wear
  - 0.6 /wearthere/lisbon/april/what-to-wear

#### /wearthere/madrid/november/what-to-wear

- score 84 · INDEXABLE · intent family `wearthere:wear:madrid:11`
- This page is indexable because hard gates passed for family wear-month, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 84 is secondary and demand 32 is not claimed as GSC. Distinct structured reason: madrid-11. Title uniqueness is not used as proof.
- facts: country, lat, lon
- sources: TRUSTED_THIRD_PARTY:climate-normals-compiled
- relations: TYPICAL_CLIMATE (12 decision-relevant)
- demand 32 (editorial unless GSC is wired) · confidence HIGH
- distinct_reason (not title uniqueness): madrid-11
- nearest 5:
  - 0.733 /wearthere/madrid/october/what-to-wear
  - 0.667 /wearthere/madrid/march/what-to-wear
  - 0.667 /wearthere/madrid/april/what-to-wear
  - 0.667 /wearthere/madrid/december/what-to-wear
  - 0.667 /wearthere/seoul/november/what-to-wear

#### /wearthere/barcelona/march/what-to-wear

- score 84 · INDEXABLE · intent family `wearthere:wear:barcelona:3`
- This page is indexable because hard gates passed for family wear-month, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 84 is secondary and demand 34 is not claimed as GSC. Distinct structured reason: barcelona-3. Title uniqueness is not used as proof.
- facts: country, lat, lon
- sources: TRUSTED_THIRD_PARTY:climate-normals-compiled
- relations: TYPICAL_CLIMATE (12 decision-relevant)
- demand 34 (editorial unless GSC is wired) · confidence HIGH
- distinct_reason (not title uniqueness): barcelona-3
- nearest 5:
  - 0.733 /wearthere/barcelona/february/what-to-wear
  - 0.667 /wearthere/barcelona/january/what-to-wear
  - 0.667 /wearthere/barcelona/november/what-to-wear
  - 0.667 /wearthere/barcelona/december/what-to-wear
  - 0.6 /wearthere/barcelona/april/what-to-wear

#### /wearthere/reykjavik/february/what-to-wear

- score 84 · INDEXABLE · intent family `wearthere:wear:reykjavik:2`
- This page is indexable because hard gates passed for family wear-month, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 84 is secondary and demand 29 is not claimed as GSC. Distinct structured reason: reykjavik-2. Title uniqueness is not used as proof.
- facts: country, lat, lon
- sources: TRUSTED_THIRD_PARTY:climate-normals-compiled
- relations: TYPICAL_CLIMATE (12 decision-relevant)
- demand 29 (editorial unless GSC is wired) · confidence HIGH
- distinct_reason (not title uniqueness): reykjavik-2
- nearest 5:
  - 0.733 /wearthere/reykjavik/january/what-to-wear
  - 0.6 /wearthere/reykjavik/november/what-to-wear
  - 0.6 /wearthere/reykjavik/december/what-to-wear
  - 0.533 /wearthere/reykjavik/march/what-to-wear
  - 0.533 /wearthere/reykjavik/september/what-to-wear

#### /wearthere/istanbul/june/what-to-wear

- score 84 · INDEXABLE · intent family `wearthere:wear:istanbul:6`
- This page is indexable because hard gates passed for family wear-month, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 84 is secondary and demand 34 is not claimed as GSC. Distinct structured reason: istanbul-6. Title uniqueness is not used as proof.
- facts: country, lat, lon
- sources: TRUSTED_THIRD_PARTY:climate-normals-compiled
- relations: TYPICAL_CLIMATE (12 decision-relevant)
- demand 34 (editorial unless GSC is wired) · confidence HIGH
- distinct_reason (not title uniqueness): istanbul-6
- nearest 5:
  - 0.6 /wearthere/lisbon/june/what-to-wear
  - 0.6 /wearthere/istanbul/august/what-to-wear
  - 0.533 /wearthere/rome/june/what-to-wear
  - 0.533 /wearthere/madrid/june/what-to-wear
  - 0.533 /wearthere/madrid/september/what-to-wear

#### /wearthere/hong-kong/may/what-to-wear

- score 84 · INDEXABLE · intent family `wearthere:wear:hong-kong:5`
- This page is indexable because hard gates passed for family wear-month, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 84 is secondary and demand 34 is not claimed as GSC. Distinct structured reason: hong-kong-5. Title uniqueness is not used as proof.
- facts: country, lat, lon
- sources: TRUSTED_THIRD_PARTY:climate-normals-compiled
- relations: TYPICAL_CLIMATE (12 decision-relevant)
- demand 34 (editorial unless GSC is wired) · confidence HIGH
- distinct_reason (not title uniqueness): hong-kong-5
- nearest 5:
  - 0.6 /wearthere/hong-kong/june/what-to-wear
  - 0.6 /wearthere/hong-kong/july/what-to-wear
  - 0.6 /wearthere/hong-kong/august/what-to-wear
  - 0.533 /wearthere/seoul/july/what-to-wear
  - 0.533 /wearthere/singapore/october/what-to-wear

#### /wearthere/edinburgh/october/what-to-wear

- score 84 · INDEXABLE · intent family `wearthere:wear:edinburgh:10`
- This page is indexable because hard gates passed for family wear-month, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 84 is secondary and demand 30 is not claimed as GSC. Distinct structured reason: edinburgh-10. Title uniqueness is not used as proof.
- facts: country, lat, lon
- sources: TRUSTED_THIRD_PARTY:climate-normals-compiled
- relations: TYPICAL_CLIMATE (12 decision-relevant)
- demand 30 (editorial unless GSC is wired) · confidence HIGH
- distinct_reason (not title uniqueness): edinburgh-10
- nearest 5:
  - 0.667 /wearthere/dublin/october/what-to-wear
  - 0.667 /wearthere/edinburgh/january/what-to-wear
  - 0.667 /wearthere/edinburgh/may/what-to-wear
  - 0.667 /wearthere/edinburgh/november/what-to-wear
  - 0.667 /wearthere/edinburgh/december/what-to-wear

### chargematch

#### /chargematch/macbook-pro-14-m3/with/anker-65w

- score 81 · INDEXABLE · intent family `chargematch:pair:macbook-pro-14-m3:anker-65w`
- This page is indexable because hard gates passed for family can-charger-charge, the canonical is self-consistent, provenance is attached via its entities (2), and it exposes a product tool. Soft score 81 is secondary and demand 34 is not claimed as GSC. Distinct structured reason: macbook-pro-14-m3-anker-65w. Title uniqueness is not used as proof.
- facts: min_watts, max_watts, connector, tag, total_watts, pd_version
- sources: MANUFACTURER:oem-power-specs
- relations: MAX_INPUT, SUPPORTS_PROTOCOL, CAN_CHARGE, EXPECTED_POWER, HAS_PORT, HAS_POWER_ALLOCATION (133 decision-relevant)
- demand 34 (editorial unless GSC is wired) · confidence HIGH
- distinct_reason (not title uniqueness): macbook-pro-14-m3-anker-65w
- nearest 5:
  - 0.615 /chargematch/macbook-air-13-m3/with/anker-65w
  - 0.615 /chargematch/macbook-air-15-m3/with/anker-65w
  - 0.385 /chargematch/macbook-pro-14-m3/with/apple-70w
  - 0.308 /chargematch/iphone-16/with/apple-20w
  - 0.308 /chargematch/iphone-16/with/anker-65w

#### /chargematch/iphone-16-pro/with/anker-100w-2c

- score 81 · INDEXABLE · intent family `chargematch:pair:iphone-16-pro:anker-100w-2c`
- This page is indexable because hard gates passed for family can-charger-charge, the canonical is self-consistent, provenance is attached via its entities (2), and it exposes a product tool. Soft score 81 is secondary and demand 35 is not claimed as GSC. Distinct structured reason: iphone-16-pro-anker-100w-2c. Title uniqueness is not used as proof.
- facts: min_watts, max_watts, connector, tag, total_watts, pd_version
- sources: MANUFACTURER:oem-power-specs
- relations: MAX_INPUT, SUPPORTS_PROTOCOL, CAN_CHARGE, EXPECTED_POWER, HAS_PORT, HAS_POWER_ALLOCATION (135 decision-relevant)
- demand 35 (editorial unless GSC is wired) · confidence HIGH
- distinct_reason (not title uniqueness): iphone-16-pro-anker-100w-2c
- nearest 5:
  - 0.846 /chargematch/iphone-16-pro/with/anker-65w
  - 0.769 /chargematch/steam-deck/with/anker-65w
  - 0.769 /chargematch/galaxy-s24-ultra/with/anker-65w
  - 0.769 /chargematch/steam-deck-oled/with/anker-65w
  - 0.769 /chargematch/galaxy-tab-s9/with/anker-65w

#### /chargematch/macbook-air-13-m3/with/apple-70w

- score 81 · INDEXABLE · intent family `chargematch:pair:macbook-air-13-m3:apple-70w`
- This page is indexable because hard gates passed for family can-charger-charge, the canonical is self-consistent, provenance is attached via its entities (2), and it exposes a product tool. Soft score 81 is secondary and demand 30 is not claimed as GSC. Distinct structured reason: macbook-air-13-m3-apple-70w. Title uniqueness is not used as proof.
- facts: min_watts, max_watts, connector, tag, total_watts, pd_version
- sources: MANUFACTURER:oem-power-specs
- relations: MAX_INPUT, SUPPORTS_PROTOCOL, CAN_CHARGE, EXPECTED_POWER, HAS_PORT, HAS_POWER_ALLOCATION (133 decision-relevant)
- demand 30 (editorial unless GSC is wired) · confidence HIGH
- distinct_reason (not title uniqueness): macbook-air-13-m3-apple-70w
- nearest 5:
  - 0.846 /chargematch/macbook-air-15-m3/with/apple-70w
  - 0.769 /chargematch/macbook-air-13-m3/with/anker-100w-2c
  - 0.538 /chargematch/macbook-pro-14-m3/with/apple-70w
  - 0.538 /chargematch/iphone-15/with/apple-20w
  - 0.538 /chargematch/iphone-14/with/apple-20w

#### /chargematch/iphone-16/with/apple-30w

- score 81 · INDEXABLE · intent family `chargematch:pair:iphone-16:apple-30w`
- This page is indexable because hard gates passed for family can-charger-charge, the canonical is self-consistent, provenance is attached via its entities (2), and it exposes a product tool. Soft score 81 is secondary and demand 33 is not claimed as GSC. Distinct structured reason: iphone-16-apple-30w. Title uniqueness is not used as proof.
- facts: min_watts, max_watts, connector, tag, total_watts, pd_version
- sources: MANUFACTURER:oem-power-specs
- relations: MAX_INPUT, SUPPORTS_PROTOCOL, CAN_CHARGE, EXPECTED_POWER, HAS_PORT, HAS_POWER_ALLOCATION (133 decision-relevant)
- demand 33 (editorial unless GSC is wired) · confidence HIGH
- distinct_reason (not title uniqueness): iphone-16-apple-30w
- nearest 5:
  - 0.846 /chargematch/iphone-16/with/apple-35w-dual
  - 0.846 /chargematch/iphone-16/with/anker-65w
  - 0.769 /chargematch/galaxy-s24/with/anker-65w
  - 0.615 /chargematch/iphone-14/with/apple-30w
  - 0.538 /chargematch/macbook-air-13-m3/with/anker-100w-2c

#### /chargematch/pixel-8

- score 72 · NOINDEX_PRODUCT · intent family `chargematch:device-hub:pixel-8`
- Not indexable (NOINDEX_PRODUCT). Soft score 72 cannot override a failed hard gate. The record can still power the product or remain graph-only.
- facts: min_watts, max_watts, connector, tag
- sources: MANUFACTURER:oem-power-specs
- relations: MAX_INPUT, SUPPORTS_PROTOCOL, CAN_CHARGE, EXPECTED_POWER (42 decision-relevant)
- demand 74 (editorial unless GSC is wired) · confidence HIGH
- distinct_reason (not title uniqueness): pixel-8
- nearest 5:
  - 0.6 /chargematch/pixel-9
  - 0.4 /chargematch/iphone-16
  - 0.4 /chargematch/iphone-15
  - 0.4 /chargematch/galaxy-s24
  - 0.4 /chargematch/iphone-16-pro

#### /chargematch/galaxy-tab-s9

- score 71 · NOINDEX_PRODUCT · intent family `chargematch:device-wattage:galaxy-tab-s9`
- Not indexable (NOINDEX_PRODUCT). Soft score 71 cannot override a failed hard gate. The record can still power the product or remain graph-only.
- facts: min_watts, max_watts, connector, tag
- sources: MANUFACTURER:oem-power-specs
- relations: MAX_INPUT, SUPPORTS_PROTOCOL, CAN_CHARGE, EXPECTED_POWER (42 decision-relevant)
- demand 60 (editorial unless GSC is wired) · confidence HIGH
- distinct_reason (not title uniqueness): galaxy-tab-s9
- nearest 5:
  - 0.2 /chargematch/iphone-16
  - 0.2 /chargematch/iphone-15
  - 0.2 /chargematch/macbook-air-13-m3
  - 0.2 /chargematch/macbook-pro-14-m3
  - 0.2 /chargematch/ipad-pro-m4

#### /chargematch/nintendo-switch-oled/with/apple-20w

- score 81 · INDEXABLE · intent family `chargematch:pair:nintendo-switch-oled:apple-20w`
- This page is indexable because hard gates passed for family can-charger-charge, the canonical is self-consistent, provenance is attached via its entities (2), and it exposes a product tool. Soft score 81 is secondary and demand 29 is not claimed as GSC. Distinct structured reason: nintendo-switch-oled-apple-20w. Title uniqueness is not used as proof.
- facts: min_watts, max_watts, connector, tag, total_watts, pd_version
- sources: MANUFACTURER:oem-power-specs
- relations: MAX_INPUT, CAN_CHARGE, EXPECTED_POWER, SUPPORTS_PROTOCOL, HAS_PORT, HAS_POWER_ALLOCATION (132 decision-relevant)
- demand 29 (editorial unless GSC is wired) · confidence HIGH
- distinct_reason (not title uniqueness): nintendo-switch-oled-apple-20w
- nearest 5:
  - 0.846 /chargematch/steam-deck/with/apple-20w
  - 0.846 /chargematch/iphone-16-pro/with/apple-20w
  - 0.846 /chargematch/ipad-air-m2/with/apple-20w
  - 0.615 /chargematch/iphone-16/with/apple-20w
  - 0.615 /chargematch/galaxy-s24/with/apple-20w

#### /chargematch/steam-deck-oled/with/anker-65w

- score 81 · INDEXABLE · intent family `chargematch:pair:steam-deck-oled:anker-65w`
- This page is indexable because hard gates passed for family can-charger-charge, the canonical is self-consistent, provenance is attached via its entities (2), and it exposes a product tool. Soft score 81 is secondary and demand 30 is not claimed as GSC. Distinct structured reason: steam-deck-oled-anker-65w. Title uniqueness is not used as proof.
- facts: min_watts, max_watts, connector, tag, total_watts, pd_version
- sources: MANUFACTURER:oem-power-specs
- relations: MAX_INPUT, SUPPORTS_PROTOCOL, CAN_CHARGE, EXPECTED_POWER, HAS_PORT, HAS_POWER_ALLOCATION (133 decision-relevant)
- demand 30 (editorial unless GSC is wired) · confidence HIGH
- distinct_reason (not title uniqueness): steam-deck-oled-anker-65w
- nearest 5:
  - 0.846 /chargematch/steam-deck/with/anker-65w
  - 0.846 /chargematch/iphone-16-pro/with/anker-65w
  - 0.846 /chargematch/galaxy-s24-ultra/with/anker-65w
  - 0.846 /chargematch/galaxy-tab-s9/with/anker-65w
  - 0.846 /chargematch/ipad-pro-m4/with/anker-65w

#### /chargematch/steam-deck/with/anker-45w

- score 81 · INDEXABLE · intent family `chargematch:pair:steam-deck:anker-45w`
- This page is indexable because hard gates passed for family can-charger-charge, the canonical is self-consistent, provenance is attached via its entities (2), and it exposes a product tool. Soft score 81 is secondary and demand 31 is not claimed as GSC. Distinct structured reason: steam-deck-anker-45w. Title uniqueness is not used as proof.
- facts: min_watts, max_watts, connector, tag, total_watts, pd_version
- sources: MANUFACTURER:oem-power-specs
- relations: MAX_INPUT, SUPPORTS_PROTOCOL, CAN_CHARGE, EXPECTED_POWER, HAS_PORT, HAS_POWER_ALLOCATION (133 decision-relevant)
- demand 31 (editorial unless GSC is wired) · confidence HIGH
- distinct_reason (not title uniqueness): steam-deck-anker-45w
- nearest 5:
  - 0.846 /chargematch/steam-deck-oled/with/anker-45w
  - 0.769 /chargematch/steam-deck/with/anker-65w
  - 0.692 /chargematch/iphone-16-pro/with/anker-65w
  - 0.692 /chargematch/iphone-16-pro/with/anker-100w-2c
  - 0.692 /chargematch/galaxy-s24-ultra/with/anker-65w

#### /chargematch/macbook-pro-14-m3

- score 73 · NOINDEX_PRODUCT · intent family `chargematch:device-hub:macbook-pro-14-m3`
- Not indexable (NOINDEX_PRODUCT). Soft score 73 cannot override a failed hard gate. The record can still power the product or remain graph-only.
- facts: min_watts, max_watts, connector, tag
- sources: MANUFACTURER:oem-power-specs
- relations: MAX_INPUT, SUPPORTS_PROTOCOL, CAN_CHARGE, EXPECTED_POWER (42 decision-relevant)
- demand 84 (editorial unless GSC is wired) · confidence HIGH
- distinct_reason (not title uniqueness): macbook-pro-14-m3
- nearest 5:
  - 0.2 /chargematch/iphone-16
  - 0.2 /chargematch/iphone-15
  - 0.2 /chargematch/macbook-air-13-m3
  - 0.2 /chargematch/ipad-pro-m4
  - 0.2 /chargematch/steam-deck

### tripcost

#### /tripcost/paris/to/rome/driving-cost

- score 70 · NOINDEX_PRODUCT · intent family `tripcost:corridor:paris-rome:route-driving`
- Not indexable (NOINDEX_PRODUCT). Soft score 70 cannot override a failed hard gate. The record can still power the product or remain graph-only.
- facts: km, demand
- sources: THIRD_PARTY:seed-transport-snapshot
- relations: FROM_PLACE, TO_PLACE, HAS_DISTANCE, HAS_CONSUMPTION, HAS_COST_COMPONENT, HAS_MODE (15 decision-relevant)
- demand 77 (editorial unless GSC is wired) · confidence MEDIUM
- distinct_reason (not title uniqueness): paris-rome-driving
- nearest 5:
  - 0.2 /tripcost/paris/to/lyon
  - 0.2 /tripcost/paris/to/lyon/driving-cost
  - 0.2 /tripcost/paris/to/barcelona
  - 0.2 /tripcost/paris/to/barcelona/driving-cost
  - 0.2 /tripcost/london/to/paris

#### /tripcost/rome/to/milan/driving-cost

- score 70 · NOINDEX_PRODUCT · intent family `tripcost:corridor:rome-milan:route-driving`
- Not indexable (NOINDEX_PRODUCT). Soft score 70 cannot override a failed hard gate. The record can still power the product or remain graph-only.
- facts: km, demand
- sources: THIRD_PARTY:seed-transport-snapshot
- relations: FROM_PLACE, TO_PLACE, HAS_DISTANCE, HAS_CONSUMPTION, HAS_COST_COMPONENT, HAS_MODE (16 decision-relevant)
- demand 75 (editorial unless GSC is wired) · confidence MEDIUM
- distinct_reason (not title uniqueness): rome-milan-driving
- nearest 5:
  - 0.2 /tripcost/paris/to/lyon
  - 0.2 /tripcost/paris/to/barcelona
  - 0.2 /tripcost/london/to/paris
  - 0.2 /tripcost/berlin/to/munich
  - 0.2 /tripcost/paris/to/amsterdam

#### /tripcost/london/to/paris

- score 84 · INDEXABLE · intent family `tripcost:corridor:london-paris:route-car-vs-train`
- This page is indexable because hard gates passed for family route-car-vs-train, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 84 is secondary and demand 36 is not claimed as GSC. Distinct structured reason: london-paris-compare. Title uniqueness is not used as proof.
- facts: km, demand
- sources: THIRD_PARTY:seed-transport-snapshot
- relations: FROM_PLACE, TO_PLACE, HAS_DISTANCE, HAS_CONSUMPTION, HAS_COST_COMPONENT, HAS_MODE (14 decision-relevant)
- demand 36 (editorial unless GSC is wired) · confidence MEDIUM
- distinct_reason (not title uniqueness): london-paris-compare
- nearest 5:
  - 0.571 /tripcost/london/to/amsterdam
  - 0.429 /tripcost/milan/to/munich
  - 0.429 /tripcost/paris/to/rome
  - 0.429 /tripcost/lisbon/to/madrid
  - 0.2 /tripcost/paris/to/lyon/driving-cost

#### /tripcost/berlin/to/hamburg

- score 84 · INDEXABLE · intent family `tripcost:corridor:berlin-hamburg:route-car-vs-train`
- This page is indexable because hard gates passed for family route-car-vs-train, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 84 is secondary and demand 26 is not claimed as GSC. Distinct structured reason: berlin-hamburg-compare. Title uniqueness is not used as proof.
- facts: km, demand
- sources: THIRD_PARTY:seed-transport-snapshot
- relations: FROM_PLACE, TO_PLACE, HAS_DISTANCE, HAS_CONSUMPTION, HAS_COST_COMPONENT, HAS_MODE (13 decision-relevant)
- demand 26 (editorial unless GSC is wired) · confidence MEDIUM
- distinct_reason (not title uniqueness): berlin-hamburg-compare
- nearest 5:
  - 0.571 /tripcost/brussels/to/amsterdam
  - 0.429 /tripcost/paris/to/brussels
  - 0.429 /tripcost/munich/to/zurich
  - 0.429 /tripcost/lyon/to/marseille
  - 0.429 /tripcost/paris/to/geneva

#### /tripcost/london/to/amsterdam/driving-cost

- score 70 · NOINDEX_PRODUCT · intent family `tripcost:corridor:london-amsterdam:route-driving`
- Not indexable (NOINDEX_PRODUCT). Soft score 70 cannot override a failed hard gate. The record can still power the product or remain graph-only.
- facts: km, demand
- sources: THIRD_PARTY:seed-transport-snapshot
- relations: FROM_PLACE, TO_PLACE, HAS_DISTANCE, HAS_CONSUMPTION, HAS_COST_COMPONENT, HAS_MODE (14 decision-relevant)
- demand 81 (editorial unless GSC is wired) · confidence MEDIUM
- distinct_reason (not title uniqueness): london-amsterdam-driving
- nearest 5:
  - 0.4 /tripcost/london/to/paris/driving-cost
  - 0.2 /tripcost/paris/to/lyon
  - 0.2 /tripcost/paris/to/barcelona
  - 0.2 /tripcost/london/to/paris
  - 0.2 /tripcost/berlin/to/munich

#### /tripcost/amsterdam/to/berlin

- score 84 · INDEXABLE · intent family `tripcost:corridor:amsterdam-berlin:route-car-vs-train`
- This page is indexable because hard gates passed for family route-car-vs-train, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 84 is secondary and demand 31 is not claimed as GSC. Distinct structured reason: amsterdam-berlin-compare. Title uniqueness is not used as proof.
- facts: km, demand
- sources: THIRD_PARTY:seed-transport-snapshot
- relations: FROM_PLACE, TO_PLACE, HAS_DISTANCE, HAS_CONSUMPTION, HAS_COST_COMPONENT, HAS_MODE (15 decision-relevant)
- demand 31 (editorial unless GSC is wired) · confidence MEDIUM
- distinct_reason (not title uniqueness): amsterdam-berlin-compare
- nearest 5:
  - 0.571 /tripcost/berlin/to/munich
  - 0.571 /tripcost/madrid/to/barcelona
  - 0.429 /tripcost/paris/to/lyon
  - 0.429 /tripcost/paris/to/barcelona
  - 0.429 /tripcost/paris/to/amsterdam

#### /tripcost/paris/to/amsterdam/driving-cost

- score 70 · NOINDEX_PRODUCT · intent family `tripcost:corridor:paris-amsterdam:route-driving`
- Not indexable (NOINDEX_PRODUCT). Soft score 70 cannot override a failed hard gate. The record can still power the product or remain graph-only.
- facts: km, demand
- sources: THIRD_PARTY:seed-transport-snapshot
- relations: FROM_PLACE, TO_PLACE, HAS_DISTANCE, HAS_CONSUMPTION, HAS_COST_COMPONENT, HAS_MODE (16 decision-relevant)
- demand 75 (editorial unless GSC is wired) · confidence MEDIUM
- distinct_reason (not title uniqueness): paris-amsterdam-driving
- nearest 5:
  - 0.2 /tripcost/paris/to/lyon
  - 0.2 /tripcost/paris/to/lyon/driving-cost
  - 0.2 /tripcost/paris/to/barcelona
  - 0.2 /tripcost/paris/to/barcelona/driving-cost
  - 0.2 /tripcost/london/to/paris

#### /tripcost/berlin/to/munich

- score 84 · INDEXABLE · intent family `tripcost:corridor:berlin-munich:route-car-vs-train`
- This page is indexable because hard gates passed for family route-car-vs-train, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 84 is secondary and demand 30 is not claimed as GSC. Distinct structured reason: berlin-munich-compare. Title uniqueness is not used as proof.
- facts: km, demand
- sources: THIRD_PARTY:seed-transport-snapshot
- relations: FROM_PLACE, TO_PLACE, HAS_DISTANCE, HAS_CONSUMPTION, HAS_COST_COMPONENT, HAS_MODE (15 decision-relevant)
- demand 30 (editorial unless GSC is wired) · confidence MEDIUM
- distinct_reason (not title uniqueness): berlin-munich-compare
- nearest 5:
  - 0.571 /tripcost/amsterdam/to/berlin
  - 0.571 /tripcost/madrid/to/barcelona
  - 0.429 /tripcost/paris/to/lyon
  - 0.429 /tripcost/paris/to/barcelona
  - 0.429 /tripcost/paris/to/amsterdam

#### /tripcost/lyon/to/marseille/driving-cost

- score 70 · NOINDEX_PRODUCT · intent family `tripcost:corridor:lyon-marseille:route-driving`
- Not indexable (NOINDEX_PRODUCT). Soft score 70 cannot override a failed hard gate. The record can still power the product or remain graph-only.
- facts: km, demand
- sources: THIRD_PARTY:seed-transport-snapshot
- relations: FROM_PLACE, TO_PLACE, HAS_DISTANCE, HAS_CONSUMPTION, HAS_COST_COMPONENT, HAS_MODE (14 decision-relevant)
- demand 65 (editorial unless GSC is wired) · confidence MEDIUM
- distinct_reason (not title uniqueness): lyon-marseille-driving
- nearest 5:
  - 0.2 /tripcost/paris/to/lyon
  - 0.2 /tripcost/paris/to/lyon/driving-cost
  - 0.2 /tripcost/paris/to/barcelona
  - 0.2 /tripcost/paris/to/barcelona/driving-cost
  - 0.2 /tripcost/london/to/paris

#### /tripcost/paris/to/amsterdam

- score 84 · INDEXABLE · intent family `tripcost:corridor:paris-amsterdam:route-car-vs-train`
- This page is indexable because hard gates passed for family route-car-vs-train, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 84 is secondary and demand 32 is not claimed as GSC. Distinct structured reason: paris-amsterdam-compare. Title uniqueness is not used as proof.
- facts: km, demand
- sources: THIRD_PARTY:seed-transport-snapshot
- relations: FROM_PLACE, TO_PLACE, HAS_DISTANCE, HAS_CONSUMPTION, HAS_COST_COMPONENT, HAS_MODE (16 decision-relevant)
- demand 32 (editorial unless GSC is wired) · confidence MEDIUM
- distinct_reason (not title uniqueness): paris-amsterdam-compare
- nearest 5:
  - 0.429 /tripcost/paris/to/lyon
  - 0.429 /tripcost/paris/to/barcelona
  - 0.429 /tripcost/berlin/to/munich
  - 0.429 /tripcost/amsterdam/to/berlin
  - 0.429 /tripcost/madrid/to/barcelona

## 20 highest scores (why)

- **84** /fixcode/samsung/washer/4c-error — This page is indexable because hard gates passed for family error-code, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 84 is secondary and demand 37 is not claimed as GSC. Distinct structured reason: fix:samsung:washer:4c. Title uniqueness is not used as proof.
- **84** /fixcode/samsung/washer/4e-error — This page is indexable because hard gates passed for family error-code, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 84 is secondary and demand 30 is not claimed as GSC. Distinct structured reason: fix:samsung:washer:4e. Title uniqueness is not used as proof.
- **84** /fixcode/samsung/washer/5c-error — This page is indexable because hard gates passed for family error-code, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 84 is secondary and demand 35 is not claimed as GSC. Distinct structured reason: fix:samsung:washer:5c. Title uniqueness is not used as proof.
- **84** /fixcode/samsung/washer/5e-error — This page is indexable because hard gates passed for family error-code, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 84 is secondary and demand 28 is not claimed as GSC. Distinct structured reason: fix:samsung:washer:5e. Title uniqueness is not used as proof.
- **84** /fixcode/samsung/washer/ue-error — This page is indexable because hard gates passed for family error-code, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 84 is secondary and demand 34 is not claimed as GSC. Distinct structured reason: fix:samsung:washer:ue. Title uniqueness is not used as proof.
- **84** /fixcode/samsung/washer/le-error — This page is indexable because hard gates passed for family error-code, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 84 is secondary and demand 24 is not claimed as GSC. Distinct structured reason: fix:samsung:washer:le. Title uniqueness is not used as proof.
- **84** /fixcode/samsung/washer/3c-error — This page is indexable because hard gates passed for family error-code, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 84 is secondary and demand 23 is not claimed as GSC. Distinct structured reason: fix:samsung:washer:3c. Title uniqueness is not used as proof.
- **84** /fixcode/lg/washer/ie-error — This page is indexable because hard gates passed for family error-code, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 84 is secondary and demand 34 is not claimed as GSC. Distinct structured reason: fix:lg:washer:ie. Title uniqueness is not used as proof.
- **84** /fixcode/lg/washer/oe-error — This page is indexable because hard gates passed for family error-code, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 84 is secondary and demand 36 is not claimed as GSC. Distinct structured reason: fix:lg:washer:oe. Title uniqueness is not used as proof.
- **84** /fixcode/lg/washer/ue-error — This page is indexable because hard gates passed for family error-code, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 84 is secondary and demand 32 is not claimed as GSC. Distinct structured reason: fix:lg:washer:ue. Title uniqueness is not used as proof.
- **84** /fixcode/bosch/dishwasher/e15-error — This page is indexable because hard gates passed for family error-code, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 84 is secondary and demand 38 is not claimed as GSC. Distinct structured reason: fix:bosch:dishwasher:e15. Title uniqueness is not used as proof.
- **84** /fixcode/bosch/dishwasher/e24-error — This page is indexable because hard gates passed for family error-code, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 84 is secondary and demand 32 is not claimed as GSC. Distinct structured reason: fix:bosch:dishwasher:e24. Title uniqueness is not used as proof.
- **84** /fixcode/samsung/washer/3e-error — This page is indexable because hard gates passed for family error-code, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 84 is secondary and demand 24 is not claimed as GSC. Distinct structured reason: fix:samsung:washer:3e. Title uniqueness is not used as proof.
- **84** /fixcode/samsung/washer/3c1-error — This page is indexable because hard gates passed for family error-code, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 84 is secondary and demand 17 is not claimed as GSC. Distinct structured reason: fix:samsung:washer:3c1. Title uniqueness is not used as proof.
- **84** /fixcode/samsung/washer/ub-error — This page is indexable because hard gates passed for family error-code, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 84 is secondary and demand 29 is not claimed as GSC. Distinct structured reason: fix:samsung:washer:ub. Title uniqueness is not used as proof.
- **84** /fixcode/samsung/washer/uc-error — This page is indexable because hard gates passed for family error-code, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 84 is secondary and demand 19 is not claimed as GSC. Distinct structured reason: fix:samsung:washer:uc. Title uniqueness is not used as proof.
- **84** /fixcode/samsung/washer/lc-error — This page is indexable because hard gates passed for family error-code, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 84 is secondary and demand 21 is not claimed as GSC. Distinct structured reason: fix:samsung:washer:lc. Title uniqueness is not used as proof.
- **84** /fixcode/samsung/washer/4c2-error — This page is indexable because hard gates passed for family error-code, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 84 is secondary and demand 16 is not claimed as GSC. Distinct structured reason: fix:samsung:washer:4c2. Title uniqueness is not used as proof.
- **84** /fixcode/samsung/dishwasher/4e-error — This page is indexable because hard gates passed for family error-code, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 84 is secondary and demand 27 is not claimed as GSC. Distinct structured reason: fix:samsung:dishwasher:4e. Title uniqueness is not used as proof.
- **84** /fixcode/samsung/dishwasher/4c-error — This page is indexable because hard gates passed for family error-code, the canonical is self-consistent, provenance is attached via its entities (1), and it exposes a product tool. Soft score 84 is secondary and demand 25 is not claimed as GSC. Distinct structured reason: fix:samsung:dishwasher:4c. Title uniqueness is not used as proof.

## 50 random pages (compact)

| Site | Score | State | URL | Intent family |
| --- | --- | --- | --- | --- |
| wearthere | 84 | INDEXABLE | /wearthere/lisbon/december/what-to-wear | wearthere:wear:lisbon:12 |
| wearthere | 84 | INDEXABLE | /wearthere/singapore/february/what-to-wear | wearthere:wear:singapore:2 |
| fixcode | 77 | INDEXABLE | /fixcode/lg/dryer | fixcode:appliance-hub:hub-lg-dryer |
| fixcode | 81 | INDEXABLE | /fixcode/samsung/washer/standing-water | fixcode:symptom:fix:samsung:washer:standing-water |
| fixcode | 82 | INDEXABLE | /fixcode/lg/dishwasher/te-error | fixcode:error:LG:Dishwasher:tE |
| fixcode | 82 | INDEXABLE | /fixcode/bosch/dishwasher/not-draining | fixcode:symptom:fix:bosch:dishwasher:not-draining |
| autospec | 81 | INDEXABLE | /autospec/bmw/3-series/g20/320d-b47/oil | autospec:oil:veh:bmw:3-series:g20:320d-b47 |
| fixcode | 82 | INDEXABLE | /fixcode/lg/dishwasher/fe-error | fixcode:error:LG:Dishwasher:FE |
| wearthere | 84 | INDEXABLE | /wearthere/madrid/march/what-to-wear | wearthere:wear:madrid:3 |
| wearthere | 84 | INDEXABLE | /wearthere/prague/november/what-to-wear | wearthere:wear:prague:11 |
| fixcode | 78 | INDEXABLE | /fixcode/bosch/oven/e305-error | fixcode:error:Bosch:Oven:E305 |
| wearthere | 84 | INDEXABLE | /wearthere/dubai/october/what-to-wear | wearthere:wear:dubai:10 |
| fixcode | 78 | INDEXABLE | /fixcode/bosch/oven/e011-error | fixcode:error:Bosch:Oven:E011 |
| fixcode | 84 | INDEXABLE | /fixcode/samsung/washer/3c1-error | fixcode:error:Samsung:Washer:3C1 |
| fixcode | 82 | INDEXABLE | /fixcode/bosch/dishwasher/e07-error | fixcode:error:Bosch:Dishwasher:E07 |
| fixcode | 83 | INDEXABLE | /fixcode/lg/dishwasher/takes-too-long-to-fill | fixcode:symptom:fix:lg:dishwasher:takes-too-long-to-fill |
| chargematch | 81 | INDEXABLE | /chargematch/steam-deck/with/anker-45w | chargematch:pair:steam-deck:anker-45w |
| fixcode | 77 | INDEXABLE | /fixcode/samsung/washer/door-wont-lock | fixcode:symptom:fix:samsung:washer:door-wont-lock |
| fixcode | 81 | INDEXABLE | /fixcode/miele/dishwasher/standing-water | fixcode:symptom:fix:miele:dishwasher:standing-water |
| wearthere | 84 | INDEXABLE | /wearthere/dublin/september/what-to-wear | wearthere:wear:dublin:9 |
| wearthere | 84 | INDEXABLE | /wearthere/florence/june/what-to-wear | wearthere:wear:florence:6 |
| fixcode | 76 | INDEXABLE | /fixcode/miele/dishwasher/dishes-wet | fixcode:symptom:fix:miele:dishwasher:dishes-wet |
| wearthere | 84 | INDEXABLE | /wearthere/florence/march/what-to-wear | wearthere:wear:florence:3 |
| wearthere | 84 | INDEXABLE | /wearthere/barcelona/september/what-to-wear | wearthere:wear:barcelona:9 |
| autospec | 81 | INDEXABLE | /autospec/bmw/3-series/g20/320d-b47/maintenance | autospec:maintenance-schedule:B47D20-maint |
| wearthere | 84 | INDEXABLE | /wearthere/osaka/may/what-to-wear | wearthere:wear:osaka:5 |
| autospec | 84 | INDEXABLE | /autospec/bmw/3-series/g20/320d-b47 | autospec:vehicle-hub:veh:bmw:3-series:g20:320d-b47 |
| wearthere | 84 | INDEXABLE | /wearthere/tokyo/november/what-to-wear | wearthere:wear:tokyo:11 |
| fixcode | 82 | INDEXABLE | /fixcode/miele/dishwasher/takes-too-long-to-fill | fixcode:symptom:fix:miele:dishwasher:takes-too-long-to-fill |
| autospec | 76 | INDEXABLE | /autospec/honda/civic/11/1-5-vtec/problems | autospec:common-problems:L15C-issues |
| fixcode | 84 | INDEXABLE | /fixcode/samsung/washer/le-error | fixcode:error:Samsung:Washer:LE |
| autospec | 74 | NOINDEX_PRODUCT | /autospec/peugeot/308/t9/1-2-puretech/tyres | autospec:tyre-pressure:EB2DT-tyres |
| wearthere | 84 | INDEXABLE | /wearthere/istanbul/august/what-to-wear | wearthere:wear:istanbul:8 |
| wearthere | 84 | INDEXABLE | /wearthere/new-york/october/what-to-wear | wearthere:wear:new-york:10 |
| autospec | 84 | INDEXABLE | /autospec/toyota/corolla/e210/1-8-hybrid | autospec:vehicle-hub:veh:toyota:corolla:e210:1-8-hybrid |
| wearthere | 84 | INDEXABLE | /wearthere/prague/december/what-to-wear | wearthere:wear:prague:12 |
| wearthere | 84 | INDEXABLE | /wearthere/tokyo/september/what-to-wear | wearthere:wear:tokyo:9 |
| fixcode | 76 | INDEXABLE | /fixcode/bosch/dishwasher/dishes-wet | fixcode:symptom:fix:bosch:dishwasher:dishes-wet |
| wearthere | 84 | INDEXABLE | /wearthere/bangkok/january/what-to-wear | wearthere:wear:bangkok:1 |
| fixcode | 83 | INDEXABLE | /fixcode/bosch/dishwasher/e25-error | fixcode:error:Bosch:Dishwasher:E25 |
| autospec | 84 | INDEXABLE | /autospec/audi/a4/b9/2-0-tdi | autospec:vehicle-hub:veh:audi:a4:b9:2-0-tdi |
| chargematch | 73 | NOINDEX_PRODUCT | /chargematch/macbook-pro-14-m3 | chargematch:device-hub:macbook-pro-14-m3 |
| autospec | 78 | INDEXABLE | /autospec/audi/a4/b9/2-0-tdi/tyres | autospec:tyre-pressure:EA288-tyres |
| wearthere | 84 | INDEXABLE | /wearthere/new-york/december/what-to-wear | wearthere:wear:new-york:12 |
| wearthere | 84 | INDEXABLE | /wearthere/marrakech/may/what-to-wear | wearthere:wear:marrakech:5 |
| wearthere | 84 | INDEXABLE | /wearthere/los-angeles/march/what-to-wear | wearthere:wear:los-angeles:3 |
| autospec | 78 | INDEXABLE | /autospec/volvo/xc60/spa/t8-recharge/battery | autospec:battery:B420-battery |
| wearthere | 84 | INDEXABLE | /wearthere/berlin/august/what-to-wear | wearthere:wear:berlin:8 |
| fixcode | 83 | INDEXABLE | /fixcode/samsung/dishwasher/3e-error | fixcode:error:Samsung:Dishwasher:3E |
| fixcode | 84 | INDEXABLE | /fixcode/lg/washer/ce-error | fixcode:error:LG:Washer:CE |

## Failure-condition check

- Page count was not increased as a goal.
- Decision-relevant relations are counted separately from trivia (FROM_PLACE is not decision-relevant).
- Editorial demand cannot produce a 95 average; it is capped.
- AI_INFERRED cannot be promoted to OFFICIAL/MANUFACTURER.
- AutoSpec LOW fitment renders “Possible fitment — verify.” never “Compatible.”
- ChargeMatch expected watts are SPEC_VERIFIED or INFERRED, never MEASURED without a lab row.
- FixCode errors attach causes, tests, results, fixes, SAFETY_CLASS — not only ERROR → MEANING.
- WearThere month pages are CLIMATE_NORMAL, not FORECAST.
- TripCost volatile fares expire; stale quotes are not labelled current.
