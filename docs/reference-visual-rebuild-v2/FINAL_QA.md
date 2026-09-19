# FINAL QA — reference parity closure

Baseline HEAD: `101a3d05b9b9b01f0b33a465f92ab2f6b709fb4e`

Statuses: STRONG / ACCEPTABLE / WEAK / NOT VERIFIED  
No self-scored percentages.

Official surfaces captured in `reference/`. Penta in `current/`. Side-by-side in `comparison/`.

---

## WearThere

REFERENCE  
`reference/wearthere-desktop-1440x1000.png` — InsideAsia Tours / month (`https://www.insideasiatours.com/month`). Editorial month gallery, photography first.

BASELINE 101a3d0  
Full-bleed Tokyo stage, month rail, Climate/Pack, same hero photo per city.

V2 AFTER  
`current/wearthere-climate-nov.png`, `current/wearthere-climate-jul.png`, `current/wearthere-pack.png`, `comparison/wearthere-home-desktop.png`.

WHAT CHANGED  
Tokyo/Paris/London/Lisbon/NYC now swap licensed seasonal stills. July Tokyo is a different night street, not a recolor. Pack items use overlap composition instead of a four-up icon row. Month change uses a CSS scene-in fade.

WHAT STILL DOES NOT MATCH  
InsideAsia is a month *gallery*. WearThere is one destination scene. Pack garments stay SVG linework and go faint on bright summer stills (`wearthere-pack.png`).

| Axis | Status | Evidence | Gap | Correction if any |
| --- | --- | --- | --- | --- |
| HEADER | ACCEPTABLE | `current/wearthere-home-desktop-fold.png` | Mast is quieter than InsideAsia chrome | None — locked DA |
| FIRST VIEWPORT | ACCEPTABLE | Nov/Jul shots | Photo dominates; month rail is present | — |
| OBJECT/IMAGERY | ACCEPTABLE | Seasonal files in `media-catalog.ts` | Not 12 unique months; 4 season families | Enough for climate change |
| COMPOSITION | ACCEPTABLE | Pack + figure CSS | Pack still graphic, not wardrobe photography | Staging only, no ecommerce cards |
| INTERACTION | ACCEPTABLE | Month rail + Climate/Pack | — | — |
| MOTION | ACCEPTABLE | `wt-scene-in` 480ms, reduced-motion off | Crossfade is image remount, not dual-buffer | Honest CSS fade |
| BELOW FOLD | ACCEPTABLE | fullpage shots | Capsule figure is still SVG | — |
| MOBILE | ACCEPTABLE | `wearthere-home-mobile-fold.png` | City, month, climate, CTA in fold | Bounding-box assertion added |
| OVERALL POLISH | ACCEPTABLE | — | Pack contrast on summer photos | — |
| REFERENCE PARITY | ACCEPTABLE | `comparison/wearthere-home-desktop.png` | Different structure (one scene vs month grid) | Not a second redesign |

---

## AutoSpec

REFERENCE  
`reference/autospec-desktop-1440x1000.png` — Porsche Motorsport Hub (`https://racing.porsche.com/`). First paint is a dark video shell with a play mark, not a still vehicle.

BASELINE 101a3d0  
Licensed G20 body. ENGINE/TYRES/BATTERY/SERVICE only scaled/translated the same photo.

V2 AFTER  
`current/autospec-body.png`, `autospec-engine.png`, `autospec-tyres.png`, `autospec-battery.png`, `autospec-service.png`.

WHAT CHANGED  
Zone changes now dim the body still and bring an honest technical plate (B47D20 / fitment / 12V / interval). No fake X-ray. Below-fold split into ownership timeline vs maintenance system. Oswald pulled back on layer values.

WHAT STILL DOES NOT MATCH  
No licensed engine bay, wheel, or battery still. Porsche cinema is video. Plates are graph identity, not photography.

