# Publishable surface

The count is an **output of the data graph**. It is not a quota.

- A high soft score cannot bypass a hard gate.
- `PUBLISHABLE` here means: unique decision, hard gates passed, ready as a release candidate.
- `INDEXABLE` still requires a real demand path (autocomplete + SERP intent, or equivalent). Editorial demand never indexes.
- `PUBLIC_SITE_LIVE=false` keeps the kill switch: global noindex, empty `/sitemap.xml`.
- Segmented sitemaps exist at `/sitemaps/{product}-{a|b|c}.xml` and stay empty until a page is both live-indexable and PUBLISHABLE.
- lastmod is the latest entity / relation / source / decision update. Never `new Date()` per build.
- data_version: `2026.09.17-depth-500`
- graph_version: `graph-v4-depth-500`

| Product | Generated | Publishable | Tier A | Tier B | Tier C | Noindex | Blocked | Limited | Real source coverage |
| ------- | --------: | ----------: | -----: | -----: | -----: | ------: | ------: | ------: | -------------------: |
| fixcode | 652 | 607 | 134 | 231 | 242 | 11 | 0 | 34 | 1 |
| autospec | 605 | 605 | 134 | 230 | 241 | 0 | 0 | 0 | 1 |
| wearthere | 1462 | 1027 | 226 | 391 | 410 | 435 | 0 | 0 | 1 |
| chargematch | 614 | 571 | 126 | 217 | 228 | 43 | 0 | 0 | 1 |
| tripcost | 1526 | 1526 | 336 | 580 | 610 | 0 | 0 | 0 | 1 |
| **total** | **4859** | **4336** | **956** | **1649** | **1731** | **489** | **0** | **34** | |

## Quality bands (all generated URLs)

- `<60`: 258
- `60-69`: 4579
- `70-79`: 17
- `80-89`: 5
- `90+`: 0

## Per product

### fixcode

- total entities: 5330
- total relations: 15769
- sources: 39
- real source coverage: 1
- candidate URLs (SEO_CANDIDATE + INDEXABLE): 607
- publishable URLs (quality-layer): 607
- Tier A: 134
- Tier B: 231
- Tier C: 242
- noindex: 11
- blocked: 0
- limited: 34
- duplicate clusters removed: 0
- quality bands: <60=256, 60-69=374, 70-79=17, 80-89=5, 90+=0

### autospec

- total entities: 2021
- total relations: 2489
- sources: 1
- real source coverage: 1
- candidate URLs (SEO_CANDIDATE + INDEXABLE): 605
- publishable URLs (quality-layer): 605
- Tier A: 134
- Tier B: 230
- Tier C: 241
- noindex: 0
- blocked: 0
- limited: 0
- duplicate clusters removed: 0
- quality bands: <60=0, 60-69=605, 70-79=0, 80-89=0, 90+=0

### wearthere

- total entities: 5491
- total relations: 14688
- sources: 3
- real source coverage: 1
- candidate URLs (SEO_CANDIDATE + INDEXABLE): 1191
- publishable URLs (quality-layer): 1027
- Tier A: 226
- Tier B: 391
- Tier C: 410
- noindex: 435
- blocked: 0
- limited: 0
- duplicate clusters removed: 123
- quality bands: <60=0, 60-69=1462, 70-79=0, 80-89=0, 90+=0

### chargematch

- total entities: 402
- total relations: 2529
- sources: 3
- real source coverage: 1
- candidate URLs (SEO_CANDIDATE + INDEXABLE): 587
- publishable URLs (quality-layer): 571
- Tier A: 126
- Tier B: 217
- Tier C: 228
- noindex: 43
- blocked: 0
- limited: 0
- duplicate clusters removed: 14
- quality bands: <60=2, 60-69=612, 70-79=0, 80-89=0, 90+=0

### tripcost

