# Penta — cinq moteurs de décision B2C

Ce dépôt n’est pas une ferme d’articles. C’est un monorepo de **cinq produits** qui transforment des données structurées en décisions.

**DATA → GRAPH → ENGINE → PRODUCT → SEO**

| Produit | Promesse | Moteur |
| --- | --- | --- |
| FixCode | Show us what's wrong. | Diagnostic d’appareil (arbre de probabilités + sécurité) |
| AutoSpec | Everything your car needs. | Copilote d’ownership (génération/moteur, pas des pages année) |
| WearThere | Know exactly what to wear anywhere. | Capsule + climat typique vs prévision |
| ChargeMatch | Will it work? | Compatibilité PD / allocation de ports |
| TripCost | Know what this trip will really cost. | Économie door-to-door |

Une app Next.js (`apps/web`) expose les cinq identités visuelles, l’admin interne `/ops`, et les APIs B2B-ready.

## Lancer en local

```bash
pnpm install
pnpm lint           # eslint apps/web only (pnpm lint:web)
pnpm lint:packages  # honest: no package ESLint — use typecheck
pnpm typecheck      # apps/web + workspace packages
pnpm test
pnpm build
pnpm truth-gate
pnpm graph:health
pnpm demand:audit
pnpm seo:audit
pnpm sitemap:audit  # parité des SETS sitemap / INDEXABLE
pnpm demand:discover
pnpm dev
```

Ouvre http://127.0.0.1:43121

`PUBLIC_SITE_LIVE` reste `false` : **noindex global** (previews Vercel inclus). Passer à `true` uniquement sur le domaine custom vérifié.

## Architecture

```
apps/fixcode|autospec|wearthere|chargematch|tripcost  moteurs + seeds
apps/web                                              Next.js (UI + route handlers)
packages/graph-core                                   entités / relations / pages
packages/data-provenance                              sources, conflits, confiance
packages/quality-gate                                 PageQualityGate 0–100
packages/demand                                       DemandEvidence V2 / pre-launch vs GSC
packages/publishing-core                              sitemaps, canonical, batches
packages/ai-core                                      tools-first, audit, routing
packages/analytics                                    PostHog-ready events
packages/catalog                                      graphe assemblé + rapport
```

Les identités visuelles **ne sont pas partagées**. Seuls l’infra, le graphe, la provenance, le quality gate, l’analytics et l’observabilité le sont.

## Indexation (Truth Gate V2.1)

A positive boolean is not proof. Each gate returns `{ gate, status, evidence, reason }`.

- Required fields come from `PAGE_REQUIREMENTS` per family (mandatory + decision-critical).
- `product_action` is detected from the payload, not from the page family.
- A CTA is not interactive.
- `distinct_from_parent` is computed. `page.id` is not distinctiveness.
- `VERIFIED_PRIMARY` requires `validateFactProvenance` (PRIMARY_EXACT / REGULATORY_EXACT). `bmw.com` is PRIMARY_GENERAL.
- `EDITORIAL_JUDGMENT` alone cannot produce `INDEXABLE` (max `SEO_CANDIDATE`).
- Soft score cannot compensate a failed hard gate.
- **GSC is not required** for a pre-launch INDEXABLE decision. A qualifying external path is (SERP intent + autocomplete, or SERP intent + observed volume, or volume + related/PAA/autocomplete).
- SERP existence, autocomplete, or Trends alone cannot index. Volumes are never invented (`null` if unknown).
- Demand never repairs a failed Truth Gate.

States: `INDEXABLE` | `SEO_CANDIDATE` | `NOINDEX_PRODUCT` | `GRAPH_ONLY` | `REVIEW_REQUIRED` + `seo_validation` `NONE|PRELAUNCH|POSTLAUNCH`.

- `INDEXABLE` ≠ `LIVE`. `PUBLIC_SITE_LIVE=false` → global noindex, empty sitemap.
- Le volume SEO n’est pas un quota 50–100. C’est l’output des quality gates sur le graphe. `PUBLISHABLE` = décision unique + hard gates. `INDEXABLE` exige encore une preuve de demande. Tiers A/B/C segmentent sitemaps / QA / monitoring, ils ne cachent pas C.
- lastmod = dernière mise à jour source / entité / relation / décision. Jamais `new Date()` à chaque build.
- Sitemaps segmentés : `/sitemaps/{produit}-{a|b|c}.xml` (vides tant que le kill switch est on). Uniquement des URLs `PUBLISHABLE` + indexables.

```bash
pnpm release:manifest   # ops/release-candidates.json + docs/PUBLISHABLE_SURFACE.md + QA sample
```

```bash
pnpm demand:import     # validate data/demand/** CSV/JSON
pnpm demand:discover   # queue, waves, PRELAUNCH_BATCH, reports
```

Rapport canonique live : `docs/PENTA_STATE.md`. Exécution V3 : `docs/PENTA_V3_EXECUTION.md`. Les rapports plus anciens sont historiques.

## Données (catalog, honnête)

Le graphe distingue SOURCE_TRUTH / DERIVED_RULE / PERSONALIZED_DECISION. ChargeMatch utilise `PowerScenario` (expected power = CALCULATED_EXPECTED, `measured_curve = null`). Pas de matrice cartésienne `EXPECTED_POWER`.

- FixCode : Samsung / LG / Bosch / Miele — `Coverage: 4 brands verified`. Pas de Whirlpool inventé. Probabilités affichées comme High/Medium/Possible jusqu’à outcomes VERIFIED.
- AutoSpec : identités moteur/génération, `market_scope`, fitment jamais via LLM. VIN = stub.
- WearThere : climat typique ≠ prévision. Pages trip datées = noindex.
- ChargeMatch : jamais « safe » parce que les watts suffisent. Certification inconnue.
- TripCost : corridors ciblés, cash vs true cost, snapshot de tarifs, door-to-door.

Open-Meteo (sans clé) est optionnel pour WearThere. S’il est indisponible, le climat typique reste affiché **comme climat**, jamais comme prévision.

Voir `DATA_SOURCES.md`.

## APIs

Rate-limited:

- `POST /api/fixcode/diagnose`
- `POST /api/autospec/vehicle`
- `POST /api/wearthere/packing`
- `POST /api/chargematch/compatibility`
- `POST /api/tripcost/compare`
- `GET /api/ops/report`
- `GET /api/ops/entity?id=`

## Tests

```bash
pnpm test
pnpm qa   # tests + seo-audit (exit 1 on duplicate canonical / preview indexable / etc.)
pnpm report
```

## Suite utile

1. Brancher un VIN provider **licencié** par territoire
2. Fares rail/flight avec contrat API et cache
3. Console ops : INDEX / NOINDEX / MERGE / REFRESH persistés (Postgres/Supabase)
