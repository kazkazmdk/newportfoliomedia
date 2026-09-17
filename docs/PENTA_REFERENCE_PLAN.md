# Penta — plan maître design (tous les produits)

Date : 17 septembre 2026.  
Base : homes Vercel, captures références (live / Awwwards / Wayback), inventaire routes et moteurs.  
Statut : brief d’exécution. Pas encore implémenté.

Ce document remplace le plan court. Il couvre **les cinq produits**, le chrome partagé, les pages résultat, le mobile, les états vides, et les gates. Il ne copie aucune référence. Il dit précisément quoi prendre, quoi refuser, dans quel fichier, et comment savoir que c’est fini.

`PUBLIC_SITE_LIVE=false` · noindex · truth gates inchangés · validation locale seulement.

---

## 0. Cadre

### Objectif

Faire passer chaque first fold — puis chaque page de décision — du **studio lisible** à un **outil qui a une atmosphère**, sans jamais habiller une donnée absente.

Aujourd’hui : cinq instruments distincts, même famille (typo géante, bandeau cookies, décision sous le fold).  
Cible : cinq identités. Un job clair au-dessus de la ligne de flottaison. Une référence visuelle **et** une référence pratique par produit, utilisées comme jauges, pas comme templates.

### Ce que les captures ont montré

| Produit | Penta (prod) | Awwwards | Pratique | Écart utile |
| --- | --- | --- | --- | --- |
| ChargeMatch | Crème, 20 W, builder 01–03 | Zaptec : objet isolé, monochrome, 1 couleur signal (hero live vide) | GearVerify : formulaire watts | Job déjà meilleur que GearVerify. Manque le banc. |
| WearThere | Tokyo, stats, carte capsule | When to Travel : destination full-bleed + rail mois (live mort, Awwwards + Wayback OK) | Packr : landing store | Cousin de When to Travel. Fold trop « fiche ». |
| AutoSpec | Photo BMW, lookup en dessous | Porsche : cinéma + cookies | BMW : VIN / identité au centre | Plus BMW que Porsche. L’identification n’est pas le fold. |
| FixCode | Instrument crème, schéma, 3 étapes | Shinkei : orange plein cadre | Samsung : « what is displayed » | Job Samsung. Shinkei = température, pas page. |
| TripCost | Graphe Europe, A/B | Made for Spain : brochure luxe + carte éditoriale | ViaMichelin : form gauche / carte droite / hypothèses | Job ViaMichelin. Pas une agence. |

### Principes

1. **La décision avant le décor.** Si le geste primaire n’est pas dans le fold, le décor a échoué.
2. **Une vague, un produit.** On s’arrête, on capture, on compare, puis on continue.
3. **Le graphe décide.** Si le moteur n’a pas le fait, le UI ne l’offre pas.
4. **Cinq palettes, un chrome.** Pas de design system unique. Cookie / legal / footer restent neutres.
5. **Motion = cause.** Largeur de flux, zone de schéma, mois → capsule. Pas de WebGL pour « faire Awwwards ».
6. **Desktop et mobile sont des livrables**, pas un afterthought. Breakpoint historique : 820 px.

### Non négociable

- Truth gates, provenance, `INDEXABLE=0`, sitemap vide, `PUBLIC_SITE_LIVE=false`.
- Pas de `vercel`, `vercel deploy`, hook, ou preview Vercel comme QA (`AGENTS.md`).
- Pas de donnée live / mesurée / scannée / officielle si le graphe dit le contraire.
- `prefers-reduced-motion` respecté partout.
- Licences : Commons et originaux déjà au catalogue. Pas de photos OEM, pas d’Unsplash sans piste.
- Pas de refonte des 500+ pages PUBLISHABLE. On touche chrome + homes + pages de décision.

### Hors scope (gelé)

- Auth, base, nouveaux services, OCR réel, decode VIN, tickets live, trafic, péages temps réel, forecast, photos SKU officielles.
- Copier Shinkei plein cadre, Packr App Store, Made for Spain colonnade, Porsche bâche/vidéo.
- Changer les slugs, les engines, ou les counts PUBLISHABLE « pour le look ».

### Échelle réelle des moteurs (plafond d’honnêteté)

