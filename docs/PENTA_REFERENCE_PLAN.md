# Penta — comparaison références et plan

Date : 17 septembre 2026.  
Base : homes Vercel production + captures live / Awwwards / Wayback.  
Ce n’est pas un brief de copie. Chaque produit garde son graphe, ses truth gates et `PUBLIC_SITE_LIVE=false`.

## Verdict

Les cinq homes Penta sont des **outils lisibles**. Aucun first fold ne tient visuellement face à sa référence Awwwards. Le plus proche, c’est le **job** :

| Produit | Visuel Awwwards | Job pratique | Verdict |
| --- | --- | --- | --- |
| ChargeMatch | Zaptec non comparable (hero vide + cookies) | GearVerify : même calculateur | Job déjà là. Manque le banc matériel. |
| WearThere | When to Travel (Awwwards + Wayback) | Packr = landing store, pas un outil | Plus proche de When to Travel que de Packr. First fold trop « carte produit ». |
| AutoSpec | Porsche = cinéma + modal | BMW = identité d’abord | Plus proche de BMW. La photo est le sujet, le lookup est en dessous. |
| FixCode | Shinkei = orange plein cadre | Samsung = code → checks | Job Samsung. Atmosphère anti-Shinkei (volontaire). |
| TripCost | Made for Spain = brochure luxe | ViaMichelin = A/B + hypothèses | Job ViaMichelin. Carte = graphe, pas un planificateur. |

Le bandeau cookies écrase le first fold des cinq. À traiter avant tout redesign.

## Comparaison par produit

### ChargeMatch ↔ Zaptec / GearVerify

**Vu.** Home crème, « Build the right power path », verdict 20 W / PD 3.0 / bottleneck, builder 01–03. GearVerify : formulaire blanc watts + câble + CTA. Zaptec live : page noire, barre cookies, hero pas chargé.

**Écart.** Le calcul est déjà meilleur que GearVerify (device / brick / cable / port, pas trois champs numériques). L’objet manque : Zaptec isole un bloc matériel sur un fond monochrome, une seule couleur signal.

**Prendre.** Verdict persistant au-dessus du fold. Chaîne progressive. Fond sombre + objet isolé + une couleur électrique.

**Refuser.** WebGL chargeur, watts présentés comme une mesure labo, photos SKU officielles.

**Fichiers.** `apps/web/src/app/chargematch/components/connect-hero.tsx`, `chargematch.css`, `hardware.tsx`, `power-flow.tsx`.

### WearThere ↔ When to Travel / Packr

**Vu.** Tokyo éditorial, stats climat, carte capsule. When to Travel : destination en très gros (Japan / Vietnam), photo full-bleed, rail Events / Weather / mois. Packr : teal App Store. Le live `/when-to-travel` redirige vers une home marketing ; le SOTD n’existe plus.

**Écart.** `DestinationHero` + `SeasonRail` existent déjà, mais le mois et le choix de ville sont sous le fold. Le first fold est une fiche (stats + 3 pièces), pas une timeline immersive.

**Prendre.** Destination comme scène. Rail mois + bascule climat / capsule **dans** le hero. Photo full-bleed déjà cataloguée, à laisser parler.

**Refuser.** Devenir une landing app. Présenter le climat typique comme un forecast. Timeline d’événements culturels hors graphe.

**Fichiers.** `destination-hero.tsx`, `season-rail.tsx`, `wearthere.css`, `page.tsx`.

### AutoSpec ↔ Porsche Hub / BMW manuals

**Vu.** Cockpit noir, photo BMW 3 Series, lookup en dessous. Porsche : voiture bâchée, modal cookies. BMW : phare teal, champ VIN au centre, « Your BMW, Detailed ».

**Écart.** AutoSpec raconte la voiture. BMW raconte l’identification. `GarageEntry` est un panneau secondaire. VIN est déclaré en provenance (`VIN_SUPPORT`), pas comme entrée hero.

**Prendre.** Identité d’abord : recherche / génération au centre du fold. Photo = objet inspecté, pas une pub. États Now / Soon / Reference déjà honnêtes, les garder.

**Refuser.** Télémetrie OEM, decode VIN inventé, cinéma Porsche (bâche, video, cookies-as-hero).

**Fichiers.** `autospec/page.tsx`, `garage-entry.tsx`, `vehicle-stage.tsx`, `autospec.css`.

### FixCode ↔ Shinkei / Samsung

**Vu.** Instrument crème, schéma grille, 3 étapes, formulaire marque / appareil / code. Shinkei : orange diagonal, zéro diagnostic. Samsung : photo machine + « What is displayed on your washer? ».

**Écart.** Le job est le bon. Le first fold est un manifeste (« Identify the fault ») plus qu’un arbre. Shinkei n’est pas un modèle de page diagnostic.

**Prendre.** Accent signal orange (pas un fond plein cadre). Branches « ce qui s’affiche » avant le code, uniquement si le graphe a déjà ces nœuds. Schéma qui réagit à la zone, déjà en place.

**Refuser.** Copier le gradient Shinkei. Scanner visuel, détection de pièce, photos iFixit.

