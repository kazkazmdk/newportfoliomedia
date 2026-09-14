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
pnpm test
pnpm graph:audit    # recalcule les métriques → docs/DEEP_GRAPH_BASELINE.md
pnpm graph:health   # tableau entités / relations / INDEX
pnpm deep-qa        # rapport QA (ne pas traiter un markdown précédent comme source)
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
packages/publishing-core                              sitemaps, canonical, batches
packages/ai-core                                      tools-first, audit, routing
packages/analytics                                    PostHog-ready events
packages/catalog                                      graphe assemblé + rapport
```

Les identités visuelles **ne sont pas partagées**. Seuls l’infra, le graphe, la provenance, le quality gate, l’analytics et l’observabilité le sont.

## Indexation

Hard gates first, then a soft score (max 100). A page with 95/100 still fails if a hard gate fails.

Hard gates: unique structured data, valid provenance, no critical unknown demand (unless hub necessity), not an unexplained duplicate, valid family, no invented LLM claims, no LLM safety claim, no year-only variant, not city-without-specifics, not obscure-without-demand, climate ≠ forecast, not stale-as-current, engine determined (AutoSpec), causes sourced (FixCode).

Soft score (max 100): intent 15, unique structured 15, decision utility 20, graph depth 15, provenance 15, completeness 10, differentiation 5, freshness 5. Word count / title uniqueness / link count are ignored. Editorial demand is capped; total editorial scores cap at 84. INDEXABLE only if **all** hard gates pass **and** score ≥ **80**. A 99 soft score cannot override a failed hard gate.

- `INDEXABLE` ≠ `LIVE`. `PUBLIC_SITE_LIVE=false` → global noindex (meta, X-Robots-Tag, robots.txt, empty sitemap).
- `NOINDEX_PRODUCT` / product-only tools (garage, trip, kit) stay private.
- Demand in this pass is **editorial judgment**, not GSC.

## Données (catalog, honnête)

Le graphe s’étend **en profondeur**, pas en pages creuses. Relations décisionnelles portent `decision_relevant`. Overlap ChargeMatch device×charger×cable is `EXPECTED_POWER` (inferred), **not** a lab `MEASURED_AT`.

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