| Produit | Catalogue | Interdit d’inventer |
| --- | ---: | --- |
| FixCode | 361 codes, 246 symptômes, 11 marques, 8 appareils | Procédure hors arbre, scan photo, OEM explosé |
| AutoSpec | 105 véhicules | VIN (`VIN_SUPPORT = NOT_IMPLEMENTED`), télémétrie, recalls in-graph |
| WearThere | 74 destinations | Forecast live, événements culturels hors graphe, photos mode licenciées |
| ChargeMatch | 72 devices, 26 chargeurs, 3 câbles | Watts labo (`MEASURED_CURVES = []`), PDO inventés, photos Apple/Anker |
| TripCost | 1 507 corridors, 78 lieux | Tuiles OSM, prix live (coûts = `HEURISTIC`), hors-catalogue → 404 |

---

## 1. Vague 0 — Chrome partagé (tous)

Sans ça, les cinq heroes restent illisibles. À faire **avant** toute direction artistique.

### 0.1 Bandeau cookies

**Problème.** `.cookie-banner` est une carte fixe bas d’écran (`globals.css`), padding 1.2 rem, ombre, 2 colonnes dès 760 px. Sur les captures prod, elle recouvre le builder / la carte / le lookup.

**Faire.**

- Version **compacte** : une ligne (titre court + 3 actions) en barre bas, hauteur max ~64 px desktop, ~88 px mobile.
- Le texte long et le lien « See cookie details » restent, en plus petit, ou seulement dans Customize.
- Dialog settings inchangé (essential always-on, analytics / preferences opt-in).
- Cookie `penta_consent`, 180 jours, essential-only par défaut : **inchangé**.
- Tokens `--cookie-*` restent neutres (pas teintés par produit).

**Fichiers.** `apps/web/src/components/cookie-consent.tsx`, `apps/web/src/app/globals.css`, éventuellement `apps/web/src/lib/consent.ts` (pas de nouveau cookie).

**Done.** À 1440×1000 et 390×844, sur les cinq homes, **avant** acceptation : titre + décision primaire visibles. Aucun overlay opaque au centre.

### 0.2 Headers

Cinq headers sticky (`z-index: 40`). WearThere est `position: fixed` + `mix-blend-mode: difference`. Ne pas les unifier. Vérifier seulement que la barre cookies compacte ne collisionne pas le CTA header sur mobile.

### 0.3 Motion et accessibilité

Inventaire déjà là : `use-reduced-motion.ts`, kill switch global dans `globals.css`. Chaque vague doit :

- garder le focus clavier sur selects / rails / maps ;
- ne pas animer si `prefers-reduced-motion` ;
- ne pas déplacer le CTA primaire hors tab order.

### 0.4 Protocole QA (toutes les vagues)

Local only : `pnpm install --frozen-lockfile` → lint → typecheck → test → build → `pnpm dev` port **43121** → Playwright / screens.

Captures obligatoires par vague produit :

| Viewport | Homes | Page décision |
| --- | --- | --- |
| 1440×1000 | home | 1 page résultat phare |
| 390×844 | home | même page |

Comparer à la paire de refs (fichiers déjà dans `/opt/cursor/artifacts/screenshots/compare_*`). Si le geste force une donnée absente : **on coupe**, on ne simule pas.

Pages phares :

- FixCode : `/fixcode/samsung/washer/4c-error` + `/fixcode/diagnose`
- AutoSpec : `/autospec/bmw/3-series/g20/320d-b47`
- WearThere : `/wearthere/tokyo` + `/wearthere/tokyo/november/what-to-wear`
- ChargeMatch : `/chargematch/iphone-16/with/apple-20w`
- TripCost : `/tripcost/paris/to/lyon`

---

## 2. Vague 1 — ChargeMatch (banc + calculateur)

**Ambition.** GearVerify pour le job, Zaptec pour la matière : un objet isolé, un plafond W, une couleur signal.

