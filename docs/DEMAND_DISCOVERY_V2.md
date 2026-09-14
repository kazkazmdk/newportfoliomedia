# Demand Discovery V2

Generated: 2026-09-14T13:31:36.569Z

`PUBLIC_SITE_LIVE` remains **false**. No SERP/autocomplete/Trends/GSC observations were invented in this pass.

## Totals

| Metric | Count |
| --- | ---: |
| Total candidates | 890 |
| Truth-ready | 50 |
| Truth-not-ready | 840 |
| Candidates eligible for demand check (Wave 1) | 50 |
| Queries created (primary+alts on queue) | 2297 |
| Evidence collected (non-editorial) | 0 |
| Demand checked | 0 |
| Demand unchecked | 890 |
| Strong demand | 0 |
| Medium demand | 0 |
| Weak demand | 0 |
| Unknown demand | 890 |
| PRELAUNCH_INDEXABLE | 0 |
| Remaining SEO_CANDIDATE | 50 |
| NOINDEX_PRODUCT | 299 |
| GRAPH_ONLY | 385 |
| REVIEW_REQUIRED | 156 |
| Insufficient truth | 541 |
| Insufficient demand | 50 |
| Strong demand but weak truth | 0 |
| Strong truth but no observed demand | 50 |

## By evidence source

- EDITORIAL: 890

## By site

| Product | Candidates | Truth Ready | Demand Checked | Strong Demand | PRELAUNCH INDEXABLE | SEO Candidate | Main blocker |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| fixcode | 249 | 50 | 0 | 0 | 0 | 50 | no observed pre-launch demand (GSC not required; evidence not imported) |
| autospec | 123 | 0 | 0 | 0 | 0 | 0 | truth/quality not ready |
| wearthere | 416 | 0 | 0 | 0 | 0 | 0 | truth/quality not ready |
| chargematch | 64 | 0 | 0 | 0 | 0 | 0 | truth/quality not ready |
| tripcost | 38 | 0 | 0 | 0 | 0 | 0 | heuristic fare + missing demand |

## Demand × truth matrix

| Cell | Action | Count |
| --- | --- | ---: |
| HIGH_TRUTH + HIGH_DEMAND | first launch batch | 0 |
| HIGH_TRUTH + LOW_DEMAND | product/noindex or long-tail backlog | 50 |
| LOW_TRUTH + HIGH_DEMAND | DATA PRIORITY | 0 |
| LOW_TRUTH + LOW_DEMAND | graph-only / deprioritize | 840 |

## Waves

- Wave 1: 50 pages (FixCode SEO_CANDIDATE first). See `ops/WAVE_1.csv`.
- Wave 2: 150 pages needing little enrichment. See `ops/WAVE_2.csv`.
- Wave 3: 541 pages needing new datasets/providers. See `ops/WAVE_3.csv`.

## WearThere consolidation

