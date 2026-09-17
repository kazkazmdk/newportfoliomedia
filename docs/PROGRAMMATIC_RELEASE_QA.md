# Programmatic release QA sample

This is an **automated review queue**, not a completed human QA pass.

Statuses:

- `NOT_REVIEWED` — no human review, automated checks incomplete or not run
- `AUTO_VERIFIED` — structural automated checks passed (canonical, robots state, decision surface, links, fingerprint, evidence/modelled label)
- `MANUAL_PASS` / `MANUAL_FAIL` — human only; this generator never writes them

No human has reviewed these URLs. Do not read this file as “100 URLs manually approved.”

Sample size: 119 URLs (target 10 Tier A + 8 B + 4 C + 3 rejected per product). Review queue size: 119.

## Automated checks (AUTO_VERIFIED)

- canonical self, or explicit redirect target
- noindex matches index_state
- main decision fields present
- internal link / hub / multi-entity
- decision fingerprint present
- evidence block or declared MODELLED assumptions

HTTP 200, structured-data parse, and mobile overflow need a running server and stay unchecked here.

## Sample

| Product | Tier | Template | Quality | State | QA | Score | URL |
| ------- | ---- | -------- | ------- | ----- | -- | ----: | --- |
| fixcode | A | error-code | 80-89 | PUBLISHABLE | AUTO_VERIFIED | 81 | `/fixcode/bosch/dishwasher/e15-error` |
| fixcode | A | error-code | 80-89 | PUBLISHABLE | AUTO_VERIFIED | 80 | `/fixcode/samsung/washer/ue-error` |
| fixcode | A | error-code | 80-89 | PUBLISHABLE | AUTO_VERIFIED | 80 | `/fixcode/lg/washer/ie-error` |
| fixcode | A | error-code | 80-89 | PUBLISHABLE | AUTO_VERIFIED | 80 | `/fixcode/lg/washer/oe-error` |
| fixcode | A | error-code | 80-89 | PUBLISHABLE | AUTO_VERIFIED | 80 | `/fixcode/lg/washer/ue-error` |
| fixcode | A | error-code | 70-79 | PUBLISHABLE | AUTO_VERIFIED | 79 | `/fixcode/samsung/washer/4e-error` |
| fixcode | A | error-code | 70-79 | PUBLISHABLE | AUTO_VERIFIED | 79 | `/fixcode/samsung/washer/5e-error` |
| fixcode | A | error-code | 70-79 | PUBLISHABLE | AUTO_VERIFIED | 79 | `/fixcode/lg/washer/de-error` |
| fixcode | A | error-code | 70-79 | PUBLISHABLE | AUTO_VERIFIED | 79 | `/fixcode/samsung/washer/1c-error` |
| fixcode | A | error-code | 70-79 | PUBLISHABLE | AUTO_VERIFIED | 79 | `/fixcode/samsung/washer/sud-error` |
| fixcode | B | error-code | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/fixcode/samsung/washer/te-error` |
| fixcode | B | error-code | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/fixcode/miele/washer/f70-error` |
| fixcode | B | error-code | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/fixcode/lg/dryer/d80-error` |
| fixcode | B | error-code | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/fixcode/samsung/washer/3c1-error` |
| fixcode | B | error-code | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/fixcode/samsung/washer/3c3-error` |
| fixcode | B | error-code | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/fixcode/samsung/washer/9c-error` |
| fixcode | B | error-code | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/fixcode/samsung/washer/11e-error` |
| fixcode | B | error-code | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/fixcode/samsung/washer/lc-error` |
| fixcode | C | symptom | <60 | PUBLISHABLE | AUTO_VERIFIED | 53 | `/fixcode/bosch/dishwasher/will-not-start` |
| fixcode | C | symptom | <60 | PUBLISHABLE | AUTO_VERIFIED | 53 | `/fixcode/bosch/dishwasher/not-draining` |
| fixcode | C | symptom | <60 | PUBLISHABLE | AUTO_VERIFIED | 53 | `/fixcode/bosch/dishwasher/standing-water` |
| fixcode | C | symptom | <60 | PUBLISHABLE | AUTO_VERIFIED | 53 | `/fixcode/samsung/washer/too-many-suds` |
| fixcode | — | error-code | 60-69 | LIMITED | AUTO_VERIFIED | 68 | `/fixcode/samsung/fridge/5e-error` |
| fixcode | — | error-code | 60-69 | LIMITED | AUTO_VERIFIED | 68 | `/fixcode/samsung/washer/6c-error` |
| fixcode | — | error-code | 60-69 | LIMITED | AUTO_VERIFIED | 68 | `/fixcode/samsung/washer/8e-error` |
| autospec | A | vehicle-hub | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/autospec/bmw/3-series/g20/320d-b47` |
| autospec | A | oil-type | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/autospec/bmw/3-series/g20/320d-b47/oil` |
| autospec | A | vehicle-hub | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/autospec/toyota/corolla/e210/1-8-hybrid` |
| autospec | A | oil-type | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/autospec/toyota/corolla/e210/1-8-hybrid/oil` |
| autospec | A | vehicle-hub | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/autospec/volkswagen/golf/mk8/2-0-tdi` |
| autospec | A | oil-type | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/autospec/volkswagen/golf/mk8/2-0-tdi/oil` |
| autospec | A | vehicle-hub | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/autospec/tesla/model-3/highland/rwd` |
| autospec | A | vehicle-hub | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/autospec/honda/civic/11/1-5-vtec` |
| autospec | A | oil-type | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/autospec/honda/civic/11/1-5-vtec/oil` |
| autospec | A | vehicle-hub | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/autospec/mercedes/c-class/w206/c220d` |
| autospec | B | tyre-pressure | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/autospec/bmw/3-series/g20/320d-b47/tyres` |
| autospec | B | maintenance-schedule | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/autospec/bmw/3-series/g20/320d-b47/maintenance` |
| autospec | B | tyre-pressure | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/autospec/toyota/corolla/e210/1-8-hybrid/tyres` |
| autospec | B | maintenance-schedule | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/autospec/toyota/corolla/e210/1-8-hybrid/maintenance` |
| autospec | B | tyre-pressure | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/autospec/volkswagen/golf/mk8/2-0-tdi/tyres` |
| autospec | B | maintenance-schedule | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/autospec/volkswagen/golf/mk8/2-0-tdi/maintenance` |
| autospec | B | tyre-pressure | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/autospec/tesla/model-3/highland/rwd/tyres` |
| autospec | B | maintenance-schedule | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/autospec/tesla/model-3/highland/rwd/maintenance` |
| autospec | C | battery | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/autospec/bmw/3-series/g20/320d-b47/battery` |
| autospec | C | common-problems | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/autospec/bmw/3-series/g20/320d-b47/problems` |
| autospec | C | battery | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/autospec/toyota/corolla/e210/1-8-hybrid/battery` |
| autospec | C | common-problems | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/autospec/toyota/corolla/e210/1-8-hybrid/problems` |
| wearthere | A | destination-hub | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/wearthere/paris` |
| wearthere | A | wear-month | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/wearthere/paris/winter/what-to-wear` |
| wearthere | A | packing-month | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/wearthere/paris/winter/packing` |
| wearthere | A | wear-month | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/wearthere/paris/march/what-to-wear` |
| wearthere | A | packing-month | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/wearthere/paris/march/packing` |
| wearthere | A | wear-month | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/wearthere/paris/april/what-to-wear` |
| wearthere | A | packing-month | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/wearthere/paris/april/packing` |
| wearthere | A | wear-month | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/wearthere/paris/may/what-to-wear` |
| wearthere | A | packing-month | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/wearthere/paris/may/packing` |
| wearthere | A | packing-month | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/wearthere/paris/june/packing` |
| wearthere | B | packing-month | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/wearthere/barcelona/winter/packing` |
| wearthere | B | packing-month | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/wearthere/barcelona/march/packing` |
| wearthere | B | packing-month | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/wearthere/barcelona/april/packing` |
| wearthere | B | packing-month | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/wearthere/barcelona/may/packing` |
| wearthere | B | packing-month | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/wearthere/barcelona/summer/packing` |
| wearthere | B | packing-month | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/wearthere/barcelona/september/packing` |
| wearthere | B | packing-month | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/wearthere/barcelona/october/packing` |
| wearthere | B | packing-month | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/wearthere/barcelona/november/packing` |
| wearthere | C | packing-month | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/wearthere/reykjavik/winter/packing` |
| wearthere | C | packing-month | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/wearthere/reykjavik/march/packing` |
| wearthere | C | packing-month | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/wearthere/reykjavik/april/packing` |
| wearthere | C | packing-month | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/wearthere/reykjavik/may/packing` |
| wearthere | — | wear-month | 60-69 | NOINDEX | AUTO_VERIFIED | 68 | `/wearthere/paris/june/what-to-wear` |
| wearthere | — | wear-month | 60-69 | NOINDEX | AUTO_VERIFIED | 68 | `/wearthere/paris/july/what-to-wear` |
| wearthere | — | wear-month | 60-69 | NOINDEX | AUTO_VERIFIED | 68 | `/wearthere/paris/august/what-to-wear` |
| chargematch | A | device-hub | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/chargematch/iphone-16` |
| chargematch | A | device-hub | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/chargematch/iphone-15` |
| chargematch | A | device-hub | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/chargematch/macbook-air-13-m3` |
| chargematch | A | device-hub | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/chargematch/macbook-pro-14-m3` |
| chargematch | A | device-hub | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/chargematch/ipad-pro-m4` |
| chargematch | A | device-hub | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/chargematch/steam-deck` |
| chargematch | A | device-hub | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/chargematch/galaxy-s24` |
| chargematch | A | device-hub | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/chargematch/pixel-8` |
| chargematch | A | device-hub | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/chargematch/nintendo-switch` |
| chargematch | A | device-wattage | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/chargematch/airpods-pro-usbc` |
| chargematch | B | can-charger-charge | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/chargematch/macbook-air-13-m3/with/apple-70w` |
| chargematch | B | can-charger-charge | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/chargematch/macbook-pro-14-m3/with/apple-70w` |
| chargematch | B | can-charger-charge | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/chargematch/macbook-air-15-m3/with/apple-70w` |
| chargematch | B | can-charger-charge | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/chargematch/ipad-air-m2/with/apple-20w` |
| chargematch | B | can-charger-charge | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/chargematch/ipad-air-m2/with/apple-30w` |
| chargematch | B | can-charger-charge | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/chargematch/pixel-9/with/anker-65w` |
| chargematch | B | can-charger-charge | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/chargematch/galaxy-s24-ultra/with/anker-65w` |
| chargematch | B | can-charger-charge | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/chargematch/galaxy-s24-ultra/with/apple-30w` |
| chargematch | C | can-charger-charge | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/chargematch/framework-13/with/anker-65w` |
| chargematch | C | can-charger-charge | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/chargematch/galaxy-tab-s9/with/anker-65w` |
| chargematch | C | can-charger-charge | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/chargematch/iphone-16/with/apple-5w` |
| chargematch | C | can-charger-charge | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/chargematch/iphone-16/with/xiaomi-90w` |
| chargematch | — | can-charger-charge | 60-69 | NOINDEX | AUTO_VERIFIED | 68 | `/chargematch/pixel-9/with/anker-45w` |
| chargematch | — | can-charger-charge | 60-69 | NOINDEX | AUTO_VERIFIED | 68 | `/chargematch/iphone-16/with/apple-30w` |
| chargematch | — | can-charger-charge | 60-69 | NOINDEX | AUTO_VERIFIED | 68 | `/chargematch/iphone-16/with/apple-70w` |
| tripcost | A | route-car-vs-train | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/tripcost/paris/to/lyon` |
| tripcost | A | route-driving | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/tripcost/paris/to/lyon/driving-cost` |
| tripcost | A | route-car-vs-train | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/tripcost/paris/to/barcelona` |
| tripcost | A | route-driving | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/tripcost/paris/to/barcelona/driving-cost` |
| tripcost | A | route-car-vs-train | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/tripcost/london/to/paris` |
| tripcost | A | route-driving | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/tripcost/london/to/paris/driving-cost` |
| tripcost | A | route-driving | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/tripcost/berlin/to/munich/driving-cost` |
| tripcost | A | route-car-vs-train | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/tripcost/paris/to/amsterdam` |
| tripcost | A | route-driving | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/tripcost/paris/to/amsterdam/driving-cost` |
| tripcost | A | route-driving | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/tripcost/paris/to/brussels/driving-cost` |
| tripcost | B | route-car-vs-train | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/tripcost/berlin/to/munich` |
| tripcost | B | route-car-vs-train | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/tripcost/paris/to/brussels` |
| tripcost | B | route-car-vs-train | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/tripcost/amsterdam/to/berlin` |
| tripcost | B | route-car-vs-train | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/tripcost/paris/to/frankfurt` |
| tripcost | B | route-car-vs-train | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/tripcost/paris/to/rouen` |
| tripcost | B | route-car-vs-train | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/tripcost/paris/to/tours` |
| tripcost | B | route-car-vs-train | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/tripcost/paris/to/dijon` |
| tripcost | B | route-car-vs-train | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/tripcost/lyon/to/montpellier` |
| tripcost | C | route-car-vs-train | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/tripcost/milan/to/munich` |
| tripcost | C | route-car-vs-train | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/tripcost/munich/to/zurich` |
| tripcost | C | route-car-vs-train | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/tripcost/lyon/to/marseille` |
| tripcost | C | route-car-vs-train | 60-69 | PUBLISHABLE | AUTO_VERIFIED | 68 | `/tripcost/berlin/to/hamburg` |

## How this sample was picked

Stratified over product and catalog tier (10 A / 8 B / 4 C / 3 rejected). It is not a claim that a human reviewed the set.