**Réfs.** Zaptec (SOTD) · [zaptec.com](https://www.zaptec.com/) · [GearVerify USB-C calculator](https://gearverify.com/electronics/usb-c-power-calculator/).

### Surfaces

| Route | Rôle | Travail |
| --- | --- | --- |
| `/chargematch` | `ConnectHero` = toute la home | Scène principale |
| `/chargematch/[device]` | Hub device | Aligner tokens / objet, pas de nouveau layout |
| `/chargematch/[device]/with/[charger]` | `PairStudio` | Même banc : faceplate + `PowerFlow` + `allocate()` |
| `/chargematch/kit` | Inventaire privé, noindex | Ne pas restyler. OCR reste gated |

### Système visuel

**Garder.** Space Grotesk + IBM Plex Mono. `--cm-led: #ff5a1f` comme **seule** couleur signal. Verdict `powerChain()`. Hardware SVG original (`DeviceObject`, `ChargerObject`). Copy « Rated path · not measured ».

**Changer.** Home crème (`--cm-paper: #efeee8`) → banc sombre pour le hero uniquement. L’objet (brick + device) devient la scène, le builder 01–03 un pupitre. Le 20 W / protocol / bottleneck reste le premier pixel utile, pas un aside.

**Refuser.** WebGL, photos SKU, watts « labo », inventer un 4ᵉ câble.

### Interactions

- Selects device / charger / cable / port : le plafond W et la largeur de flux bougent tout de suite (`AnimatedNumber` déjà là).
- `PowerFlow` : largeur = ceiling. Tap = evidence (déjà).
- `MultiportTree` : seulement si le chargeur a `allocations[]`. Ne pas afficher un arbre vide.
- Mobile (max 900 / 520 déjà dans `chargematch.css`) : verdict → objet → steps. Pas trois colonnes.

### États

| État | Comportement |
| --- | --- |
| Combo inconnue | ConfidenceTag existant, pas de faux 100 % |
| Apple Watch + brick USB-C | Note de sécurité déjà au moteur : la garder visible |
| `MEASURED_CURVES` vide | Jamais de badge TESTED / MEASURED |
| Chargement | Pas de skeleton qui invente un W |

### Fichiers

`connect-hero.tsx`, `chargematch.css`, `hardware.tsx`, `power-flow.tsx`, `pair-studio.tsx`, `faceplate.tsx`, `multiport.tsx`, `page.tsx`.

### Done

- Fold 1440 : objet + plafond W + bottleneck, cookies compactes.
- Fold 390 : même ordre, CTA joignable.
- Pair page : même température sombre / signal, evidence intacte.
- Tests moteur `powerChain` / `allocate` inchangés.

---

## 3. Vague 2 — WearThere (scène + capsule)

**Ambition.** When to Travel pour la scène (ville, mois, climat), WearThere pour le job (capsule portable). Packr n’est pas le modèle.

**Réfs.** [When to Travel](https://www.awwwards.com/sites/when-to-travel) (Awwwards + Wayback 2019) · Packr = contre-exemple store.

Le live `insideasiatours.com/when-to-travel` redirige vers une home marketing. On jauge sur les screens officiels, pas sur la home 2026.

### Surfaces

| Route | Rôle | Travail |
| --- | --- | --- |
| `/wearthere` | `DestinationHero` + ribbon + board + `SeasonRail` | Remonter rail + scène dans le hero |
| `/wearthere/[city]` | Hub ville | Même hero, mois par défaut honnête |
| `/wearthere/[city]/[month]/what-to-wear` | Décision capsule | Scène + board, pas une fiche de plus |
| `/wearthere/[city]/[month]/packing` | Liste | Typo / spacing seulement |
| `/wearthere/trip` | Outil dates, noindex | Formulaire déjà là ; hériter du hero |

### Système visuel

**Garder.** Playfair + Manrope. 6 moods `[data-climate]` (`polar humid sun rain cool mild`). Photos `destinationMedia()`. Garments SVG. Label « typical monthly climate, not a live forecast ».

**Changer.** Le fold n’est plus une carte (stats + 3 pièces) posée sur du noir. C’est la **destination en très gros** + photo full-bleed. `SeasonRail` (mois) et le toggle climat / capsule **entrent dans le hero**. Les 3 pièces essentielles passent en overlay bas, pas en carte qui vole la scène.

**Refuser.** Landing app store. Timeline d’événements (cerisiers, festivals) hors graphe. Forecast. Photos mode.

### Interactions

- Changer ville ou mois → mood, copy, photo, capsule, tout de suite (`typicalWeather`, `capsuleFor` déjà là).
- Toggle Events n’existe pas dans le graphe → **ne pas le créer**. Toggle climat / capsule seulement.
- `ClimateSlider` reste sous le fold : exploration des normals compilés.
- Header fixed + blend : vérifier lisibilité sur photo claire (Tokyo sakura, etc.).

### États

| État | Comportement |
| --- | --- |
| Ville hors catalogue | 404 existant |
| Mois sans capsule | Ne pas inventer de pièces ; message « no compiled capsule » |
| Image manquante | Fallback catalogue déjà prévu, pas un dégradé générique « voyage » |
| Dates trip invalides | Garder la validation actuelle |

### Fichiers

`destination-hero.tsx`, `season-rail.tsx`, `wearthere.css`, `page.tsx`, `[city]/page.tsx`, `climate-ribbon.tsx`, `wardrobe-board.tsx`, `climate-theme.ts`.

### Done

- Fold : nom de ville + photo + rail mois. Stats visibles sans carte flottante dominante.
- Changer novembre → mars change scène et capsule.
- « Typical, not a forecast » reste à côté des °C.
- Mobile : rail mois scroll horizontal, pas une grille écrasée.

---

## 4. Vague 3 — TripCost (planificateur, pas brochure)

**Ambition.** ViaMichelin pour le layout (contrôles / géographie / hypothèses). Made for Spain pour **rien** sauf éventuellement le calme typographique d’une carte éditoriale — pas le hero photo.

**Réfs.** [ViaMichelin Routes](https://www.viamichelin.com/routes) (live OK) · Made for Spain = contre-exemple agence.

### Surfaces

| Route | Rôle | Travail |
| --- | --- | --- |
| `/tripcost` | `HomeMap` | Split form / carte, cheapest+fastest dans le fold |
| `/tripcost/[from]/to/[to]` | `RouteCompare` | Même split ; sliders déjà là |
| `/tripcost/[from]/to/[to]/driving-cost` | Détail voiture | Exposer fuel / péage / parking **déjà HEURISTIC** |

### Système visuel

**Garder.** Barlow + Plex Mono. `--tc-route: #dc3f2f` pour le corridor. `EUROPE_LAND` + lat/lon réels. Copy « modelled corridor, not a road ». `CostEvidence` / `costLabel()`.

**Changer.** Home actuelle = graphe plein cadre + formulaire bas. Cible ViaMichelin : **gauche** A / B / voyageurs + 2 verdicts ; **droite** carte. Corridor sélectionné plus dense ; les autres restent à 16 % d’opacité.

**Refuser.** Tuiles OSM, MapLibre, trafic, tickets live, hero colonnade, « everlasting memory ».

### Interactions — ce que le moteur a déjà

`compareRoute()` expose `fuel_l_per_100`, `fuel_eur_per_l`, `tolls_eur`, `parking_eur`, `wear_eur_per_km`, voyageurs 1–6, modes car / ev / train / bus / flight / rideshare. Les sliders sont sur la **page résultat**.

Sur la home, on peut :

- monter cheapest / fastest (déjà calculés dans `HomeMap`) ;
- exposer voyageurs ;
- afficher **en lecture** les hypothèses fuel €/L du corridor, libellées `HEURISTIC` / « snapshot, not a live pump ».

On n’ajoute un slider fuel sur la home **que** s’il réutilise le même modèle que `RouteCompare`. Pas de nouveau type de véhicule.

### États

| État | Comportement |
| --- | --- |
| Origine sans destination | Select B se restreint aux `ROUTES` (déjà) |
| Corridor inconnu | 404 |
| Mode absent sur un corridor | Ne pas inventer un prix train |
| Carte mobile | `.tc-map.is-compact`, form au-dessus |

### Fichiers

`home-map.tsx`, `route-map.tsx`, `route-compare.tsx`, `compare-form.tsx`, `cost-race.tsx`, `break-even.tsx`, `door-timeline.tsx`, `tripcost.css`, `geo.ts`.

### Done

- Fold : A→B + voyageurs + cheapest + fastest, sans scroller.
- Carte reste schématique, corridor lisible.
- Result page : mêmes hypothèses, provenance « Assumptions and provenance » intacte.
- Aucun libellé « live fare » / « live traffic ».

---

## 5. Vague 4 — AutoSpec (identité d’abord)

**Ambition.** BMW manuals pour le geste (identifier, puis spécifier). Porsche seulement pour le sérieux de l’objet (fond sombre, photo comme pièce inspectée).

**Réfs.** [racing.porsche.com](https://racing.porsche.com/) · [BMW Owner's Manuals](https://www.bmwusa.com/owners-manuals.html).

### Surfaces

| Route | Rôle | Travail |
| --- | --- | --- |
| `/autospec` | Hero + `GarageEntry` + `VehicleStage` | Lookup **dans** le fold |
| `/autospec/[make]/[model]/[gen]/[variant]` | Hub | Identity strip + cockpit Now/Soon/Reference |
| `/autospec/.../[topic]` | oil / tyres / battery / maintenance / problems | Spacing / stage ; oil omis si `capacity_liters === 0` |
| `/autospec/garage` | Cockpit privé, noindex | Ne pas restyler en profondeur |

### Système visuel

**Garder.** Oswald + Source Sans. Cockpit sombre. Photos Commons `vehicleMediaOf()`. Callouts « not X-ray ». Barre provenance. États Now / Soon / Reference.

**Changer.** Aujourd’hui : photo vedette, « What do you drive? » en dessous. Cible : **identification au centre du fold**, photo = stage à droite ou derrière, pas une pub. `GarageEntry` monte.

**VIN.** `VIN_SUPPORT = "NOT_IMPLEMENTED"`. **Aucun champ VIN.** Garder la phrase de provenance. Un input VIN serait un mensonge.

**Refuser.** Télémétrie, recalls in-app, decode, cinéma bâche/vidéo, cookie-as-hero.

### Interactions

- Search make / generation / engine : seulement les 105 véhicules.
- Partial match ≠ fitment (`checkFitment()` / `fitmentScopeOf()`).
- `VehicleStage` zones body / engine / tyres / battery / service : déjà honnêtes, les garder.
- Hub : cockpit 5 colonnes dès 800 px ; mobile en liste.

### États

| État | Comportement |
| --- | --- |
| Recherche vide | Liste courte des covered makes, pas un empty-state marketing |
| 0 résultat | « Not on file. We will not guess a fitment. » |
| Topic oil absent | Page non générée (déjà) |
| Recalls | Lien portail officiel, pas un feu vert |

### Fichiers

`autospec/page.tsx`, `garage-entry.tsx`, `vehicle-stage.tsx`, `identity-strip.tsx`, `cockpit-cell.tsx`, `ownership-timeline.tsx`, `autospec.css`.

### Done

- Fold : on identifie un véhicule couvert avant de « sentir » la marque.
- Pas de champ VIN.
- Photo Commons + callouts inchangés quant à l’honnêteté.
- Hub 320d G20 : Now/Soon/Reference + provenance visibles.

---

## 6. Vague 5 — FixCode (arbre, pas manifeste)

**Ambition.** Samsung Support pour le geste (appareil → ce qui s’affiche → checks). Shinkei pour un **accent** industriel (signal orange, blocs numérotés), jamais pour un fond plein cadre.

**Réfs.** [shinkei.systems](https://shinkei.systems/) · [Samsung washer error codes](https://www.samsung.com/us/support/troubleshoot/TSG10000997/).

### Surfaces

| Route | Rôle | Travail |
| --- | --- | --- |
| `/fixcode` | `HomeScanner` + index codes + appliances | Identifier d’abord, manifeste ensuite |
| `/fixcode/[brand]` / `[appliance]` | Hubs | Process rail, pas de nouveau hero cinéma |
| `/fixcode/[brand]/[appliance]/[code]` | Page code | `ErrorHero` + checks + `SourceTrace` |
| `/fixcode/diagnose` | Arbre interactif, noindex | Schéma + `applyAnswer()` |

### Système visuel

**Garder.** IBM Plex Sans/Mono. Papier `--fc-paper: #e8e4dc`. Schéma original. `--fc-signal: #c4452d` déjà orange. `ProcessRail` 01 Identify / 02 Narrow / 03 Act. `SafetyLegend`. `ScrollProgress`.

**Changer.** Le fold est un manifeste (« Identify the fault ») + schéma. Cible : **marque / appareil / code (ou symptôme)** comme objet principal. Le schéma reste, plus petit ou à droite, et continue de suivre `zoneFromText()`. Accent signal plus présent sur badges / steps — **pas** un gradient Shinkei.

**Symptômes.** 246 symptômes existent (`not-filling`, `not-draining`, …). On peut offrir « What’s displayed / what happens » **uniquement** comme liste de `ALL_SYMPTOMS` filtrée par marque+appareil. Pas de nouveau questionnaire fictif.

**Refuser.** Scanner OCR, détection de pièce, photos iFixit, orange plein cadre, probabilités calibrées si `display_probabilities` est false.

### Interactions

- Match live `ALL_ERRORS` → `StateBadge` « Verified tree found » (déjà).
- Diagnose : `applyAnswer()`, classes `SAFE_USER_CHECK` → `STOP_USE`.
- `SourceTrace` drawer depuis hero / diagnose.
- DIY / service boundary à côté du risque, pas en footer.

### États

| État | Comportement |
| --- | --- |
| Code hors fichier | « We will not invent a repair procedure » (déjà) |
| Appliance non couverte | `UNSUPPORTED_NOTE` |
| Probabilités off | Causes rangées sans % |
| Scan mode | Reste déclaré non automatique |

### Fichiers

`home-scanner.tsx`, `machine-visual.tsx`, `machine-diagrams.tsx`, `error-hero.tsx`, `diagnose-tool.tsx`, `source-trace.tsx`, `system-ui.tsx`, `fixcode.css`, `page.tsx`.

### Done

- Fold : on lance Samsung washer 4C en un geste.
- Symptômes proposés = graphe seulement.
- Page 4C : checks + source trace + schéma de zone.
- Shinkei n’apparaît que comme température (signal), pas comme page.

---

## 7. Séquence et gates

```text
Vague 0  cookies compactes          → capture 5 homes
Vague 1  ChargeMatch banc           → home + pair iPhone 16 × 20W
Vague 2  WearThere scène            → home + Tokyo November
Vague 3  TripCost split             → home + Paris→Lyon
Vague 4  AutoSpec identité          → home + BMW 320d G20
Vague 5  FixCode arbre              → home + 4C + diagnose
```

Après chaque vague :

1. lint / typecheck / test / build
2. screens desktop + mobile (port 43121)
3. relecture honesty (aucune nouvelle implication live/mesuré/officiel)
4. **stop** — pas d’enchaînement automatique

Les vagues 1–5 touchent `apps/web/src/app/<product>/**` : avec `vercel-should-build.mjs`, **un seul** projet Vercel devrait builder si on pousse `main`. Vague 0 touche `globals.css` + cookie (shell partagé) → les cinq projets builderont. C’est le seul commit « tous produits » accepté. Ne pas mélanger vague 0 et vague 1 dans le même commit.

### Commit policy

- Vague 0 seule.
- Ensuite un commit (ou une série) par produit.
- Docs-only ne doit pas déployer (ignore step).
- Jamais `vercel deploy` pour regarder.

---

## 8. Matrice de reprise (prendre / refuser)

| Produit | On prend | On refuse |
| --- | --- | --- |
| ChargeMatch | Verdict persistant, chaîne 01–03, objet isolé, 1 LED | WebGL, SKU photo, watts mesurés |
| WearThere | Destination-scène, rail mois, toggle climat/capsule | Packr store, events hors graphe, forecast |
| TripCost | Split form/carte, cheapest/fastest, hypothèses HEURISTIC visibles | OSM, tickets live, brochure luxe |
| AutoSpec | Lookup au fold, photo = inspection, Now/Soon/Reference | Champ VIN, télémétrie, cinéma Porsche |
| FixCode | Identify → code/symptôme graphe, signal orange, schéma zone | Fond Shinkei, OCR, iFixit, % inventés |
| Tous | Cookies compactes, reduced-motion, QA locale | Deploy-as-QA, design system unique |

---

## 9. Critère global de fin

Le plan est fini quand, **sans accepter les cookies**, sur 1440 et 390 :

1. ChargeMatch montre objet + plafond W.
2. WearThere montre une ville + un mois + une capsule liée au climat typique.
3. TripCost montre A→B + voyageurs + cheapest/fastest.
4. AutoSpec permet d’identifier un véhicule couvert dans le fold, sans VIN.
5. FixCode lance un code ou un symptôme **on file** en un geste.
6. Aucune page n’a gagné une implication live / mesurée / officielle.
7. lint, typecheck, tests, build, screens locaux sont verts.

Ce n’est pas « les cinq sites ressemblent à Awwwards ». C’est « chaque site fait son job avec une atmosphère qui lui appartient ».
