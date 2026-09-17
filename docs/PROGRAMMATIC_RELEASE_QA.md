# Programmatic release QA sample

This is a **manual QA sample**, not the SEO rollout cap.

After the sample is reviewed, every other URL that passes the same gates stays in the release candidate set.

Sample size: 100 URLs (~20 per product, stratified by tier / template / quality band / publish state).

## Checklist per URL

- page useful as a decision surface (not a generic article)
- result unique vs siblings
- visual quality / mobile
- evidence and assumptions visible
- internal links present
- structured data / main entity present
- canonical stable and self
- no 404 / 500
- no canonical toward a noindex page

## Sample

| Product | Tier | Template | Quality | State | Score | URL |
| ------- | ---- | -------- | ------- | ----- | ----: | --- |
| fixcode | A | error-code | 80-89 | PUBLISHABLE | 81 | `/fixcode/bosch/dishwasher/e15-error` |
| fixcode | A | error-code | 70-79 | PUBLISHABLE | 79 | `/fixcode/samsung/washer/4e-error` |
| fixcode | B | error-code | 70-79 | PUBLISHABLE | 78 | `/fixcode/samsung/washer/1e-error` |
| fixcode | B | error-code | 60-69 | PUBLISHABLE | 68 | `/fixcode/samsung/washer/dc-error` |
| fixcode | C | error-code | 60-69 | PUBLISHABLE | 68 | `/fixcode/miele/washer/f70-error` |
| fixcode | — | error-code | 60-69 | LIMITED | 68 | `/fixcode/samsung/fridge/5e-error` |
| fixcode | — | appliance-hub | <60 | NOINDEX | 57 | `/fixcode/samsung/washer` |
| fixcode | — | brand-hub | <60 | NOINDEX | 54 | `/fixcode/samsung` |
| fixcode | — | symptom | <60 | LIMITED | 49 | `/fixcode/samsung/washer/not-draining` |
| fixcode | A | error-code | 80-89 | PUBLISHABLE | 80 | `/fixcode/samsung/washer/4c-error` |
| fixcode | A | error-code | 70-79 | PUBLISHABLE | 79 | `/fixcode/samsung/washer/5e-error` |
| fixcode | B | error-code | 70-79 | PUBLISHABLE | 78 | `/fixcode/samsung/washer/dc1-error` |
| fixcode | B | error-code | 60-69 | PUBLISHABLE | 68 | `/fixcode/samsung/washer/oe-error` |
| fixcode | C | error-code | 60-69 | PUBLISHABLE | 68 | `/fixcode/bosch/dishwasher/e01-error` |
| fixcode | — | error-code | 60-69 | LIMITED | 68 | `/fixcode/samsung/washer/3c1-error` |
| fixcode | — | appliance-hub | <60 | NOINDEX | 57 | `/fixcode/samsung/fridge` |
| fixcode | — | brand-hub | <60 | NOINDEX | 54 | `/fixcode/lg` |
| fixcode | — | symptom | <60 | LIMITED | 49 | `/fixcode/samsung/washer/wont-spin` |
| fixcode | A | error-code | 80-89 | PUBLISHABLE | 80 | `/fixcode/samsung/washer/5c-error` |
| fixcode | A | error-code | 70-79 | PUBLISHABLE | 79 | `/fixcode/lg/washer/de-error` |
| autospec | — | oil-type | 60-69 | LIMITED | 68 | `/autospec/bmw/3-series/g20/320d-b47/oil` |
| autospec | — | maintenance-schedule | 60-69 | LIMITED | 67 | `/autospec/bmw/3-series/g20/320d-b47/maintenance` |
| autospec | — | tyre-pressure | 60-69 | LIMITED | 63 | `/autospec/bmw/3-series/g20/320d-b47/tyres` |
| autospec | — | vehicle-hub | <60 | NOINDEX | 54 | `/autospec/bmw/3-series/g20/320d-b47` |
| autospec | — | battery | <60 | NOINDEX | 50 | `/autospec/bmw/3-series/g20/320d-b47/battery` |
| autospec | — | common-problems | <60 | NOINDEX | 50 | `/autospec/bmw/3-series/g20/320d-b47/problems` |
| autospec | — | oil-type | 60-69 | LIMITED | 68 | `/autospec/toyota/corolla/e210/1-8-hybrid/oil` |
| autospec | — | maintenance-schedule | 60-69 | LIMITED | 67 | `/autospec/toyota/corolla/e210/1-8-hybrid/maintenance` |
| autospec | — | tyre-pressure | 60-69 | LIMITED | 63 | `/autospec/toyota/corolla/e210/1-8-hybrid/tyres` |
| autospec | — | vehicle-hub | <60 | NOINDEX | 54 | `/autospec/toyota/corolla/e210/1-8-hybrid` |
| autospec | — | battery | <60 | NOINDEX | 50 | `/autospec/toyota/corolla/e210/1-8-hybrid/battery` |
| autospec | — | common-problems | <60 | NOINDEX | 50 | `/autospec/toyota/corolla/e210/1-8-hybrid/problems` |
| autospec | — | oil-type | 60-69 | LIMITED | 68 | `/autospec/volkswagen/golf/mk8/2-0-tdi/oil` |
| autospec | — | maintenance-schedule | 60-69 | LIMITED | 67 | `/autospec/honda/civic/11/1-5-vtec/maintenance` |
| autospec | — | tyre-pressure | 60-69 | LIMITED | 63 | `/autospec/honda/civic/11/1-5-vtec/tyres` |
| autospec | — | vehicle-hub | <60 | NOINDEX | 54 | `/autospec/honda/civic/11/1-5-vtec` |
| autospec | — | battery | <60 | NOINDEX | 50 | `/autospec/honda/civic/11/1-5-vtec/battery` |
| autospec | — | common-problems | <60 | NOINDEX | 50 | `/autospec/honda/civic/11/1-5-vtec/problems` |
| autospec | — | oil-type | 60-69 | LIMITED | 68 | `/autospec/honda/civic/11/1-5-vtec/oil` |
| autospec | — | maintenance-schedule | 60-69 | LIMITED | 67 | `/autospec/mercedes/c-class/w206/c220d/maintenance` |
| wearthere | A | wear-month | 60-69 | PUBLISHABLE | 68 | `/wearthere/paris/winter/what-to-wear` |
| wearthere | B | wear-month | 60-69 | PUBLISHABLE | 68 | `/wearthere/barcelona/may/what-to-wear` |
| wearthere | C | wear-month | 60-69 | PUBLISHABLE | 68 | `/wearthere/reykjavik/april/what-to-wear` |
| wearthere | — | wear-month | 60-69 | NOINDEX | 68 | `/wearthere/paris/june/what-to-wear` |
| wearthere | — | wear-month | 60-69 | LIMITED | 68 | `/wearthere/new-york/december/what-to-wear` |
| wearthere | — | destination-hub | <60 | NOINDEX | 55 | `/wearthere/paris` |
| wearthere | A | wear-month | 60-69 | PUBLISHABLE | 68 | `/wearthere/paris/march/what-to-wear` |
| wearthere | B | wear-month | 60-69 | PUBLISHABLE | 68 | `/wearthere/barcelona/summer/what-to-wear` |
| wearthere | C | wear-month | 60-69 | PUBLISHABLE | 68 | `/wearthere/reykjavik/may/what-to-wear` |
| wearthere | — | wear-month | 60-69 | NOINDEX | 68 | `/wearthere/paris/july/what-to-wear` |
| wearthere | — | wear-month | 60-69 | LIMITED | 68 | `/wearthere/chicago/march/what-to-wear` |
| wearthere | — | destination-hub | <60 | NOINDEX | 55 | `/wearthere/tokyo` |
| wearthere | A | wear-month | 60-69 | PUBLISHABLE | 68 | `/wearthere/paris/april/what-to-wear` |
| wearthere | B | wear-month | 60-69 | PUBLISHABLE | 68 | `/wearthere/barcelona/september/what-to-wear` |
| wearthere | C | wear-month | 60-69 | PUBLISHABLE | 68 | `/wearthere/reykjavik/summer/what-to-wear` |
| wearthere | — | wear-month | 60-69 | NOINDEX | 68 | `/wearthere/paris/august/what-to-wear` |
| wearthere | — | wear-month | 60-69 | LIMITED | 68 | `/wearthere/prague/march/what-to-wear` |
| wearthere | — | destination-hub | <60 | NOINDEX | 55 | `/wearthere/new-york` |
| wearthere | A | wear-month | 60-69 | PUBLISHABLE | 68 | `/wearthere/paris/may/what-to-wear` |
| wearthere | B | wear-month | 60-69 | PUBLISHABLE | 68 | `/wearthere/barcelona/october/what-to-wear` |
| chargematch | A | can-charger-charge | 60-69 | PUBLISHABLE | 68 | `/chargematch/iphone-16/with/apple-20w` |
| chargematch | B | can-charger-charge | 60-69 | PUBLISHABLE | 68 | `/chargematch/iphone-16/with/anker-65w` |
| chargematch | C | can-charger-charge | 60-69 | PUBLISHABLE | 68 | `/chargematch/iphone-15/with/gan-100w-3c1a` |
| chargematch | — | can-charger-charge | 60-69 | NOINDEX | 68 | `/chargematch/iphone-16/with/apple-35w-dual` |
| chargematch | — | can-charger-charge | 60-69 | LIMITED | 68 | `/chargematch/macbook-air-13-m3/with/apple-70w` |
| chargematch | — | device-hub | 60-69 | NOINDEX | 61 | `/chargematch/iphone-16` |
| chargematch | — | device-hub | <60 | NOINDEX | 53 | `/chargematch/macbook-air-13-m3` |
| chargematch | — | device-wattage | <60 | NOINDEX | 53 | `/chargematch/airpods-pro-usbc` |
| chargematch | — | can-charger-charge | <60 | NOINDEX | 52 | `/chargematch/apple-watch/with/apple-20w` |
| chargematch | A | can-charger-charge | 60-69 | PUBLISHABLE | 68 | `/chargematch/iphone-15/with/apple-20w` |
| chargematch | B | can-charger-charge | 60-69 | PUBLISHABLE | 68 | `/chargematch/iphone-15/with/anker-65w` |
| chargematch | — | can-charger-charge | 60-69 | NOINDEX | 68 | `/chargematch/macbook-air-13-m3/with/anker-100w-2c` |
| chargematch | — | can-charger-charge | 60-69 | LIMITED | 68 | `/chargematch/macbook-air-13-m3/with/anker-65w` |
| chargematch | — | device-hub | 60-69 | NOINDEX | 61 | `/chargematch/iphone-15` |
| chargematch | — | device-hub | <60 | NOINDEX | 53 | `/chargematch/macbook-pro-14-m3` |
| chargematch | — | device-wattage | <60 | NOINDEX | 53 | `/chargematch/apple-watch` |
| chargematch | — | can-charger-charge | <60 | NOINDEX | 52 | `/chargematch/apple-watch/with/apple-35w-dual` |
| chargematch | B | can-charger-charge | 60-69 | PUBLISHABLE | 68 | `/chargematch/iphone-16/with/gan-100w-3c1a` |
| chargematch | — | can-charger-charge | 60-69 | NOINDEX | 68 | `/chargematch/iphone-16-pro/with/anker-100w-2c` |
| chargematch | — | can-charger-charge | 60-69 | LIMITED | 68 | `/chargematch/macbook-pro-14-m3/with/anker-65w` |
| tripcost | — | route-car-vs-train | 60-69 | LIMITED | 68 | `/tripcost/paris/to/lyon` |
| tripcost | — | route-driving | 60-69 | LIMITED | 68 | `/tripcost/paris/to/lyon/driving-cost` |
| tripcost | — | route-car-vs-train | 60-69 | LIMITED | 68 | `/tripcost/paris/to/barcelona` |
| tripcost | — | route-driving | 60-69 | LIMITED | 68 | `/tripcost/paris/to/barcelona/driving-cost` |
| tripcost | — | route-car-vs-train | 60-69 | LIMITED | 68 | `/tripcost/london/to/paris` |
| tripcost | — | route-driving | 60-69 | LIMITED | 68 | `/tripcost/london/to/paris/driving-cost` |
| tripcost | — | route-car-vs-train | 60-69 | LIMITED | 68 | `/tripcost/berlin/to/munich` |
| tripcost | — | route-driving | 60-69 | LIMITED | 68 | `/tripcost/berlin/to/munich/driving-cost` |
| tripcost | — | route-car-vs-train | 60-69 | LIMITED | 68 | `/tripcost/paris/to/amsterdam` |
| tripcost | — | route-driving | 60-69 | LIMITED | 68 | `/tripcost/paris/to/amsterdam/driving-cost` |
| tripcost | — | route-car-vs-train | 60-69 | LIMITED | 68 | `/tripcost/paris/to/brussels` |
| tripcost | — | route-driving | 60-69 | LIMITED | 68 | `/tripcost/paris/to/brussels/driving-cost` |
| tripcost | — | route-car-vs-train | 60-69 | LIMITED | 68 | `/tripcost/milan/to/munich` |
| tripcost | — | route-driving | 60-69 | LIMITED | 68 | `/tripcost/milan/to/munich/driving-cost` |
| tripcost | — | route-car-vs-train | 60-69 | LIMITED | 68 | `/tripcost/paris/to/rome` |
| tripcost | — | route-driving | 60-69 | LIMITED | 68 | `/tripcost/paris/to/rome/driving-cost` |
| tripcost | — | route-car-vs-train | 60-69 | LIMITED | 68 | `/tripcost/amsterdam/to/berlin` |
| tripcost | — | route-driving | 60-69 | LIMITED | 68 | `/tripcost/amsterdam/to/berlin/driving-cost` |
| tripcost | — | route-car-vs-train | 60-69 | LIMITED | 68 | `/tripcost/madrid/to/barcelona` |
| tripcost | — | route-driving | 60-69 | LIMITED | 68 | `/tripcost/madrid/to/barcelona/driving-cost` |

## How this sample was picked

Stratified over product, catalog tier (A/B/C), page family, quality band, and publish state. It is not the top-100 by score and it is not a 50-page launch ceiling.
