# Source of truth — cinq produits B2C

Document produit **avant** toute modification de cette passe.
Les métriques précédemment rapportées (794 entités, 1 186 relations, 890 INDEXABLE, quality ~90.2) **ne sont pas une source de vérité**. Elles sont traitées comme un état annoncé, à recalculer.

Date du mapping : 2026-09-14.
Branche : `main`.
HEAD au moment du mapping : `2bd43c3` (`Turn catalogs into measurable decision graphs.`).

## 1. Identité du dépôt

Monorepo **pnpm** `penta`. Un seul package UI (`apps/web`) expose cinq moteurs.

Les cinq produits existent sous ces noms **externes et internes** (pas d’alias caché) :

| Nom produit | Package npm | Répertoire moteur | Route publique |
| ----------- | ----------- | ----------------- | -------------- |
| FixCode | `@penta/fixcode` | `apps/fixcode` | `/fixcode` |
| AutoSpec | `@penta/autospec` | `apps/autospec` | `/autospec` |
| WearThere | `@penta/wearthere` | `apps/wearthere` | `/wearthere` |
| ChargeMatch | `@penta/chargematch` | `apps/chargematch` | `/chargematch` |
| TripCost | `@penta/tripcost` | `apps/tripcost` | `/tripcost` |

Aucun autre produit B2C n’est présent.

## 2. Package roots

### Apps (moteurs)

| Chemin | Rôle |
| ------ | ---- |
| `apps/fixcode` | Diagnostic codes + symptômes + familles + batch2 |
| `apps/autospec` | Véhicules, specs, recalls, garage |
| `apps/wearthere` | Climat, destinations, packing |
| `apps/chargematch` | Devices, chargeurs, câbles, protocoles |
| `apps/tripcost` | Routes, véhicules, coûts, alternatives |
| `apps/web` | Next.js App Router — unique surface HTTP |

### Packages partagés

| Chemin | Rôle |
| ------ | ---- |
| `packages/graph-core` | `GraphStore`, entités, relations, pages, `INDEX_STATES` |
| `packages/quality-gate` | Hard gates + score mou + similarité |
| `packages/data-provenance` | Types de source, fraîcheur, conflits de faits |
| `packages/catalog` | Assemblage graphe, pages, ops, QA |
| `packages/publishing-core` | `PUBLIC_SITE_LIVE`, sitemap gate |
| `packages/ai-core` | Routing déterministe, `explainStructured` |
| `packages/eslint-config` | ESLint partagé |

## 3. Route roots (`apps/web/src/app`)

| Produit | Homepage | Pages SEO | Surface produit noindex | API |
| ------- | -------- | --------- | ----------------------- | --- |
| FixCode | `/fixcode` | `/fixcode/[brand]/[appliance]/[code]` | `/fixcode/diagnose` | `/api/fixcode/diagnose` |
| AutoSpec | `/autospec` | `/autospec/[make]/[model]/[gen]/[variant]/[topic]` | `/autospec/garage` | `/api/autospec/vehicle` |
| WearThere | `/wearthere` | `/wearthere/[city]/[month]/what-to-wear` | `/wearthere/trip` | `/api/wearthere/packing` |
| ChargeMatch | `/chargematch` | `/chargematch/[device]/with/[charger]` | `/chargematch/kit` | `/api/chargematch/compatibility` |
| TripCost | `/tripcost` | `/tripcost/[from]/to/[to]`, `/tripcost/[from]/to/[to]/driving-cost` | — | `/api/tripcost/compare` |

Ops (dev / noindex) :

- `/ops`
- `/api/ops/report`
- `/api/ops/entity`

SEO helpers : `apps/web/src/lib/seo.ts` (`pageMeta`, `globalNoindex()`).
Sitemap : `apps/web/src/app/sitemap.ts` → `shouldIndexPage`.

## 4. Data roots (fichiers, pas de base distante)

| Produit | Fichiers de données |
| ------- | ------------------- |
| FixCode | `apps/fixcode/src/data-samsung.ts`, `data-more.ts`, `data-symptoms.ts`, `batch2.ts`, `families.ts` |
| AutoSpec | `apps/autospec/src/data.ts`, `vehicles-more.ts` |
| WearThere | `apps/wearthere/src/climate.ts`, `destinations-more.ts` |
| ChargeMatch | `apps/chargematch/src/index.ts` (catalogue de base), `catalog-more.ts` |
| TripCost | `apps/tripcost/src/index.ts` (catalogue de base), `routes-more.ts` |

Aucune DB, aucun Neon, aucun fetch runtime pour le graphe. Tout est TypeScript compilé.

## 5. Graph models

`packages/graph-core/src/index.ts` :

