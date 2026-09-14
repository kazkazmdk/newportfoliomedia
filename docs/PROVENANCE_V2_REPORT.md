# Provenance V2 report

## Hierarchy

| Level | Rule | Counts as VERIFIED_PRIMARY? |
| --- | --- | --- |
| PRIMARY_EXACT | Manufacturer/official + non-generic URL + locator + verified_at | yes |
| PRIMARY_GENERAL | Manufacturer/official homepage or /support | **no** |
| REGULATORY_EXACT | Regulatory + exact URL + locator | yes |
| TRUSTED_DATASET_EXACT | PRIMARY_DATABASE + dataset + exact URL | no (trusted, not primary) |
| TRUSTED_THIRD_PARTY | Named third party | no |
| CROSS_SOURCE_CONFIRMED | CROSS_SOURCE method | no |
| DERIVED_DETERMINISTIC / DERIVED_HEURISTIC | Calculated | no |
| EDITORIAL / AI_INFERRED / UNKNOWN | — | never |

`bmw.com`, `toyota.com`, `samsung.com/us/support` → PRIMARY_GENERAL.

AI_INFERRED → never VERIFIED_PRIMARY (tested).

## Multi-source

Model: FactObservation[] → CanonicalFact { CONFIRMED | CONFLICTED | UNRESOLVED | ESTIMATED }.
Conflicts are kept. No average, no silent pick.

Current catalog: every compiled fact has **one** source (`single=19559`). `conflicted=0` means we did not invent a second source. 0 conflicts ≠ agreement.

## Coverage

- exact URL: 3038
- identifiable document name: 10761
- field-level record present: 18306
- generic domain only: 4507
- PRIMARY_EXACT: 0

WearThere climate uses PRIMARY_DATABASE + dataset id, but `source_url` is null (unknown WMO/station). Not TRUSTED_DATASET_EXACT.
