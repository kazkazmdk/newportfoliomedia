# Scale simulation

Capacity planning only. **No generation command.** `PUBLIC_SITE_LIVE=false`.

Snapshot after the acceleration pass (890 pages, 217 Truth Ready, 0 INDEXABLE, 0 imported demand observations, manufacturer `PRIMARY_EXACT` = 0).

WearThere climate facts can be `TRUSTED_DATASET_EXACT` (compiled monthly normals + dataset locator). That is **not** manufacturer `PRIMARY_EXACT`. Auto-stop `critical_provenance` is therefore **triggered**. Do not grow the URL surface until exact OEM locators exist.

## Current (890 pages)

| Need | Status |
| --- | --- |
| Data | Diagnostic trees + fitment scope + climate-season model + power chain + CostValue exist. Critical OEM locators do not. |
| Sources | Manufacturer support **roots** (PRIMARY_GENERAL). Climate compiled dataset. Heuristic fares. Rated PDOs. |
| Truth facts | ~5.5k entities, ~14k relations. Exact OEM facts: **0**. WearThere dataset-exact climate rows: present. |
| Duplicate risk | Medium on WearThere month clusters; consolidator recommends season/city-guide where spread is tiny. |
| Providers | None live. VIN `NOT_IMPLEMENTED`. Fare provider `MISSING`. Measured charge curves `[]`. |
| Feasibility | Hold. Scale-stop `critical_provenance` is on. Safe to generate: **no**. |

## 250 pages (net useful surface, not raw URLs)

Rational target: **keep ~250 high-utility pages**, not add 250.

| Need | Requirement |
| --- | --- |
| Data | ~80 FixCode error trees (4 brands) + ~40 WearThere city-season (not 12 months) + ~40 AutoSpec exact-fitment fluids + ~30 ChargeMatch device-intent + ~10 TripCost corridors. |
| Sources | OEM PDF page/section locators for FixCode/AutoSpec. Citable climate dataset URL. Manufacturer PDO tables (already). One fare snapshot API later. |
| Truth facts | ~3 verified exact facts per page minimum (existing cap). ≈750 exact facts. |
| Duplicate risk | Low if WearThere months collapse to seasons and ChargeMatch pairs stay engine-only. |
| Providers | Still optional. Demand Wave A (FixCode) can start without GSC. |
| Feasibility | **Yes as a consolidation + exact-source pass**, not as generation. |

## 500 pages

| Need | Requirement |
| --- | --- |
| Data | More codes **inside** Samsung/LG/Bosch/Miele only. 1–2 extra brands only with a primary corpus. AutoSpec: oil/coolant for scoped engines, not year spam. |
| Sources | Dozens of handbook/service PDFs with locators. No aggregator scrapes. |
| Truth facts | ≈1 500 exact facts. Provenance ratio must clear auto-stop (exact/critical ≥ 2%). |
| Duplicate risk | Medium if error codes share the same tree with different titles. |
| Providers | Keyword Planner or manual autocomplete/SERP for Wave A/B. Still no GSC required. |
| Feasibility | **Only after** Wave A demand import + OEM locators. Not now. |

## 1000 pages

| Need | Requirement |
| --- | --- |
| Data | New brands/cities/vehicles only when each entity has exact scope + demand cell ≠ UNKNOWN. |
| Sources | Licensed or first-party corpora. Climate dataset citation. Fare provider for any TripCost INDEXABLE. |
| Truth facts | ≈3 000 exact facts. Source-truth edge depth must stay ≥ 15%. |
| Duplicate risk | High on WearThere city×month and ChargeMatch device×charger. Those combinations stay in engines. |
| Providers | Demand import pipeline in production use. Optional GSC after first public batch. |
| Feasibility | **No** until exact provenance and demand validated ratio exist. Candidate growth >4× vs previous snapshot auto-stops. |

## 2500 pages

| Need | Requirement |
| --- | --- |
| Data | Industrial source ingestion, not hand seeds. Family bucketing already required for neighbor/duplicate scans. |
| Sources | Continuous OEM refresh. Lab curves still optional and must stay `MEASURED` only when lab rows exist. |
| Truth facts | ≈7 500 exact facts. Unknown-critical rate must stay ≤ 85%. |
| Duplicate risk | Very high without season/fitment/intent consolidation. |
| Providers | Live fares + licensed VIN would still not justify 2500 INDEXABLE pages. |
| Feasibility | **Not a 2026-Q3 action.** Simulation only. |

## What not to build

- Brand × appliance × error without a document locator
- Device × charger × cable SEO pages
- Year-only AutoSpec variants
- Forced temperate seasons for equatorial cities
- Heuristic fares presented as live
- Any mass generation while `scaleMustStop` is true