- total entities: 41101
- total relations: 53368
- sources: 2
- real source coverage: 1
- candidate URLs (SEO_CANDIDATE + INDEXABLE): 1526
- publishable URLs (quality-layer): 1526
- Tier A: 336
- Tier B: 580
- Tier C: 610
- noindex: 0
- blocked: 0
- limited: 0
- duplicate clusters removed: 0
- quality bands: <60=0, 60-69=1526, 70-79=0, 80-89=0, 90+=0


## Targets vs graph output

Indicative first-release ranges (not obligations): FixCode 800–1500+, AutoSpec 800–1500+, ChargeMatch 500–1000+, WearThere 500–1000+, TripCost 500–1000+.

If the graph produces fewer honest pages, we keep fewer. If it produces more that pass gates, we do not cut them.

## Monitoring cohorts

- tripcost / Tier C / corridor / 60-69 / corridor — 610 publishable / 610 generated
- tripcost / Tier B / corridor / 60-69 / corridor — 580 publishable / 580 generated
- wearthere / Tier C / wear-period / 60-69 / destination — 410 publishable / 410 generated
- wearthere / Tier B / wear-period / 60-69 / destination — 391 publishable / 391 generated
- tripcost / Tier A / corridor / 60-69 / corridor — 336 publishable / 336 generated
- fixcode / Tier C / symptom / <60 / symptom — 242 publishable / 242 generated
- chargematch / Tier C / compatibility / 60-69 / device_charger_pair — 228 publishable / 228 generated
- fixcode / Tier B / error-code / 60-69 / error_code — 227 publishable / 227 generated
- chargematch / Tier B / compatibility / 60-69 / device_charger_pair — 217 publishable / 217 generated
- wearthere / Tier A / wear-period / 60-69 / destination — 152 publishable / 152 generated
- autospec / Tier A / hub / 60-69 / vehicle_identity — 105 publishable / 105 generated
- autospec / Tier C / battery / 60-69 / vehicle_identity — 105 publishable / 105 generated
- autospec / Tier B / service / 60-69 / vehicle_identity — 105 publishable / 105 generated
- autospec / Tier C / known-issues / 60-69 / vehicle_identity — 95 publishable / 95 generated
- wearthere / Tier A / hub / 60-69 / destination — 74 publishable / 74 generated
- fixcode / Tier A / error-code / 60-69 / error_code — 67 publishable / 67 generated
- autospec / Tier B / tyres / 60-69 / vehicle_identity — 64 publishable / 64 generated
- autospec / Tier B / oil / 60-69 / vehicle_identity — 61 publishable / 61 generated
- chargematch / Tier A / compatibility / 60-69 / device_charger_pair — 54 publishable / 54 generated
- fixcode / Tier A / hub / 60-69 / error_code — 45 publishable / 45 generated
- autospec / Tier C / tyres / 60-69 / vehicle_identity — 41 publishable / 41 generated
- chargematch / Tier A / hub / 60-69 / device — 37 publishable / 37 generated
- chargematch / Tier A / device / 60-69 / device — 35 publishable / 35 generated
- autospec / Tier A / oil / 60-69 / vehicle_identity — 29 publishable / 29 generated
- fixcode / Tier A / error-code / 70-79 / error_code — 17 publishable / 17 generated
- fixcode / Tier A / error-code / 80-89 / error_code — 5 publishable / 5 generated
- fixcode / Tier B / symptom / <60 / symptom — 4 publishable / 4 generated
- wearthere / Tier none / wear-period / 60-69 / destination — 0 publishable / 435 generated
- chargematch / Tier none / compatibility / 60-69 / device_charger_pair — 0 publishable / 41 generated
- fixcode / Tier none / error-code / 60-69 / error_code — 0 publishable / 35 generated
- fixcode / Tier none / error-code / <60 / error_code — 0 publishable / 10 generated
- chargematch / Tier none / compatibility / <60 / device_charger_pair — 0 publishable / 2 generated

## GSC import readiness

Join later on `url` with clicks, impressions, CTR, position, indexing status.
See `joinGscToReleaseManifest` in `@penta/demand`. No live GSC access is required for this pass.