- Paris winter months 1/2/12: tmax spread 1.0°C — prefer "winter in Paris" over thin month pages
- Tokyo winter months 1/2/12: tmax spread 2.0°C — prefer "winter in Tokyo" over thin month pages
- London winter months 1/2/12: tmax spread 1.0°C — prefer "winter in London" over thin month pages
- Barcelona winter months 1/2/12: tmax spread 1.0°C — prefer "winter in Barcelona" over thin month pages
- Barcelona summer months 6/7/8: tmax spread 2.0°C — prefer "summer in Barcelona" over thin month pages
- Reykjavik winter months 1/2/12: tmax spread 0.0°C — prefer "winter in Reykjavik" over thin month pages
- Reykjavik summer months 6/7/8: tmax spread 2.0°C — prefer "summer in Reykjavik" over thin month pages
- Dubai winter months 1/2/12: tmax spread 2.0°C — prefer "winter in Dubai" over thin month pages
- Dubai summer months 6/7/8: tmax spread 1.0°C — prefer "summer in Dubai" over thin month pages
- Lisbon winter months 1/2/12: tmax spread 1.0°C — prefer "winter in Lisbon" over thin month pages
- Lisbon summer months 6/7/8: tmax spread 2.0°C — prefer "summer in Lisbon" over thin month pages
- Rome winter months 1/2/12: tmax spread 1.0°C — prefer "winter in Rome" over thin month pages
- Amsterdam winter months 1/2/12: tmax spread 1.0°C — prefer "winter in Amsterdam" over thin month pages
- Amsterdam summer months 6/7/8: tmax spread 2.0°C — prefer "summer in Amsterdam" over thin month pages
- Berlin winter months 1/2/12: tmax spread 2.0°C — prefer "winter in Berlin" over thin month pages
- Berlin summer months 6/7/8: tmax spread 2.0°C — prefer "summer in Berlin" over thin month pages
- Madrid winter months 1/2/12: tmax spread 2.0°C — prefer "winter in Madrid" over thin month pages
- Singapore winter months 1/2/12: tmax spread 1.0°C — prefer "winter in Singapore" over thin month pages
- Singapore spring months 3/4/5: tmax spread 0.0°C — prefer "spring in Singapore" over thin month pages
- Singapore summer months 6/7/8: tmax spread 0.0°C — prefer "summer in Singapore" over thin month pages
- Singapore autumn months 9/10/11: tmax spread 0.0°C — prefer "autumn in Singapore" over thin month pages
- Sydney winter months 1/2/12: tmax spread 1.0°C — prefer "winter in Sydney" over thin month pages
- Sydney summer months 6/7/8: tmax spread 1.0°C — prefer "summer in Sydney" over thin month pages
- Los Angeles winter months 1/2/12: tmax spread 0.0°C — prefer "winter in Los Angeles" over thin month pages
- Chicago summer months 6/7/8: tmax spread 2.0°C — prefer "summer in Chicago" over thin month pages
- Dublin winter months 1/2/12: tmax spread 0.0°C — prefer "winter in Dublin" over thin month pages
- Dublin summer months 6/7/8: tmax spread 2.0°C — prefer "summer in Dublin" over thin month pages
- Copenhagen winter months 1/2/12: tmax spread 1.0°C — prefer "winter in Copenhagen" over thin month pages
- Copenhagen summer months 6/7/8: tmax spread 2.0°C — prefer "summer in Copenhagen" over thin month pages
- Vienna winter months 1/2/12: tmax spread 2.0°C — prefer "winter in Vienna" over thin month pages
- Bangkok winter months 1/2/12: tmax spread 2.0°C — prefer "winter in Bangkok" over thin month pages
- Bangkok spring months 3/4/5: tmax spread 1.0°C — prefer "spring in Bangkok" over thin month pages
- Bangkok summer months 6/7/8: tmax spread 1.0°C — prefer "summer in Bangkok" over thin month pages
- Bangkok autumn months 9/10/11: tmax spread 1.0°C — prefer "autumn in Bangkok" over thin month pages
- Marrakech winter months 1/2/12: tmax spread 2.0°C — prefer "winter in Marrakech" over thin month pages
- Istanbul winter months 1/2/12: tmax spread 2.0°C — prefer "winter in Istanbul" over thin month pages
- Istanbul summer months 6/7/8: tmax spread 2.0°C — prefer "summer in Istanbul" over thin month pages
- Hong Kong winter months 1/2/12: tmax spread 1.0°C — prefer "winter in Hong Kong" over thin month pages
- Hong Kong summer months 6/7/8: tmax spread 1.0°C — prefer "summer in Hong Kong" over thin month pages
- Miami winter months 1/2/12: tmax spread 1.0°C — prefer "winter in Miami" over thin month pages

## Cold start

PRELAUNCH_BATCH size: **0**.

Zero is not a failure. No compliant SERP/autocomplete/keyword observations were imported. The gate can promote a page to INDEXABLE/PRELAUNCH as soon as a real Path A/B/C is imported — GSC is not required.

## Opportunity score

Informational only. A Truth Gate fail still means INDEXABLE = false.

| Page | Demand | Truth | Utility | SERP opp. | Total | Indexable? |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| fix:bosch:dishwasher:e15 | 0 | 25 | 4 | 0 | 31 | false |
| fix:bosch:dishwasher:e24 | 0 | 25 | 4 | 0 | 31 | false |
| fix:bosch:dishwasher:e25 | 0 | 25 | 4 | 0 | 31 | false |
| fix:bosch:washer:e18 | 0 | 25 | 4 | 0 | 31 | false |
| fix:miele:washer:f70 | 0 | 25 | 4 | 0 | 31 | false |
| fix:bosch:dishwasher:e09 | 0 | 25 | 4 | 0 | 31 | false |
| fix:bosch:dishwasher:e14 | 0 | 25 | 4 | 0 | 31 | false |
| fix:bosch:dishwasher:e22 | 0 | 25 | 4 | 0 | 31 | false |
| fix:bosch:dishwasher:e01 | 0 | 25 | 4 | 0 | 31 | false |
| fix:bosch:dishwasher:e02 | 0 | 25 | 4 | 0 | 31 | false |
| fix:bosch:dishwasher:e04 | 0 | 25 | 4 | 0 | 31 | false |
| fix:bosch:dishwasher:e06 | 0 | 25 | 4 | 0 | 31 | false |
| fix:bosch:dishwasher:e07 | 0 | 25 | 4 | 0 | 31 | false |
| fix:bosch:dishwasher:e08 | 0 | 25 | 4 | 0 | 31 | false |
| fix:bosch:dishwasher:e10 | 0 | 25 | 4 | 0 | 31 | false |

