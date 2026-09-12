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

- `INDEXABLE` si score ≥ 75, demande, données distinctes
- `NOINDEX_PRODUCT` si 60–74
- `GRAPH_ONLY` sinon — le graphe ChargeMatch peut contenir toutes les paires device×charger sans URL

Aucune page n’est créée parce qu’une combinaison existe. L’IA n’écrit pas 1 500 mots sur un mot-clé : elle explique des faits structurés.

## Données (batch 1, honnête)

Le batch 1 est **profond et étroit** :

- FixCode : Samsung / LG / Bosch / Miele — codes avec arbres complets, pas Whirlpool inventé
- AutoSpec : 5 identités moteur/génération (BMW 320d G20, Corolla, Golf, Model 3, Civic)
- WearThere : 8 villes à forte demande, mois prioritaires
- ChargeMatch : appareils et chargeurs populaires ; le reste est graph-only
- TripCost : corridors européens à forte demande, tarifs **estimés** (pas un GDS live)

Open-Meteo (sans clé) est optionnel pour WearThere. S’il est indisponible, le climat typique reste affiché **comme climat**, jamais comme prévision.

## APIs

- `POST /api/fixcode/diagnose`
- `POST /api/autospec/vehicle`
- `POST /api/wearthere/packing`
- `POST /api/chargematch/compatibility`
- `POST /api/tripcost/compare`
- `GET /api/ops/report`

## Tests

`pnpm test` vérifie le quality gate, le diagnostic 4C, la compatibilité USB-PD, Paris→Lyon selon le nombre de voyageurs, le climat ≠ forecast, et que chaque URL indexable a un titre unique et un score ≥ 75.

## Suite utile (prochain batch)

1. FixCode : étendre les arbres Samsung/LG/Bosch (pas une explosion de marques vides)
2. Brancher un VIN provider **licencié** par territoire
3. Fares rail/flight avec contrat API et cache
4. Console ops : INDEX / NOINDEX / MERGE / REFRESH persistés (Postgres/Supabase)
