# Publishable surface

The count is an **output of the data graph**. It is not a quota.

- A high soft score cannot bypass a hard gate.
- `PUBLISHABLE` here means: unique decision, hard gates passed, ready as a release candidate.
- `INDEXABLE` still requires a real demand path (autocomplete + SERP intent, or equivalent). Editorial demand never indexes.
- `PUBLIC_SITE_LIVE=false` keeps the kill switch: global noindex, empty `/sitemap.xml`.
- Segmented sitemaps exist at `/sitemaps/{product}-{a|b|c}.xml` and stay empty until a page is both live-indexable and PUBLISHABLE.
- lastmod is the latest entity / relation / source / decision update. Never `new Date()` per build.

| Product | Generated | Publishable | Tier A | Tier B | Tier C | Noindex | Blocked | Limited |
| ------- | --------: | ----------: | -----: | -----: | -----: | ------: | ------: | ------: |
| fixcode | 249 | 79 | 18 | 31 | 30 | 20 | 0 | 150 |
| autospec | 123 | 0 | 0 | 0 | 0 | 63 | 0 | 60 |
| wearthere | 332 | 156 | 35 | 60 | 61 | 173 | 0 | 3 |
| chargematch | 242 | 6 | 2 | 3 | 1 | 84 | 0 | 152 |
| tripcost | 38 | 0 | 0 | 0 | 0 | 0 | 0 | 38 |
| **total** | **984** | **241** | **55** | **94** | **92** | **340** | **0** | **403** |

## Quality bands (all generated URLs)

- `<60`: 243
- `60-69`: 716
- `70-79`: 18
- `80-89`: 7
- `90+`: 0

## Per product

### fixcode

- total entities: 1961
- total relations: 5894
- candidate URLs (SEO_CANDIDATE + INDEXABLE): 79
- publishable URLs (quality-layer): 79
- Tier A: 18
- Tier B: 31
- Tier C: 30
- noindex: 20
- blocked: 0
- limited: 150
- duplicate clusters removed: 0
- quality bands: <60=118, 60-69=106, 70-79=18, 80-89=7, 90+=0

### autospec

- total entities: 435
- total relations: 506
- candidate URLs (SEO_CANDIDATE + INDEXABLE): 0
- publishable URLs (quality-layer): 0
- Tier A: 0
- Tier B: 0
- Tier C: 0
- noindex: 63
- blocked: 0
- limited: 60
- duplicate clusters removed: 0
- quality bands: <60=63, 60-69=60, 70-79=0, 80-89=0, 90+=0

### wearthere

- total entities: 2383
- total relations: 6425
- candidate URLs (SEO_CANDIDATE + INDEXABLE): 170
- publishable URLs (quality-layer): 156
- Tier A: 35
- Tier B: 60
- Tier C: 61
- noindex: 173
- blocked: 0
- limited: 3
- duplicate clusters removed: 12
- quality bands: <60=32, 60-69=300, 70-79=0, 80-89=0, 90+=0

### chargematch

- total entities: 175
- total relations: 533
- candidate URLs (SEO_CANDIDATE + INDEXABLE): 16
- publishable URLs (quality-layer): 6
- Tier A: 2
- Tier B: 3
- Tier C: 1
- noindex: 84
- blocked: 0
- limited: 152
- duplicate clusters removed: 4
- quality bands: <60=30, 60-69=212, 70-79=0, 80-89=0, 90+=0

### tripcost

- total entities: 558
- total relations: 689
- candidate URLs (SEO_CANDIDATE + INDEXABLE): 0
- publishable URLs (quality-layer): 0
- Tier A: 0
- Tier B: 0
- Tier C: 0
- noindex: 0
- blocked: 0
- limited: 38
- duplicate clusters removed: 0
- quality bands: <60=0, 60-69=38, 70-79=0, 80-89=0, 90+=0


## Targets vs graph output

Indicative first-release ranges (not obligations): FixCode 800–1500+, AutoSpec 800–1500+, ChargeMatch 500–1000+, WearThere 500–1000+, TripCost 500–1000+.

If the graph produces fewer honest pages, we keep fewer. If it produces more that pass gates, we do not cut them.

## Monitoring cohorts

- wearthere / Tier C / wear-period / 60-69 / destination — 61 publishable / 61 generated
- wearthere / Tier B / wear-period / 60-69 / destination — 60 publishable / 60 generated
- wearthere / Tier A / wear-period / 60-69 / destination — 35 publishable / 35 generated
- fixcode / Tier C / error-code / 60-69 / error_code — 30 publishable / 30 generated
- fixcode / Tier B / error-code / 60-69 / error_code — 24 publishable / 24 generated
- fixcode / Tier A / error-code / 70-79 / error_code — 11 publishable / 11 generated
- fixcode / Tier A / error-code / 80-89 / error_code — 7 publishable / 7 generated
- fixcode / Tier B / error-code / 70-79 / error_code — 7 publishable / 7 generated
- chargematch / Tier B / compatibility / 60-69 / device_charger_pair — 3 publishable / 3 generated
- chargematch / Tier A / compatibility / 60-69 / device_charger_pair — 2 publishable / 2 generated
- chargematch / Tier C / compatibility / 60-69 / device_charger_pair — 1 publishable / 1 generated
- chargematch / Tier none / compatibility / 60-69 / device_charger_pair — 0 publishable / 204 generated
- wearthere / Tier none / wear-period / 60-69 / destination — 0 publishable / 144 generated
- fixcode / Tier none / symptom / <60 / symptom — 0 publishable / 98 generated
- fixcode / Tier none / error-code / 60-69 / error_code — 0 publishable / 52 generated
- tripcost / Tier none / corridor / 60-69 / corridor — 0 publishable / 38 generated
- wearthere / Tier none / hub / <60 / destination — 0 publishable / 32 generated
- autospec / Tier none / hub / <60 / vehicle_identity — 0 publishable / 21 generated
- autospec / Tier none / tyres / 60-69 / vehicle_identity — 0 publishable / 21 generated
- autospec / Tier none / battery / <60 / vehicle_identity — 0 publishable / 21 generated
- autospec / Tier none / service / 60-69 / vehicle_identity — 0 publishable / 21 generated
- autospec / Tier none / known-issues / <60 / vehicle_identity — 0 publishable / 21 generated
- fixcode / Tier none / hub / <60 / error_code — 0 publishable / 20 generated
- autospec / Tier none / oil / 60-69 / vehicle_identity — 0 publishable / 18 generated
- chargematch / Tier none / hub / <60 / device — 0 publishable / 14 generated
- chargematch / Tier none / compatibility / <60 / device_charger_pair — 0 publishable / 10 generated
- chargematch / Tier none / device / <60 / device — 0 publishable / 6 generated
- chargematch / Tier none / hub / 60-69 / device — 0 publishable / 2 generated

## GSC import readiness

Join later on `url` with clicks, impressions, CTR, position, indexing status.
See `joinGscToReleaseManifest` in `@penta/demand`. No live GSC access is required for this pass.
