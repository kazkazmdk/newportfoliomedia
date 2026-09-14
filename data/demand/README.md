# Demand evidence (pre-launch)

Drop observed search evidence here. Nothing in this folder is invented.

```
data/demand/
  fixcode/
  autospec/
  wearthere/
  chargematch/
  tripcost/
```

## CSV

```csv
page_id,query,country,source,observed,value,observed_at,notes
```

`value` must be empty or `null` when the volume is unknown. Do not write `1000` because it “feels” right.

Allowed `source` values:

`SERP` `AUTOCOMPLETE` `RELATED_SEARCH` `PAA` `GOOGLE_TRENDS` `KEYWORD_PLANNER` `KEYWORD_PROVIDER` `GSC` `INTERNAL_SEARCH` `PRODUCT_USAGE` `EDITORIAL`

Google Trends must use `unit=RELATIVE_INDEX`. A Trends `0` is not “zero searches”.

## JSON

A file may be a `DemandEvidence` object, an array, or `{ "evidence": [], "serp": [] }`.

SERP rows need `exactIntentResults` and `classification`. `resultsObserved > 0` is existence only — not intent.

## Import

```bash
pnpm demand:import
```

Malformed dates, unknown sources, and negative values are rejected. Historical rows are kept even after TTL expiry; they simply stop counting toward the score.