**Fichiers.** `home-scanner.tsx`, `machine-visual.tsx`, `fixcode.css`.

### TripCost ↔ Made for Spain / ViaMichelin

**Vu.** Graphe Europe, Paris→Lyon, A/B + voyageurs. ViaMichelin live : formulaire gauche (départ, arrivée, mode, véhicule, €/L), carte monde droite. Made for Spain : colonnade, serif luxe, « everlasting memory » ; carte = outline Ibérie + photos.

**Écart.** TripCost est un studio de comparaison. ViaMichelin est un planificateur opérationnel. Made for Spain est une agence. Le graphe Penta est honnête (corridors, pas le réseau routier) mais il ne lit pas comme un trajet.

**Prendre.** Split ViaMichelin : hypothèses visibles (voyageurs déjà là ; véhicule / carburant seulement s’ils existent dans le modèle). Géographie à droite. Résultat cheapest / fastest déjà calculé — le monter dans le fold.

**Refuser.** Devenir une brochure voyage. Tuiles carto live, trafic, péages temps réel. Copier le hero photo Made for Spain.

**Fichiers.** `home-map.tsx`, `route-map.tsx`, `compare-form.tsx`, `tripcost.css`.

## Non négociable

- Truth gates, provenance, `PUBLIC_SITE_LIVE=false`, noindex.
- Pas de donnée live, mesurée, scannée ou officielle si le graphe ne l’a pas.
- Un produit par vague. Pas de redesign des cinq d’un coup.
- Validation locale seulement. Pas de `vercel deploy`, pas de hook.
- Motion CSS / Motion, `prefers-reduced-motion`. Pas de WebGL pour « faire Awwwards ».
- Cookie : rester essential-only par défaut. Juste ne plus manger le fold.

## Plan

### Vague 0 — First fold lisible (tous)

Le bandeau cookies passe en barre compacte (une ligne + 3 actions) ou en coin. Le hero entier doit rester visible à 1440×1000 et 390×844 **avant** acceptation.

Critère : les cinq homes Vercel / local montrent titre + décision primaire sans overlay opaque.

### Vague 1 — ChargeMatch (plus proche, plus contenu)

1. Hero = banc : fond sombre, objet isolé, une couleur signal pour le flux.
2. Le verdict watts / protocol / bottleneck reste le premier pixel utile.
3. Builder 01–03 inchangé fonctionnellement ; le hardware devient la scène, pas une illustration à côté.
4. Mobile : verdict puis objet puis steps, pas trois colonnes écrasées.

Critère : first fold = objet + plafond W. Toujours « rated, not measured ».

### Vague 2 — WearThere (atmosphère When to Travel, job capsule)

1. Destination name + photo full-bleed occupent le fold.
2. Rail mois + toggle climat / capsule **dans** le hero (`SeasonRail` remonte).
3. Les 3 pièces essentielles restent, en overlay, pas en carte flottante qui vole la scène.
4. Climat typique : label déjà là, le garder visible à côté des °C.

Critère : changer de ville ou de mois change la scène tout de suite. Packr n’est pas le modèle.

### Vague 3 — TripCost (layout ViaMichelin, pas l’agence)

1. Split : contrôles A/B/voyageurs à gauche, géographie à droite.
2. Cheapest / fastest dans le fold, libellés modèle.
3. Si le moteur a déjà des hypothèses véhicule / carburant, les exposer. Sinon ne pas les inventer.
4. La carte reste schématique. On peut densifier le corridor sélectionné, pas coller une tuile OSM.

Critère : un utilisateur comprend A→B et le levier voyageurs sans scroller. Zéro promesse de ticket live.

### Vague 4 — AutoSpec (identité BMW, objet Porsche)

1. « What do you drive? » + `GarageEntry` dans le fold, pas sous la photo.
2. Photo Commons = stage d’inspection (callouts déjà honnêtes).
3. VIN : n’offrir un champ que si `VIN_SUPPORT` le permet vraiment. Sinon garder la phrase de provenance.
4. Now / Soon / Reference inchangés.

Critère : on identifie un véhicule couvert avant de « ressentir » la marque.

### Vague 5 — FixCode (arbre Samsung, signal Shinkei)

1. Accent orange / numbered blocks, papier crème conservé.
2. Home : identifier l’appareil, puis le code ou le symptôme déjà au graphe. Pas de nouveau questionnaire fictif.
3. Le schéma continue de suivre la zone. Légende DIY / service reste à côté du risque.

Critère : un code couvert (ex. Samsung washer 4C) se lance en un geste. Shinkei n’apparaît que comme température, pas comme page.

## Ordre et arrêt

On s’arrête après chaque vague. Capture desktop + mobile, comparaison à la paire de refs, puis seulement la vague suivante.

Si une vague force une donnée absente du graphe, on coupe le geste, on ne simule pas.

## Hors scope

- Refaire les 500+ pages PUBLISHABLE.
- Auth, DB, nouveaux services.
- Photos OEM / Unsplash sans piste de licence.
- Déploiements Vercel comme QA.
- Copier Made for Spain, Shinkei plein cadre, ou Packr store.
