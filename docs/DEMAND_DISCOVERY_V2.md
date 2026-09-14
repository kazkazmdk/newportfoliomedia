# Demand Discovery V2

Generated: 2026-09-14T14:49:02.291Z

`PUBLIC_SITE_LIVE` remains **false**. No SERP/autocomplete/Trends/GSC observations were invented in this pass.

## Totals

| Metric | Count |
| --- | ---: |
| Total candidates | 890 |
| Truth-ready | 217 |
| Truth-not-ready | 673 |
| Candidates eligible for demand check (Wave 1) | 100 |
| Queries created (primary+alts on queue) | 2297 |
| Evidence collected (non-editorial) | 0 |
| Demand checked | 0 |
| Demand unchecked | 890 |
| Strong demand | 0 |
| Medium demand | 0 |
| Weak demand | 0 |
| Unknown demand | 890 |
| PRELAUNCH_INDEXABLE | 0 |
| Remaining SEO_CANDIDATE | 217 |
| NOINDEX_PRODUCT | 210 |
| GRAPH_ONLY | 365 |
| REVIEW_REQUIRED | 98 |
| Insufficient truth | 463 |
| Insufficient demand | 217 |
| Strong demand but weak truth | 0 |
| Strong truth but no observed demand | 217 |

## By evidence source

- EDITORIAL: 890

## By site

| Product | Candidates | Truth Ready | Demand Checked | Strong Demand | PRELAUNCH INDEXABLE | SEO Candidate | Main blocker |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| fixcode | 249 | 65 | 0 | 0 | 0 | 65 | no observed pre-launch demand (GSC not required; evidence not imported) |
| autospec | 123 | 0 | 0 | 0 | 0 | 0 | truth/quality not ready |
| wearthere | 416 | 152 | 0 | 0 | 0 | 152 | no observed pre-launch demand (GSC not required; evidence not imported) |
| chargematch | 64 | 0 | 0 | 0 | 0 | 0 | truth/quality not ready |
| tripcost | 38 | 0 | 0 | 0 | 0 | 0 | heuristic fare + missing demand |

## Demand × truth matrix

| Cell | Action | Count |
| --- | --- | ---: |
| HIGH_TRUTH + HIGH_DEMAND | first launch batch | 0 |
| HIGH_TRUTH + LOW_DEMAND | product/noindex or long-tail backlog | 217 |
| LOW_TRUTH + HIGH_DEMAND | DATA PRIORITY | 0 |
| LOW_TRUTH + LOW_DEMAND | graph-only / deprioritize | 673 |

## Waves

- Wave 1: 100 pages (FixCode SEO_CANDIDATE first). See `ops/WAVE_1.csv`.
- Wave 2: 150 pages needing little enrichment. See `ops/WAVE_2.csv`.
- Wave 3: 463 pages needing new datasets/providers. See `ops/WAVE_3.csv`.

## WearThere consolidation

