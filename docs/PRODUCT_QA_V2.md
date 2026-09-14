# Product QA V2

Notes /10. Not inflated. 10 would require live primary documents, measured outcomes, and observed demand.

## FixCode — 6.5 / 10

| Axis | /10 | Notes |
| --- | ---: | --- |
| Architecture | 8 | ErrorCode → cause → test → result → fix → safety exists. |
| Truth quality | 6 | Manufacturer corpus compiled; URLs often generic support roots. |
| Source quality | 6 | 4 brands only. No invented Whirlpool. |
| Graph quality | 7 | Median 3 edges. Decision tree is real. |
| Decision engine | 8 | diagnostic-v3, labels not %. |
| SEO readiness | 4 | 50 SEO_CANDIDATE, 0 INDEXABLE. |
| Product usefulness | 7 | Diagnose tool works. |
| Risks | — | Document priors look like probabilities; outcomes = 0. |

**DATA_SCALE: NO** — need manufacturer documents with locators before adding brands.
**SEO_SCALE: NO** — no GSC/keyword evidence.
**PUBLIC_LAUNCH: NO** — prelaunch noindex, incomplete provenance.

## AutoSpec — 4.5 / 10

| Axis | /10 | Notes |
| --- | ---: | --- |
| Architecture | 7 | Vehicle → generation → engine → fluids. Fitment rows exist. |
| Truth quality | 3 | bmw.com-class sources fail PRIMARY_EXACT. |
| Source quality | 4 | Handbook compile, no page/table locators. |
| Graph quality | 4 | Median 1 edge. Thin fitment. |
| Decision engine | 6 | OEM row only; same generation ≠ FITS. VIN_SUPPORT=NOT_IMPLEMENTED. |
| SEO readiness | 2 | 0 INDEXABLE, 0 SEO_CANDIDATE. Spec pages fail required fields or distinctiveness. |
| Product usefulness | 5 | Oil/capacity for known variants. |
| Risks | — | Specs can be over-generalized to a generation if not scoped. |

**DATA_SCALE: NO** — need handbook locators + market/trim scope.
**SEO_SCALE: NO**
**PUBLIC_LAUNCH: NO**

## WearThere — 5.0 / 10

| Axis | /10 | Notes |
| --- | ---: | --- |
| Architecture | 7 | Climate normal ≠ forecast. Packing-v1. |
| Truth quality | 4 | Dataset id exists; no station/URL. |
| Source quality | 4 | compiled-monthly-normals, UNVERIFIED method. |
| Graph quality | 5 | Many PACKS derived edges; SOURCE_TRUTH is TYPICAL_CLIMATE. |
| Decision engine | 6 | Capsule is deterministic. Personalized trip not persisted. |
| SEO readiness | 2 | Matrix not indexed. GRAPH_ONLY / NOINDEX. |
| Product usefulness | 6 | Trip tool works. |
| Risks | — | Thin month twins. |

**DATA_SCALE: CONDITIONAL** — only with a citable climate dataset (station or grid URL).
**SEO_SCALE: NO**
**PUBLIC_LAUNCH: NO**

## ChargeMatch — 5.5 / 10

| Axis | /10 | Notes |
| --- | ---: | --- |
| Architecture | 8 | PowerScenario + port allocation. |
| Truth quality | 4 | Manufacturer PDO compile, generic provenance. |
| Source quality | 5 | Device max watts are manufacturer-rated, not measured. |
| Graph quality | 6 | Relations 1507 → 533. No cartesian EXPECTED_POWER. |
| Decision engine | 8 | min(device,port,cable). Evidence ≠ MEASURED. |
| SEO readiness | 2 | 0 INDEXABLE. Pair pages are product-only. |
| Product usefulness | 7 | Kit checker is real. |
| Risks | — | Users may read expected W as a lab number. UI must keep measured_curve=null visible. |

**DATA_SCALE: NO** — lab curves or datasheet locators first.
**SEO_SCALE: NO**
**PUBLIC_LAUNCH: NO**

## TripCost — 4.0 / 10

| Axis | /10 | Notes |
| --- | ---: | --- |
| Architecture | 7 | Cost breakdown + HEURISTIC_PRICE snapshot. |
| Truth quality | 3 | Seed fares, not observed. |
| Source quality | 3 | THIRD_PARTY snapshot. |
| Graph quality | 4 | Median 1. |
| Decision engine | 6 | compareRoute + break-even. live_fare=false. |
| SEO readiness | 2 | 0 INDEXABLE. |
| Product usefulness | 5 | Useful estimate if labelled. |
| Risks | — | Heuristic looking like a live ticket. |

**DATA_SCALE: NO** — need a fare/fuel provider contract.
**SEO_SCALE: NO**
**PUBLIC_LAUNCH: NO**

Coverage snapshot: FixCode brands=4 outcomes=0; ChargeMatch lab=0; VIN stub; WearThere climate_kind=CLIMATE_NORMAL.
