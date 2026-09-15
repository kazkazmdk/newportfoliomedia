# Penta acceleration report

> **HISTORICAL.** This report is not the current source of truth. Live metrics: [`docs/PENTA_STATE.md`](./PENTA_STATE.md).
>
> It recorded 217 SEO_CANDIDATE at an earlier SHA. Do not compare it to live recalculation.

Generated: 2026-09-14. Starting commit: `353e5e4bb5597f06f473f0b0139b39ff7e2f3033`.
`PUBLIC_SITE_LIVE=false` for the entire pass. No domain launched. No public robots change.

# 1. Executive verdict

The pass closed the CI hole (`LayoutProps`), made lint / typecheck / test / build / audits workspace-level, and pushed product engines (diagnostic trees, fitment scope, climate-season model, power chain, CostValue + break-even).

Truth Ready rose **50 → 217** without adding URLs (890 → 890). INDEXABLE stayed **0**. PRELAUNCH batch stayed **0**. External demand observations stayed **0**. Manufacturer `PRIMARY_EXACT` stayed **0**.

That is the intended outcome: more useful, differentiated, honest decisions — not more pages, not fake demand, not fake exact sources.

# 2. CI

```txt
lint            PASS  (apps/web eslint + workspace package typecheck)
typecheck       PASS  (apps/web + packages + engines + scripts)
tests           PASS  (107)
build           required in GitHub Actions
truth gate      required
graph audit     required (graph:health)
demand audit    required
SEO audit       required
sitemap audit   required (set parity, not counts)
```

No `continue-on-error`. Preview mode: sitemap and indexable sets are both empty.

# 3. Overall

| Metric | Before | After |
| ------ | -----: | ----: |
| Pages / candidates | 890 | 890 |
| Entities | 5470 | 5512 |
| Relations | ~15021 | 14047 |
| Source-truth edges | — | 3087 |
| Manufacturer PRIMARY_EXACT entities | 0 | 0 |
| Trusted-dataset-exact climate facts (WearThere) | 0 | 2381 |
| Generic / general provenance facts | dominant | still dominant outside climate |
| Truth Ready (SEO_CANDIDATE + INDEXABLE) | 50 | 217 |
| INDEXABLE | 0 | 0 |
| PRELAUNCH_INDEXABLE | 0 | 0 |
| SEO_CANDIDATE | 50 | 217 |
| NOINDEX_PRODUCT | 299 | 210 |
| GRAPH_ONLY | 385 | 365 |
| REVIEW_REQUIRED | 156 | 98 |
| External demand observations | 0 | 0 |
| Sitemap / index set parity (preview) | empty = empty | exactParity true |
| Scale-stop critical_provenance | — | triggered (exact OEM = 0) |

# 4. Per product

| Product | Candidates | Truth Ready | Demand Checked | PRELAUNCH INDEXABLE | SEO Candidate | Primary Exact Coverage | Readiness |
| ------- | ---------: | ----------: | -------------: | ------------------: | ------------: | ---------------------: | --------- |
| FixCode | 249 | 65 | 0 | 0 | 65 | 0 (support roots = PRIMARY_GENERAL) | Best wedge; 131 error rows still NEEDS_EXACT_SOURCE |
| AutoSpec | 123 | 0 | 0 | 0 | 0 | 0 | FitmentScope live; no silent exact trim |
| WearThere | 416 | 152 | 0 | 0 | 152 | 0 OEM; climate = TRUSTED_DATASET_EXACT | Season model geographic; months consolidable |
| ChargeMatch | 64 | 0 | 0 | 0 | 0 | 0 | Power chain live; SEO stays device-intent later |
| TripCost | 38 | 0 | 0 | 0 | 0 | 0 | Heuristic ≠ live; break-even is the product |

# 5. Product ranking

1. **FixCode 7.5/10** — only launch wedge. 65 Truth Ready error pages, diagnostic trees, safety boundaries. Blocked by exact OEM articles and demand import.
2. **WearThere 6.5/10** — Sydney December is southern summer; Singapore is equatorial, not four temperate seasons. 152 Truth Ready city-month pages; many should consolidate to season/city-guide before SEO.
3. **ChargeMatch 5.5/10** — delivered watts = min(device, protocol, port, cable, allocation). Rated ≠ measured. Pair pages stay product/noindex.
4. **AutoSpec 4.5/10** — EXACT fitment needs generation + engine + years + market. VIN remains `NOT_IMPLEMENTED`. 0 Truth Ready.
5. **TripCost 4.0/10** — CostValue + typical-estimate labels + interactive break-even. Must not be indexed on heuristic fares.

# 6. Scale readiness

| Product | READY_FOR_DATA_SCALE | READY_FOR_DEMAND_DISCOVERY | READY_FOR_SEO_BATCH | READY_FOR_PUBLIC_LAUNCH |
| ------- | --- | --- | --- | --- |
| FixCode | CONDITIONAL (codes inside 4 brands + locators) | YES (Wave A queue exists) | NO | NO |
| AutoSpec | NO (exact handbook locators first) | YES (queue only) | NO | NO |
| WearThere | CONDITIONAL (consolidate months first) | YES | NO | NO |
| ChargeMatch | NO (engine first; no cartesian SEO) | YES | NO | NO |
| TripCost | NO (need a fare provider for index) | YES | NO | NO |

# 7. Largest remaining blocker

| Product | Blocker |
| ------- | --- |
| FixCode | No PRIMARY_EXACT manufacturer article (page/section/table) for any error code |
| AutoSpec | Generation-level OEM compilation cannot become exact trim/engine/market fitment |
| WearThere | No imported demand; month matrix still larger than justified season/city guides |
| ChargeMatch | No proven device-level demand; no lab curves (measured stays UNKNOWN) |
| TripCost | Fare provider missing — heuristic must stay labelled typical/indicative |

# 8. Next scale recommendation

**Do not generate a new page batch.**

Rational next work, in order:

1. Import real Wave A observations (SERP intent + autocomplete, or volume + related/autocomplete) for the **65 FixCode Truth Ready** pages.
2. Attach OEM PDF locators to those 65 before any INDEXABLE promotion.
3. Consolidate WearThere near-duplicate months (equatorial → city guide; temperate tight seasons → season pages).
4. Only then consider **+20 to +40** FixCode error pages inside Samsung / Bosch / LG / Miele.

A jump to 250 / 500 / 1000 URLs while `PRIMARY_EXACT = 0` and demand observations = 0 would trip scale-stops and produce undifferentiated pages.

See `docs/SCALE_SIMULATION.md`.
