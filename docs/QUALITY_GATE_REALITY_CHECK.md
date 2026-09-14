# Quality gate reality check

Recalculated 2026-09-14 from `pnpm graph:audit` after hard-gate + soft-score refactor.

Stored README counts and the previous `docs/DEEP_GRAPH_QA.md` were **not** reused.

## Soft score (after hard gates)

| Dimension | Max |
| --------- | --: |
| Intent strength | 15 |
| Unique structured data | 15 |
| Decision utility | 20 |
| Graph depth | 15 |
| Provenance | 15 |
| Completeness | 10 |
| Differentiation | 5 |
| Freshness | 5 |
| **Total** | **100** |

INDEX candidate only if **every** hard gate passes **and** score ≥ **80**.

Editorial demand (`seed_research`) is classified `EDITORIAL_JUDGMENT`, scored at most 40/100 on the intent input, then 15 × 0.40 = **6 intent points**. Total editorial scores are still capped at **84**. That cap is the remaining pile-up.

## Distribution (all pages, recomputed)

| Bucket | Count | % | INDEXABLE |
| ------ | ----: | -: | --------: |
| 0–49 | 0 | 0 | 0 |
| 50–59 | 4 | 0.4 | 0 |
| 60–69 | 130 | 14.6 | 0 |
| 70–79 | 1 | 0.1 | 0 |
| 80–84 | 755 | 84.8 | 629 |
| 85–89 | 0 | 0 | 0 |
| 90–94 | 0 | 0 | 0 |
| 95–100 | 0 | 0 | 0 |

- mean **80.3** · median **84** · p10 **62** · p25 **82** · p75 **84** · p90 **84**
- min **59** · max **84**
- INDEXABLE mean **83.7** · min **80**
- share ≥90: **0%** → automatic “gate suspect” flag for ≥90: **false**

## Compared to the claimed previous curve

Claimed: min 80 / mean 90.2 / max ~98, almost nothing under 80.

Now: pages exist in 50–69; nothing reaches 90; INDEXABLE cannot sit on a self-declared 90 floor.

## What still inflates the 80–84 pile

The ≥90 rule did **not** fire. A different distortion remains:

1. **Editorial cap at 84** — almost every passing page lands on 82–84. That is a ceiling, not observed quality.
2. **Product utility is binary** — a working tool gives the full 20. That is correct for “has a decision output”, but it does not distinguish a thin vs deep tool.
3. **`hub_necessity`** still relaxes demand UNKNOWN on hubs.
4. **No GSC / internal search** — 100% of demand evidence is editorial. Intent cannot exceed 6 points until a real query log exists.

These are documented. They are **not** treated as proof of uniqueness or source quality.

## Hard gates that actually drop pages

Observed in this pass:

- `not_obscure_without_demand` — low-demand FixCode appliance/code combos → NOINDEX_PRODUCT
- `review_required` → REVIEW_REQUIRED (professional-only / problem pages)
- `product_action` missing on brand/destination hubs → GRAPH_ONLY
- `not_city_without_specifics` — a few WearThere months missing tmin on the page payload
- sibling similarity >0.85 + same intent + same decision → would MERGE/NOINDEX (none of the INDEX sample failed this after recompute)

A failed hard gate **never** becomes INDEXABLE, including when the soft score is 84.

## Verdict

- The old “min 80 / mean 90.2” curve is **rejected**.
- The new curve is **better**, not **natural**. The 84 pile is the editorial cap.
- Do not treat 84 as “high quality content”. Treat it as “hard gates passed + editorial ceiling”.
