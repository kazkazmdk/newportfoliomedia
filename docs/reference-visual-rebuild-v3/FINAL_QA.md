# FINAL QA — reference visual rebuild v3

Baseline HEAD: `461a1486985b481f1ad883f3acf05f146bce6501`  
V2 folder kept. This pass is a closure pass, not a redesign.

Status words: **STRONG / ACCEPTABLE / WEAK / NOT VERIFIED**  
Every claim below is tagged **VERIFIED BY CODE**, **VERIFIED BY SCREENSHOT**, or **NOT VERIFIED**.

## Harness

| check | result | proof |
| --- | --- | --- |
| Dynamic screenshots assert state before capture | VERIFIED BY CODE | `tests/visual-qa/reference-parity-v3.spec.ts` |
| Reference capture validates text, height, blocker, hero | VERIFIED BY CODE | `validateReferencePage()` |
| Full-page height > viewport | VERIFIED BY CODE | matrix assertion + fullpage PNGs taller than 1000px |
| Asset dimensions via `image-size` | VERIFIED BY CODE | `pnpm asset:inspect` — PASS / WARN / FAIL / NOT_VERIFIED. Unknown dims are never PASS |
| No silent TripCost fallback | VERIFIED BY CODE | `findScenarioByBestMode()` returns null for train/car/flight |

## WearThere

| axis | status | claim |
| --- | --- | --- |
| Hemisphere / profile | ACCEPTABLE | `seasonProfileOf` + `seasonOfMonth(month, profile)`. Sydney January = summer. Singapore = tropical. Dubai = desert. **VERIFIED BY CODE** (`media-catalog.test.ts`) |
| Seasonal media | ACCEPTABLE | Tokyo/Paris/London/Lisbon/NY have 4 temperate overrides. Most cities `fallbackUsed=true`. Report: `SEASONAL_MEDIA.md`. **VERIFIED BY CODE** |
| Pack contrast | ACCEPTABLE | Local scrim + garment drop-shadow. No opaque card. **VERIFIED BY SCREENSHOT** `wearthere-pack.png` |
| Nov / Jul / Pack QA | ACCEPTABLE | aria-pressed, hero src change, `data-view`. **VERIFIED BY SCREENSHOT** |
| Redesign | none | Composition unchanged. **VERIFIED BY CODE** |
| Remaining gap | WEAK | Seasonal rasters not industrialized for south/tropical/desert cities. |

## AutoSpec

| axis | status | claim |
| --- | --- | --- |
| Feature reference | NOT VERIFIED | Porsche cars URL rendered a loading frame, not a mechanical still. Cannot compare engine plate to a Porsche bay. |
| Home reference | WEAK | Hub capture exists; it is cinematic chrome, not a technical system. |
| Plates | ACCEPTABLE | Graph plates for engine/tyres/12V/service. Responsive: plate is in-flow under 1100px. **VERIFIED BY CODE** |
| Honesty | WEAK | Manifest marks body-only rasters WEAK. No fake engine imagery. **VERIFIED BY CODE** |
| Dynamic zones | ACCEPTABLE | `data-zone` + visible `.as-plate.is-*` + copy asserts. **VERIFIED BY SCREENSHOT** |
| Remaining gap | WEAK | No licensed bay/tyre/battery stills. Feature reference not mechanically proven. |

## ChargeMatch

| axis | status | claim |
| --- | --- | --- |
| Truth fix | ACCEPTABLE | Cable highlights only when `limitingComponent === "cable"`. Device / port / allocation are separate. **VERIFIED BY CODE** |
| Why W | ACCEPTABLE | Four rows; `is-limit` + `← limit` on the real bottleneck. **VERIFIED BY CODE** |
| `data-limit` / `data-watts` | ACCEPTABLE | On `.cm-verdict` and `.cm-bench-scene`. QA asserts device / cable / port. **VERIFIED BY SCREENSHOT** |
| Hardware | WEAK | Authored class-form-factor rasters (phone, laptop, bricks) stored locally. Recognizable, not manufacturer photography. Cable is a connecting path, not a floating icon. **VERIFIED BY SCREENSHOT** `chargematch-device-limit.png` |
| Feature reference | NOT VERIFIED | Zaptec Go URL failed acceptance. Existing capture is a typography index, not visible hardware. |
| Multiport | ACCEPTABLE | Physical tree is primary. Diagram lives under Allocation details. **VERIFIED BY CODE** |
| Remaining gap | WEAK | Medium is still raster/SVG class, not product photography. Charger-as-distinct-engine-limit does not exist in `powerChain` — not fabricated. |

## FixCode

| axis | status | claim |
| --- | --- | --- |
| Step paths | ACCEPTABLE | `diagnosticPath(step)` — source / hose / valve / control are distinct. Control is a signal path. **VERIFIED BY CODE** |
| QA | ACCEPTABLE | `data-water-step-active` asserted before each shot. **VERIFIED BY SCREENSHOT** |
| Non-water mapping | ACCEPTABLE | `zoneFromText` unit tests: drain→pump, motor→motor, door lock→door, heater→heater. **VERIFIED BY CODE** |
| Reference parity | WEAK | Schematic vs Shinkei photography. Feature capture not verified on the last pass. |
| Remaining gap | WEAK | Medium remains a plate, not industrial photography. |

## TripCost

| axis | status | claim |
| --- | --- | --- |
| Spider removal | ACCEPTABLE | Full `ROUTES.map` at 0.04 removed. Max 4 contextual corridors. **VERIFIED BY CODE** |
| Mode states | ACCEPTABLE | `data-best-mode` / `data-mode` on result hero and map. **VERIFIED BY CODE** |
| Named train/car/flight | NOT AVAILABLE IN DATASET | `findScenarioByBestMode` only finds `bus` (Paris→Lyon, 1) and `ev` (Paris→Lyon, 4). No silent fallback. **VERIFIED BY CODE** |
| Verified screenshots | ACCEPTABLE | `tripcost-bus.png`, `tripcost-ev.png` with asserted attributes. |
| Tolls / chargers | ACCEPTABLE | No fake geo markers. Legend only: TOLL COST MODELLED / CHARGE STOPS MODELLED · schematic. **VERIFIED BY CODE** |
| Hierarchy | ACCEPTABLE | Desktop: endpoints → mode → time → € PP → Best for N. Extra type hidden on mobile to keep fold. **VERIFIED BY CODE** |
| Remaining gap | WEAK | Atlas is still schematic. Feature map reference NOT VERIFIED (timeout). Train/car/flight are not real best-modes in current cash ranking (bus/EV win). |

## Visual QA inventory (v3)

Penta current: fold / fullpage / mobile for 5 homes + 5 decisions; WearThere nov/jul/pack; AutoSpec body/engine/tyres/battery/service; ChargeMatch device/cable/port; FixCode steps 01–04; TripCost bus/ev.

Official: WearThere, AutoSpec hub, ChargeMatch home, FixCode, TripCost home captured. Feature hardware/mechanical stills: **NOT VERIFIED**.

## Tests run

| script | result |
| --- | --- |
| `pnpm lint` | pass |
| `pnpm typecheck` | pass |
| `pnpm test` | 188 passed |
| `pnpm qa:visual` | v3 dynamic + matrix pass; product-first fold pass after compacting result type; official refs pass after per-URL timeout |
| `pnpm build` | pass |
| `pnpm truth-gate` | ok |
| `pnpm seo:audit` | ok |
| `pnpm sitemap:audit` | ok |
| `pnpm asset:inspect` | dimensions read via image-size; PASS/WARN only |

PUBLIC_SITE_LIVE remains false.