- `GraphEntity` : `id`, `type`, `label`, `site`, `facts`
- `GraphRelation` : `from`, `to`, `type`, `inferred?`, `estimated?`, `decision_relevant?`, `source?`
- `PageRecord` : `id`, `path`, `site`, `indexState`, `entityIds`, `facts`, `qualityScore`, `qualityReasons`
- `INDEX_STATES` actuel : `INDEXABLE`, `NOINDEX_PRODUCT`, `GRAPH_ONLY`, `REVIEW_REQUIRED`, `REDIRECT`, `REMOVED`

Manques identifiés au mapping (à traiter **après** ce document) :

- pas de classification relation `DECISION_RELEVANT | DESCRIPTIVE | NAVIGATION_ONLY | UNKNOWN` comme enum
- pas d’états page `CONFLICTED` / `STALE`
- `qualityScore` stocké sur `PageRecord` (ne doit pas être repris sans recalcul)
- `confidence` parfois présent dans les faits / sources

Assemblage : `packages/catalog/src/index.ts` + `packages/catalog/src/graph-depth.ts` (`populateDecisionGraph`).

## 6. Quality gates

`packages/quality-gate/src/index.ts` :

- Hard gates d’abord, puis score mou
- INDEXABLE actuel : aucun hard fail **et** score ≥ **75**
- Dimensions actuelles : `intent_strength`, `unique_data`, `decision_utility`, `freshness`, `source_diversity`, `completeness`, `relation_quality`
- Cap éditorial : `seed_research` → EDITORIAL 40, score total cap 84
- Similarité : `structuredSimilarity`, `intentFamilyId`
- Distribution : buckets 0–49 … 90–100 (pas encore 80–84 / 85–89 / 90–94 / 95–100)

`packages/publishing-core` : `PUBLIC_SITE_LIVE=false` vide le sitemap et force noindex HTTP.

## 7. Provenance

`packages/data-provenance/src/index.ts` :

- `SOURCE_TYPES` : OFFICIAL, MANUFACTURER, REGULATORY, TESTED, TRUSTED_THIRD_PARTY, THIRD_PARTY, USER_OBSERVED, USER_REPORTED, AI_INFERRED
- `ProvenanceRecord`, `isFresh`, `detectConflicts`, `assertInferenceCannotBecomeOfficial`
- Pas encore `PRIMARY_DATABASE`, `TESTED_INTERNAL`
- Pas encore `FactProvenance` / `FactConflict` comme modèle unique par fait

## 8. Scripts

| Script | Fichier | Rôle |
| ------ | ------- | ---- |
| `pnpm dev` | Next `:43121` | Preview |
| `pnpm build` | `apps/web` | Production build |
| `pnpm test` | Vitest | Tests |
| `pnpm qa` | `scripts/qa.ts` | Contrôles SEO/runtime |
| `pnpm deep-qa` | `scripts/deep-graph-qa.ts` | Rapport graphe (recalcule, mais le markdown `docs/DEEP_GRAPH_QA.md` n’est **pas** une source) |
| `pnpm report` | `scripts/report.ts` | Rapport JSON/console |

**Absents au mapping** : `graph:audit`, `graph:health`.

## 9. Tests

| Fichier | Portée |
| ------- | ------ |
| `packages/catalog/src/catalog.test.ts` | Catalogue, gates, similarité, ChargeMatch, AutoSpec, TripCost, WearThere |
| `apps/web/src/lib/seo.test.ts` | noindex global |
| `apps/web/src/lib/ops-guard.test.ts` | garde ops |
| `apps/web/src/app/sitemap.test.ts` | sitemap vide hors live |

## 10. Docs existants (non autoritatifs pour les chiffres)

| Fichier | Usage |
| ------- | ----- |
| `README.md` | Vue d’ensemble |
| `DATA_SOURCES.md` | Inventaire des sources |
| `docs/DEEP_GRAPH_QA.md` | Rapport **précédent** — ne pas relire comme métrique |

## 11. État annoncé vs état à mesurer

| Claim | Source | Statut |
| ----- | ------ | ------ |
| 794 entités / 1 186 relations / 890 INDEXABLE / quality ~90.2 | commit `35f3633` + brief | **Suspect** — ne pas réutiliser |
| ~3 088 entités / ~9 682 relations / ~817 INDEXABLE / quality ~82.4 | `docs/DEEP_GRAPH_QA.md` après `2bd43c3` | **Suspect jusqu’à recalcul** — le score stocké et le markdown ne comptent pas |

## 12. Règle de cette passe

1. Ce fichier est le mapping.
2. Toute métrique suivante doit venir d’un recalcul depuis les objets TypeScript en mémoire.
3. Interdit : reprendre `qualityScore` stocké, un compteur README, un JSON/markdown précédent, ou un `confidence` auto-déclaré comme preuve.