| Axis | Status | Evidence | Gap | Correction if any |
| --- | --- | --- | --- | --- |
| HEADER | ACCEPTABLE | current home fold | Sparse mast | — |
| FIRST VIEWPORT | ACCEPTABLE | `autospec-body.png` | Vehicle is the object | — |
| OBJECT/IMAGERY | WEAK | `autospec-engine.png` | ENGINE is a plate on the same body photo | Documented: no licensed bay still |
| COMPOSITION | ACCEPTABLE | plate + dimmed body | Not a new 3D crop | Honest technical layer |
| INTERACTION | ACCEPTABLE | zone rail including body | — | — |
| MOTION | ACCEPTABLE | plate fade 420ms | No 3D gimmick | — |
| BELOW FOLD | ACCEPTABLE | home fullpage | Two compositions, not five equal cards | — |
| MOBILE | ACCEPTABLE | mobile fold | Car + system rail in fold | — |
| OVERALL POLISH | ACCEPTABLE | — | Plate can cover the car on small widths | — |
| REFERENCE PARITY | WEAK | `comparison/autospec-home-desktop.png` | Porsche capture is a paused video, not a car still | Cannot invent motorsport footage |

---

## ChargeMatch

REFERENCE  
`reference/chargematch-desktop-1440x1000.png` — Zaptec homepage. Dark type hero (“Power adventure”). Hardware photography is not in this first viewport.

BASELINE 101a3d0  
Stroked SVG silhouettes, four selects, blueprint grid on the pair stage.

V2 AFTER  
`current/chargematch-default.png`, `chargematch-device-limit.png`, `chargematch-multiport-two.png`, `comparison/chargematch-home-desktop.png`.

WHAT CHANGED  
Filled hardware library (phone/laptop/brick/cable), watt label on the cable, Why 27W? disclosure, compact Change rows, blueprint grid removed from the pair stage, multiport recomposes with a brick + two cables + two devices.

WHAT STILL DOES NOT MATCH  
Objects still read as **illustrated icons**, not product renders. Zaptec materiality (machined aluminium, glass, photography) is not reached. Side-by-side is no longer empty, but it is not flattering.

| Axis | Status | Evidence | Gap | Correction if any |
| --- | --- | --- | --- | --- |
| HEADER | ACCEPTABLE | home fold | Quiet product mast | — |
| FIRST VIEWPORT | ACCEPTABLE | `chargematch-default.png` | DEVICE / WATTS / CHARGER held | Selects still visible for tests |
| OBJECT/IMAGERY | WEAK | same + multiport | Rounded-rect phone, block brick | SVG library improved; still not hardware photography |
| COMPOSITION | ACCEPTABLE | calm paper, watt dominates | — | — |
| INTERACTION | ACCEPTABLE | Change / Why W? / multiport | Cable & port is secondary | — |
| MOTION | ACCEPTABLE | current dot on cable | Reduced-motion hides the dot | — |
| BELOW FOLD | ACCEPTABLE | result fullpage | Proof stays in details | — |
| MOBILE | ACCEPTABLE | mobile fold | Both objects + W + CTA in fold | — |
| OVERALL POLISH | WEAK | comparison desktop | Hardware still icon-grade | Do not call this material |
| REFERENCE PARITY | WEAK | `comparison/chargematch-home-desktop.png` | Zaptec first viewport is cinema type; objects still fail the icon test | Honest WEAK |

---

## FixCode

REFERENCE  
`reference/fixcode-desktop-1440x1000.png` — Shinkei Systems. Industrial photography / machine-in-place, not a schematic.

BASELINE 101a3d0  
`.fc-machine { max-width: 420px }` line-art.

V2 AFTER  
`current/fixcode-home-desktop-fold.png`, `fixcode-step-01.png`…`04.png`.

WHAT CHANGED  
Machine width is `clamp` toward 650–900px on desktop. Anatomy now has tap, hose, valve, drum/motor, pump/drain, heater coils, sensor, control, lock. Water steps change the hot path. First check is a plate instruction, not a bordered card.

