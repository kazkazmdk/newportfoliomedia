# FINAL QA — reference visual rebuild v4

Baseline HEAD before this pass: `5f9964e` then follow-up commits on `main`.  
v2 / v3 folders kept. This is a chrome + world/hardware pass, not an engine rewrite.

Status words: **STRONG / CLOSE / WEAK / NOT VERIFIED / NOT AVAILABLE IN DATASET**  
Claims are tagged **VERIFIED BY CODE**, **VERIFIED BY SCREENSHOT**, or **NOT VERIFIED**.

`PUBLIC_SITE_LIVE` remains `false`.

## Status system (honest)

| flag | this pass |
| --- | --- |
| `REFERENCE_CAPTURE_PASS` | **false** — home editorial captures exist; ChargeMatch feature, FixCode feature, TripCost editorial feature, TripCost functional feature are `NOT_VERIFIED` |
| `STRUCTURAL_ALIGNMENT_PASS` | **true** — header > 20px and a visible product object. Not a design score. |
| `REGRESSION_PASS` | v4 Playwright matrix + state tests passed, including a ready OpenStreetMap canvas |
| `MANUAL_VISUAL_STATUS` | **NOT_REVIEWED** — this environment captured screenshots; it did not perform a human aesthetic review |
| `REFERENCE_PARITY_PASS` | **false** — forbidden without verified home + feature references, structural + regression pass, **and** `MANUAL_PASS` |

## Harness

| check | result | proof |
| --- | --- | --- |
| lint | pass | `pnpm lint` |
| typecheck | pass | `pnpm typecheck` |
| unit tests | 195 pass | `pnpm test` |
| truth-gate / SEO / sitemap | pass | `PUBLIC_SITE_LIVE=false`, empty public sitemap |
| asset inspect | class rasters PASS; older v3 captures may WARN | `pnpm asset:inspect` |
| visual QA v4 | 3/3 pass | `tests/visual-qa/reference-parity-v4.spec.ts` |
| TripCost worker | required | `/maplibre-gl-worker.mjs` + `/maplibre-gl-shared.mjs` |

## WearThere

WHAT CHANGED  
Editorial mast (`wt-issue`) with destination/month search; magazine colophon footer (`wt-colophon`); climate-class scene fallback instead of Tokyo rain for unmapped cities; photo no longer intercepts month clicks.

WHAT IMPROVED  
Header is a travel mast, not a SaaS bar. Hero photography still owns the fold. Footer is a last-page index (destinations / months / climates / method). **VERIFIED BY SCREENSHOT** `wearthere-home-desktop-fold.png`, `wearthere-home-desktop-fullpage.png`.

WHAT STILL LOOKS WEAK  
Climate library is class scenes, not a unique photo per city. Several atlas thumbnails reuse the same autumn street. No cold-continental profile exists in the climate model, so none was invented.

REFERENCE STATUS  
Home + month feature captured (InsideAsia). **NOT a parity pass.**

STRUCTURAL STATUS  
Desktop header ~108px over a full-bleed hero. Mobile keeps the photograph first.

MOBILE STATUS  
Month rail and destination remain on the photo. Header is thin. **VERIFIED BY SCREENSHOT** `wearthere-home-mobile-fold.png`.

DATA TRUTH STATUS  
Copy still says typical climate, not a live forecast. **VERIFIED BY CODE**.

MANUAL VISUAL STATUS  
`NOT_REVIEWED`.

## AutoSpec

WHAT CHANGED  
Bay header with active vehicle (`as-bay`); technical-manual footer (`as-manual`); system zones swap the main still and carry `System class reference`.

WHAT IMPROVED  
BODY is the licensed vehicle. ENGINE / TYRES / BATTERY / SERVICE use different class rasters. **VERIFIED BY SCREENSHOT** `autospec-body.png` vs `autospec-engine.png`. Graph plates remain the data source.

WHAT STILL LOOKS WEAK  
System stills are class references (combustion bay is not a Tesla X-ray; 12V tray is not this car’s battery). Manifest status stays `WEAK`. Porsche mechanical feature capture is cinema, not a bay.

REFERENCE STATUS  
Home + cars hub captured. Mechanical feature still **NOT_VERIFIED** as a system photograph.

STRUCTURAL STATUS  
Compact dark header (~66px). Vehicle occupies the fold.

MOBILE STATUS  
Vehicle + zone rail remain the first screen.

DATA TRUTH STATUS  
Class-reference labels are mandatory off-body. **VERIFIED BY CODE**.

MANUAL VISUAL STATUS  
`NOT_REVIEWED`.

## ChargeMatch

WHAT CHANGED  
Bare header (`cm-bare`); hardware-company footer (`cm-hw-footer`); hardware media model; device / cable / charger class rasters; limit treatment from `limitingComponent` only.

WHAT IMPROVED  
Desktop fold now shows **device — cable — charger — watts**. Objects are authored photoreal class stills, labelled class reference. Device / cable / port limits asserted. **VERIFIED BY SCREENSHOT** `chargematch-home-desktop-fold.png`, `chargematch-device-limited.png`.

WHAT STILL LOOKS WEAK  
CLOSE — hardware imagery is still class, not licensed product photography. Cable is a short class still, not a connected port-to-port photograph. Mobile clips the charger column on 390px. `powerChain` has no distinct `"charger"` limit (port / allocation are used; not fabricated).

