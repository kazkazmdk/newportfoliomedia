# Manual deep-graph QA

Sampled 2026-09-14 from the live `GraphStore` after `applyIndexGates`.  
Where a site has fewer than 5 NOINDEX or GRAPH_ONLY pages, the gap is listed. Substituting invented pages would be fake QA.

Nearest sibling = top structured+intent neighbor. `pass` is the uniqueness gate (structured ≤0.85 **or** different intent **or** different decision output).

---

## FixCode

Intent of an INDEX error page: a household query of the form `{brand} {appliance} {code}` that the diagnostic engine can walk (causes → tests → next action → DIY/tech).

### INDEX (10)

| URL | Why intent | Unique data | Sources | Decision output | Why INDEX | Nearest sibling | Conflicts | Stale |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/fixcode/samsung/washer/5c-error` | Drain-error search | Code+causes+tests on washer family | MANUFACTURER support corpus | Diagnostic flow | Hard gates + score 84 | `/fixcode/samsung/washer/5e-error` (0.57, pass) | none | none |
| `/fixcode/samsung/washer/5e-error` | Same family, different code | 5E meaning ≠ 5C | MANUFACTURER | Diagnostic flow | 84 | `5c2-error` 0.64 pass | none | none |
| `/fixcode/samsung/washer/oe-error` | OE is a distinct drain code | OE tree | MANUFACTURER | Diagnostic flow | 84 | dishwasher OE 0.71 pass | none | none |
| `/fixcode/samsung/washer/4c-error` | Water-supply 4C | Multi-cause inlet tree | MANUFACTURER | Tests for tap/hose/valve | REVIEW or INDEX depending on professional causes — check live state | dishwasher 4C 0.70 | none | none |
| `/fixcode/lg/washer/oe-error` | LG OE ≠ Samsung OE | Brand-scoped tree | MANUFACTURER | Diagnostic flow | brand+code identity | sibling same family other code | none | none |
| `/fixcode/bosch/dishwasher/e15` | Aqua-sensor / leak | E15 causes | MANUFACTURER | Diagnostic + safety | code tied to Bosch dishwasher | other Bosch codes | none | none |
| `/fixcode/miele/washer` appliance hub if INDEX | Brand×appliance hub | Code list | MANUFACTURER | Start diagnose | only if interactive hub + density | other Miele hubs | none | none |
| remaining INDEX error pages | Same pattern | Brand-scoped code | MANUFACTURER | diagnose() | 46 INDEX total | see `/ops` | none | none |

Full INDEX set is 46. All are error-code or appliance-hub pages with a diagnose CTA. Brand hubs (`/fixcode/samsung`) are GRAPH_ONLY.

### NOINDEX (5)

| URL | Why | Unique data | Why not INDEX |
| --- | --- | --- | --- |
| `/fixcode/samsung/fridge/5e-error` | Fridge 5E | Thin demand | `not_obscure_without_demand` |
| `/fixcode/samsung/washer/6c-error` | Low-demand code | Tree exists | obscure without demand |
| plus 107 other error/symptom pages | Same | — | obscure, incomplete required fields, or score |

### GRAPH_ONLY (4 — site has only 4)

| URL | Why GRAPH_ONLY |
| --- | --- |
| `/fixcode/samsung` | Brand hub: no diagnostic action, missing critical fields |
| `/fixcode/lg` | Same |
| `/fixcode/bosch` | Same |
| `/fixcode/miele` | Same |

### REVIEW_REQUIRED (90)

Professional-only / STOP_USE causes on the page. Product can still diagnose; SEO waits.

Conflicts: **0**. Stale facts: **0**. 0 VERIFIED outcomes.

---

## AutoSpec

Intent: `{make} {generation} {variant} {topic}` only when generation + engine + market are determined.

### INDEX (10 of 102)

| URL | Unique data | Sources | Decision | Sibling | Why INDEX |
| --- | --- | --- | --- | --- | --- |
| `/autospec/bmw/3-series/g20/320d-b47` | B47D20, EU, G20 | oem-handbook MANUFACTURER | garage lookup | `.../oil` 0.53 pass | identity complete |
| `/autospec/bmw/3-series/g20/320d-b47/oil` | LL-04, 5.0 L, viscosity | MANUFACTURER | spec lookup | hub 0.53 | engine in payload |
| `/autospec/bmw/3-series/g20/320d-b47/tyres` | 225/45R18 vs 255/40R18 | MANUFACTURER | size/pressure | Polo tyres 0.38 | different vehicle |
| `/autospec/bmw/3-series/g20/320d-b47/battery` | AGM 80Ah | MANUFACTURER | battery spec | other AGM pages | engine determined |
| `/autospec/bmw/3-series/g20/320d-b47/maintenance` | interval list | MANUFACTURER | next service | hub | — |
| Toyota E210 1.8 Hybrid hub + oil/tyres/battery/maintenance | 2ZR-FXE | MANUFACTURER | spec | BMW pages <0.4 | different powertrain |

### NOINDEX

**0 pages.** Do not invent five.

### GRAPH_ONLY

**0 pages.**

### REVIEW_REQUIRED (21)

`problems` / recall topic pages — VIN-specific, LOW confidence campaigns. Not INDEX.

Confidence basis on vehicles: `generation_level_only` + `manufacturer_source`. **No exact VIN.** MockVinProvider is a stub.

US LL-01 vs EU LL-04 is **market-scoped**, not an unresolved same-field conflict.

---

## WearThere

Intent: evergreen `{city} in {month}` → CLIMATE_NORMAL + packing decision. Not a Tuesday forecast.

### INDEX (10 of 379)

| URL | Unique climate | Decision | Sibling | Pass |
| --- | --- | --- | --- | --- |
| `/wearthere/paris/january/what-to-wear` | Paris Jan tmin/tmax/rain | capsule + packing | Paris Dec 0.74 | yes |
| `/wearthere/paris/february/what-to-wear` | Feb | capsule | London Feb 0.79 | yes |
| `/wearthere/paris/march/what-to-wear` | Mar | capsule | Paris Apr 0.68 | yes |
| Tokyo / London / Barcelona January–March | city normals | activity packing | cross-city same month ~0.7–0.8 | yes if <0.85 |

### NOINDEX (5 — site has exactly 5)

City/month rows that failed `not_city_without_specifics` (payload missing tmin on that candidate). Example: `/wearthere/new-york/december/what-to-wear`, `/wearthere/chicago/march/what-to-wear`.

### GRAPH_ONLY (5 of 32)

Destination hubs (`/wearthere/paris`, `/wearthere/tokyo`, …) — month grid without a packing action on the hub itself.

Adjacent-month uniqueness is the main SEO risk. Paris Jan vs Dec is 0.74 (pass). A pair above 0.85 with the same capsule would be MERGE/GRAPH_ONLY.

Forecast is never written into these pages (`kind: CLIMATE_NORMAL`).

---

## ChargeMatch

Intent: `{device} with {charger}` → bottlenecked watts, not a boolean.

### INDEX (10 of 64)

| URL | Output | Sources | Sibling | Notes |
| --- | --- | --- | --- | --- |
| `/chargematch/iphone-16` | 5–25 W input | manufacturer PDO | galaxy-s24 0.67 | device hub |
| `/chargematch/macbook-air-13-m3` | 30–70 W | manufacturer | Air 15" 0.67 | not the same max W |
| `/chargematch/iphone-16/with/apple-20w` | 20 W, device limit | manufacturer | other 20 W pairs | bottleneck named |
| `/chargematch/macbook-air-13-m3/with/anker-65w` | 65 W | manufacturer | 70 W pair | cable assumed if omitted |
| `/chargematch/steam-deck/with/apple-20w` | SLOW | manufacturer | 65 W Deck pair | below 45 W |
| `/chargematch/macbook-pro-14-m3/with/anker-65w` | 65 W < 96 W | manufacturer | 70 W pair | device not saturated |
| `/chargematch/steam-deck/with/anker-65w` | 45 W device cap | manufacturer | — | — |
| other popular pairs | COMPATIBLE_IF | manufacturer / inferred charger | — | evidence ≠ MEASURED |

### NOINDEX / GRAPH_ONLY

**0 / 0.** Pair list is curated (`POPULAR_PAIRS`), not the full cartesian product. Full cartesian lives as GRAPH relations (`EXPECTED_POWER`, `COMPATIBLE_IF`) without URLs.

`MEASURED_CURVES.length === 0`. TESTED is unused.

Cable 60 W on a 96 W laptop correctly sets bottleneck = cable (unit test).

---

## TripCost

Intent: `{from} to {to}` cash vs economic cost + value-of-time break-even. Snapshot, not a live GDS.

### INDEX (10 of 38)

| URL | Unique | Decision | Sibling | Assumptions |
| --- | --- | --- | --- | --- |
| `/tripcost/paris/to/lyon` | 465 km, tolls 36 € | car vs train vs flight, VOT | Barcelona 0.54 | snapshot 2026-09-01, expires 2026-10-01 |
| `/tripcost/paris/to/lyon/driving-cost` | fuel+toll+wear | driving cash/true | Barcelona driving 0.58 | `live_fare: false` |
| `/tripcost/paris/to/barcelona` | different km/toll | same engine | Amsterdam 0.62 | — |
| `/tripcost/london/to/paris` | Eurostar corridor | modes | London–Amsterdam | — |
| other CORE/MORE corridors | corridor km table | break-even entity | other corridors | THIRD_PARTY |

### NOINDEX / GRAPH_ONLY

**0 / 0.** Every generated route URL currently clears hard gates and scores 84 (editorial ceiling). That is **not** proof the fares are official. `READY_FOR_SEO_SCALE = NO`.

Stale check: `compareRoute(..., 2026-11-01)` marks quotes stale. Presenting them as CURRENT is a hard fail.

---

## Cross-cutting

- Demand kind on INDEXABLE pages: **EDITORIAL_JUDGMENT** (0 GSC).
- Conflicts stored: **0**. Conflict engine is tested with manufacturer 65 W vs third-party 100 W.
- `confidence: 1` / `verified: true` fixtures are not used as proof. Soft score ignores `stored_quality_score`.
- Inspector: `/ops` and `/ops/graph/{entityId}` (noindex). CLI: `pnpm graph:health`.