WHAT STILL DOES NOT MATCH  
It is still a **technical schematic**, not a photographed machine. Richer than a pictogram, not Shinkei.

| Axis | Status | Evidence | Gap | Correction if any |
| --- | --- | --- | --- | --- |
| HEADER | ACCEPTABLE | home fold | Paper / signal mast | — |
| FIRST VIEWPORT | ACCEPTABLE | home fold | Giant 4C + machine | — |
| OBJECT/IMAGERY | ACCEPTABLE | home fold | Internal parts exist | Not photographic |
| COMPOSITION | ACCEPTABLE | desktop split | Machine can dominate | — |
| INTERACTION | ACCEPTABLE | step 01–04 shots | Sticky path highlights | — |
| MOTION | ACCEPTABLE | stroke color change | No fake 3D | — |
| BELOW FOLD | ACCEPTABLE | error fullpage | Scroll steps | — |
| MOBILE | ACCEPTABLE | error mobile fold | Code + first check; machine peeks | Full anatomy stays desktop |
| OVERALL POLISH | ACCEPTABLE | — | Line-art limit | — |
| REFERENCE PARITY | WEAK | comparison desktop | Shinkei is photographed hardware | Schematic cannot pretend otherwise |

---

## TripCost

REFERENCE  
`reference/tripcost-desktop-1440x1000.png` — Made for Spain & Portugal homepage. Editorial photography / destination browse. Tall + mobile official captures: NOT VERIFIED (timeout after desktop).

BASELINE 101a3d0  
Blue GIS fill, debug grid, uniform city ticks.

V2 AFTER  
`current/tripcost-home-desktop-fold.png`, `tripcost-train.png`, `tripcost-car.png`, `tripcost-flight.png`, `tripcost-break-even.png`.

WHAT CHANGED  
Grid removed. Water / land / regional field / country labels. Paris / Lyon use display type. Mode marks (stations, toll, charge, airport). Decisions spatialized. Break-even is a typed event over the chart.

WHAT STILL DOES NOT MATCH  
Land is still one authored blob. Unused corridors still draw a spider. It is a cleaner atlas, not Made-for-Spain photography.

| Axis | Status | Evidence | Gap | Correction if any |
| --- | --- | --- | --- | --- |
| HEADER | ACCEPTABLE | home fold | Atlas mast | — |
| FIRST VIEWPORT | ACCEPTABLE | home fold | Route is the hero | Spider of other corridors remains |
| OBJECT/IMAGERY | ACCEPTABLE | home fold | No GIS grid | Landmass is schematic |
| COMPOSITION | ACCEPTABLE | decisions left/center/right | — | — |
| INTERACTION | ACCEPTABLE | train/car/flight shots | Mode changes marks | — |
| MOTION | ACCEPTABLE | path dash | Reduced-motion off | — |
| BELOW FOLD | ACCEPTABLE | `tripcost-break-even.png` | Event + graph | — |
| MOBILE | ACCEPTABLE | mobile fold | Route + endpoints + compare | Result title compacted to keep verdicts |
| OVERALL POLISH | ACCEPTABLE | — | Still diagrammatic | — |
| REFERENCE PARITY | WEAK | comparison desktop | Official site is photography; we have an SVG atlas | Honest WEAK |

---

## Capture inventory

- Reference: 4 products × 3 viewports captured. TripCost tall + mobile NOT VERIFIED.
- Current: fold / tall / fullpage / mobile for 5 homes + 5 decision pages.
- Dynamic: WearThere Nov/Jul/Pack, AutoSpec 5 zones, ChargeMatch default/device/cable/multiport, FixCode 01–04, TripCost train/car/flight/break-even.
- Comparison: home desktop + home mobile + decision desktop per product (except TripCost mobile official).

## Asset gate

`pnpm asset:inspect` — primary WearThere / AutoSpec rasters present. ImageMagick `identify` not installed, so pixel dimensions report as unknown; byte sizes are large enough that 300×200 stretch is not the failure mode.