REFERENCE STATUS  
Zaptec home captured. Zaptec Go feature **NOT_VERIFIED**.

STRUCTURAL STATUS  
Header is the thinnest of the five (~64px). Objects + result share the fold on desktop.

MOBILE STATUS  
Device, cable and result are immediate; charger is present but tight. **VERIFIED BY SCREENSHOT** `chargematch-home-mobile-fold.png`.

DATA TRUTH STATUS  
A photograph never implies compatibility. Limit highlight follows `limitingComponent`. **VERIFIED BY CODE**.

MANUAL VISUAL STATUS  
`NOT_REVIEWED`.

## FixCode

WHAT CHANGED  
Diagnostic console header (`fc-console`) with brand / appliance / code; industrial-manual footer (`fc-manual`); washer class photo under the live schematic.

WHAT IMPROVED  
Schematic paths source / hose / valve remain distinct. Physical machine is a labelled class reference, not a replacement for the diagram. **VERIFIED BY SCREENSHOT** `fixcode-source.png`.

WHAT STILL LOOKS WEAK  
The washer still is a class front-load, not a Samsung serial. Schematic remains the diagnostic; materiality is still modest.

REFERENCE STATUS  
Shinkei home captured. Feature **NOT_VERIFIED**.

STRUCTURAL STATUS  
Search lives in the header. Anatomy + schematic stay the first product object.

MOBILE STATUS  
Search + machine remain above the long copy.

DATA TRUTH STATUS  
`diagnosticPath` unchanged. Class photo is not claimed exact. **VERIFIED BY CODE**.

MANUAL VISUAL STATUS  
`NOT_REVIEWED`.

## TripCost

WHAT CHANGED  
Planner header (`tc-planner`); atlas footer (`tc-atlas-footer`); MapLibre + OpenFreeMap Positron as the primary map; honest corridor / great-circle wording; same-origin MapLibre worker.

WHAT IMPROVED  
The home scene is real OpenStreetMap geography (France, coasts, cities, borders) plus a labelled **connection corridor**, not fake Europe land. Comparison cards stay in HTML. Train / car / flight best-modes are **NOT AVAILABLE IN DATASET**; bus and EV were captured from real rankings. **VERIFIED BY SCREENSHOT** after worker fix; **VERIFIED BY CODE** `findScenarioByBestMode`.

WHAT STILL LOOKS WEAK  
CLOSE — no turn-by-turn routing (and none claimed). TripCost paint on Positron is a light restyle, not a custom vector atlas. Cookie banner can cover the lower map until dismissed. Result page still leads with type, then the world map.

EDITORIAL REFERENCE  
Made for Spain — mood / spacing / type only. Home captured.

FUNCTIONAL REFERENCE  
Rome2Rio Paris–Lyon — **NOT_VERIFIED** (capture failed). Not used as functional parity.

STRUCTURAL STATUS  
Header is the route planner. Map canvas has a real height. Comparison exists outside the canvas.

MOBILE STATUS  
Origin / destination / modelled results sit on the map. **VERIFIED BY SCREENSHOT** `tripcost-home-mobile-fold.png`.

DATA TRUTH STATUS  
Corridor note denies “road route”. No invented fares, stations, or charging stops on the canvas. **VERIFIED BY CODE**.

MANUAL VISUAL STATUS  
`NOT_REVIEWED`.

## Visual QA inventory (v4)

Penta current: desktop fold / fullpage / mobile for 5 homes; WearThere Jan / Jul / Nov / Pack; AutoSpec body / engine / tyres / battery / service; ChargeMatch device / cable / port + multiport; FixCode source / hose / valve; TripCost bus / EV + NOT_AVAILABLE notes for train / car / flight.

Official: WearThere, AutoSpec, ChargeMatch home, FixCode home, TripCost editorial home captured. Feature hardware / Shinkei / Made-for-Spain feature / Rome2Rio: **NOT_VERIFIED**.

## Closeout table

| Product | Header identity | Footer quality | Physical/world realism | Reference alignment | Mobile | Remaining weakness |
| --- | --- | --- | --- | --- | --- | --- |
| WearThere | Editorial mast | Magazine colophon | Destination photography + climate class scenes | Home captured · no parity | Photo first | Shared climate stills for unmapped cities |
| AutoSpec | Digital garage bay | Service-manual index | Licensed body + labelled system class stills | Cinema captured · bay NOT_VERIFIED | Vehicle + zone first | Exact-variant systems still WEAK |
| ChargeMatch | Bare object chrome | Hardware company | Class hardware objects on the fold | Zaptec home · Go NOT_VERIFIED | Device/cable/result first | CLOSE — class imagery, tight mobile charger |
| FixCode | Diagnostic console | Letter/manual index | Class washer under live schematic | Shinkei home · feature NOT_VERIFIED | Search + machine first | Schematic still dominates materiality |
| TripCost | Route planner | Atlas / corridors | Real OSM world + honest corridor | Editorial home · Rome2Rio NOT_VERIFIED | Planner + map + € | CLOSE — no routing data, light map paint |

No product is marked perfect. No `REFERENCE_PARITY_PASS`.
