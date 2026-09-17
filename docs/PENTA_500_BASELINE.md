# Penta 500 baseline

Measured after QA-debt fixes (real source coverage, honest QA statuses, ChargeMatch SEO filter, absolute sitemap locs) and the first graph-depth pass. Gates were not lowered.

| Product | Generated | Publishable | Limited | Noindex | Sources | Real source coverage | Entities | Relations |
| ------- | --------: | ----------: | ------: | ------: | ------: | -------------------: | -------: | --------: |
| fixcode | 652 | 607 | 34 | 11 | 39 | 1.000 | 5330 | 15769 |
| autospec | 605 | 203 | 0 | 402 | 1 | 1.000 | 2021 | 2489 |
| wearthere | 768 | 406 | 12 | 350 | 3 | 1.000 | 5491 | 14688 |
| chargematch | 614 | 571 | 0 | 43 | 3 | 1.000 | 402 | 2529 |
| tripcost | 1526 | 1526 | 0 | 0 | 2 | 1.000 | 41101 | 53368 |

AutoSpec topic pages failed `distinct_from_sibling` because hubs copied oil/tyre/battery facts. WearThere sat under 500 because similar climate fingerprints consolidated and `tmin_c === 0` was treated as missing.

`sourceCoverage` is weighted sourced decision facts / weighted decision facts. It is no longer inferred from quality score.