- Paris NORTHERN_TEMPERATE winter months 1/2/12: CONSOLIDATE_SEASON — NORTHERN_TEMPERATE winter: tmax spread 1.0°C
- Tokyo NORTHERN_TEMPERATE winter months 1/2/12: CONSOLIDATE_SEASON — NORTHERN_TEMPERATE winter: tmax spread 2.0°C
- London NORTHERN_TEMPERATE winter months 1/2/12: CONSOLIDATE_SEASON — NORTHERN_TEMPERATE winter: tmax spread 1.0°C
- Barcelona MEDITERRANEAN winter months 1/2/12: CONSOLIDATE_SEASON — MEDITERRANEAN winter: tmax spread 1.0°C
- Barcelona MEDITERRANEAN summer months 6/7/8: CONSOLIDATE_SEASON — MEDITERRANEAN summer: tmax spread 2.0°C
- Reykjavik NORTHERN_TEMPERATE winter months 1/2/12: CONSOLIDATE_SEASON — NORTHERN_TEMPERATE winter: tmax spread 0.0°C
- Reykjavik NORTHERN_TEMPERATE summer months 6/7/8: CONSOLIDATE_SEASON — NORTHERN_TEMPERATE summer: tmax spread 2.0°C
- Lisbon NORTHERN_TEMPERATE winter months 1/2/12: CONSOLIDATE_SEASON — NORTHERN_TEMPERATE winter: tmax spread 1.0°C
- Lisbon NORTHERN_TEMPERATE summer months 6/7/8: CONSOLIDATE_SEASON — NORTHERN_TEMPERATE summer: tmax spread 2.0°C
- Rome MEDITERRANEAN winter months 1/2/12: CONSOLIDATE_SEASON — MEDITERRANEAN winter: tmax spread 1.0°C
- Amsterdam NORTHERN_TEMPERATE winter months 1/2/12: CONSOLIDATE_SEASON — NORTHERN_TEMPERATE winter: tmax spread 1.0°C
- Amsterdam NORTHERN_TEMPERATE summer months 6/7/8: CONSOLIDATE_SEASON — NORTHERN_TEMPERATE summer: tmax spread 2.0°C
- Berlin NORTHERN_TEMPERATE winter months 1/2/12: CONSOLIDATE_SEASON — NORTHERN_TEMPERATE winter: tmax spread 2.0°C
- Berlin NORTHERN_TEMPERATE summer months 6/7/8: CONSOLIDATE_SEASON — NORTHERN_TEMPERATE summer: tmax spread 2.0°C
- Madrid MEDITERRANEAN winter months 1/2/12: CONSOLIDATE_SEASON — MEDITERRANEAN winter: tmax spread 2.0°C
- Singapore EQUATORIAL year-round-humid months 1/2/3/4/5/6/7/8/9/10/11/12: CITY_GUIDE_ONLY — Equatorial climate — do not force temperate winter/spring/summer/autumn
- Sydney SOUTHERN_TEMPERATE summer months 1/2/12: CONSOLIDATE_SEASON — SOUTHERN_TEMPERATE summer: tmax spread 1.0°C
- Sydney SOUTHERN_TEMPERATE winter months 6/7/8: CONSOLIDATE_SEASON — SOUTHERN_TEMPERATE winter: tmax spread 1.0°C
- Los Angeles NORTHERN_TEMPERATE winter months 1/2/12: CONSOLIDATE_SEASON — NORTHERN_TEMPERATE winter: tmax spread 0.0°C
- Chicago NORTHERN_TEMPERATE summer months 6/7/8: CONSOLIDATE_SEASON — NORTHERN_TEMPERATE summer: tmax spread 2.0°C
- Dublin NORTHERN_TEMPERATE winter months 1/2/12: CONSOLIDATE_SEASON — NORTHERN_TEMPERATE winter: tmax spread 0.0°C
- Dublin NORTHERN_TEMPERATE summer months 6/7/8: CONSOLIDATE_SEASON — NORTHERN_TEMPERATE summer: tmax spread 2.0°C
- Copenhagen NORTHERN_TEMPERATE winter months 1/2/12: CONSOLIDATE_SEASON — NORTHERN_TEMPERATE winter: tmax spread 1.0°C
- Copenhagen NORTHERN_TEMPERATE summer months 6/7/8: CONSOLIDATE_SEASON — NORTHERN_TEMPERATE summer: tmax spread 2.0°C
- Vienna NORTHERN_TEMPERATE winter months 1/2/12: CONSOLIDATE_SEASON — NORTHERN_TEMPERATE winter: tmax spread 2.0°C
- Marrakech MEDITERRANEAN winter months 1/2/12: CONSOLIDATE_SEASON — MEDITERRANEAN winter: tmax spread 2.0°C
- Istanbul MEDITERRANEAN winter months 1/2/12: CONSOLIDATE_SEASON — MEDITERRANEAN winter: tmax spread 2.0°C
- Istanbul MEDITERRANEAN summer months 6/7/8: CONSOLIDATE_SEASON — MEDITERRANEAN summer: tmax spread 2.0°C
- Hong Kong NORTHERN_TEMPERATE winter months 1/2/12: CONSOLIDATE_SEASON — NORTHERN_TEMPERATE winter: tmax spread 1.0°C
- Hong Kong NORTHERN_TEMPERATE summer months 6/7/8: CONSOLIDATE_SEASON — NORTHERN_TEMPERATE summer: tmax spread 1.0°C
- Vancouver NORTHERN_TEMPERATE winter months 1/2/12: CONSOLIDATE_SEASON — NORTHERN_TEMPERATE winter: tmax spread 1.0°C
- Vancouver NORTHERN_TEMPERATE summer months 6/7/8: CONSOLIDATE_SEASON — NORTHERN_TEMPERATE summer: tmax spread 2.0°C
- Edinburgh NORTHERN_TEMPERATE winter months 1/2/12: CONSOLIDATE_SEASON — NORTHERN_TEMPERATE winter: tmax spread 0.0°C
- Edinburgh NORTHERN_TEMPERATE summer months 6/7/8: CONSOLIDATE_SEASON — NORTHERN_TEMPERATE summer: tmax spread 1.0°C
- Florence MEDITERRANEAN winter months 1/2/12: CONSOLIDATE_SEASON — MEDITERRANEAN winter: tmax spread 2.0°C
- Cape Town SOUTHERN_TEMPERATE summer months 1/2/12: CONSOLIDATE_SEASON — SOUTHERN_TEMPERATE summer: tmax spread 2.0°C
- Cape Town SOUTHERN_TEMPERATE winter months 6/7/8: CONSOLIDATE_SEASON — SOUTHERN_TEMPERATE winter: tmax spread 0.0°C

## Cold start

PRELAUNCH_BATCH size: **0**.

Zero is not a failure. No compliant SERP/autocomplete/keyword observations were imported. The gate can promote a page to INDEXABLE/PRELAUNCH as soon as a real Path A/B/C is imported — GSC is not required.

## Opportunity score

Informational only. A Truth Gate fail still means INDEXABLE = false.

| Page | Demand | Truth | Utility | SERP opp. | Total | Indexable? |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| fix:samsung:washer:4c | 0 | 25 | 15 | 0 | 42 | false |
| fix:samsung:washer:4e | 0 | 25 | 15 | 0 | 42 | false |
| fix:samsung:washer:5c | 0 | 25 | 15 | 0 | 42 | false |
| fix:samsung:washer:5e | 0 | 25 | 15 | 0 | 42 | false |
| fix:samsung:washer:ue | 0 | 25 | 15 | 0 | 42 | false |
| fix:samsung:washer:dc | 0 | 25 | 15 | 0 | 42 | false |
| fix:samsung:washer:oe | 0 | 25 | 15 | 0 | 42 | false |
| fix:samsung:washer:le | 0 | 25 | 15 | 0 | 42 | false |
| fix:samsung:washer:te | 0 | 25 | 15 | 0 | 42 | false |
| fix:samsung:washer:3c | 0 | 25 | 15 | 0 | 42 | false |
| fix:lg:washer:ie | 0 | 25 | 15 | 0 | 42 | false |
| fix:lg:washer:oe | 0 | 25 | 15 | 0 | 42 | false |
| fix:lg:washer:ue | 0 | 25 | 15 | 0 | 42 | false |
| fix:lg:washer:de | 0 | 25 | 15 | 0 | 42 | false |
| fix:bosch:dishwasher:e15 | 0 | 25 | 15 | 0 | 42 | false |

