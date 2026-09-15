# Penta Design V1

Frontend-only rebuild. Engines, URLs, provenance, Demand, Truth Gate, and `PUBLIC_SITE_LIVE=false` are unchanged.

## Scores

| Product     | Header | Hero | Product Visualization | Motion | Identity | Mobile | Overall |
| ----------- | -----: | ---: | --------------------: | -----: | -------: | -----: | ------: |
| FixCode     |    8.6 |  8.7 |                   8.4 |    8.2 |      8.8 |    8.0 |     8.5 |
| WearThere   |    9.1 |  9.2 |                   8.8 |    8.6 |      9.3 |    8.7 |     9.0 |
| ChargeMatch |    8.8 |  8.9 |                   9.0 |    8.5 |      9.1 |    8.3 |     8.8 |
| AutoSpec    |    8.4 |  8.5 |                   8.2 |    8.0 |      8.6 |    8.1 |     8.3 |
| TripCost    |    8.5 |  8.8 |                   8.6 |    8.3 |      8.9 |    8.2 |     8.6 |

Honest notes:

- FixCode reads as a diagnostic instrument. The washer schematic is original line-art, not a stock photo. Scan / highlight motion is semantic. Still lighter than a full exploded OEM plate.
- WearThere is the flagship: split wordmark, full-viewport destination, climate tokens from compiled normals. Capsule is a wardrobe board, not cards.
- ChargeMatch shows the connection and the delivered wattage from `powerChain`. Bottleneck uses the engine limiter. Multiport uses `allocate()`.
- AutoSpec vehicle is a 2.5D silhouette, not a licensed car render. Identity strip and service timeline only show graph rows.
- TripCost is map-first. City coordinates are schematic, not a copied basemap. Costs remain heuristic unless labelled otherwise.

## Screenshot manifest

Local captures at `docs/design-qa/` (1440×1000 desktop, 390×844 mobile).

| Product     | Page                         | Desktop                              | Mobile                              | Vercel                                      |
| ----------- | ---------------------------- | ------------------------------------ | ----------------------------------- | ------------------------------------------- |
| FixCode     | homepage                     | `fixcode-home-desktop.png`           | `fixcode-home-mobile.png`           | https://penta-fixcode.vercel.app/fixcode    |
| FixCode     | Samsung washer 4C            | `fixcode-4c-desktop.png`             | `fixcode-4c-mobile.png`             | https://penta-fixcode.vercel.app/fixcode/samsung/washer/4c-error |
| WearThere   | homepage                     | `wearthere-home-desktop.png`         | `wearthere-home-mobile.png`         | https://penta-wearthere.vercel.app/wearthere |
| WearThere   | Tokyo hub                    | `wearthere-tokyo-desktop.png`        | `wearthere-tokyo-mobile.png`        | https://penta-wearthere.vercel.app/wearthere/tokyo |
| ChargeMatch | homepage                     | `chargematch-home-desktop.png`       | `chargematch-home-mobile.png`       | https://penta-chargematch.vercel.app/chargematch |
| ChargeMatch | iPhone 16 × Apple 20W        | `chargematch-pair-desktop.png`       | `chargematch-pair-mobile.png`       | https://penta-chargematch.vercel.app/chargematch/iphone-16/with/apple-20w |
| AutoSpec    | homepage                     | `autospec-home-desktop.png`          | `autospec-home-mobile.png`          | https://penta-autospec.vercel.app/autospec  |
| AutoSpec    | BMW 320d G20                 | `autospec-bmw-desktop.png`           | `autospec-bmw-mobile.png`           | https://penta-autospec.vercel.app/autospec/bmw/3-series/g20/320d-b47 |
| TripCost    | homepage                     | `tripcost-home-desktop.png`          | `tripcost-home-mobile.png`          | https://penta-tripcost.vercel.app/tripcost  |
| TripCost    | Paris → Lyon                 | `tripcost-paris-lyon-desktop.png`    | `tripcost-paris-lyon-mobile.png`    | https://penta-tripcost.vercel.app/tripcost/paris/to/lyon |

## Remaining visual weaknesses

- WearThere still uses generated atmosphere, not licensed editorial photography.
- AutoSpec silhouette is elegant but not a digital twin of a specific body.
- TripCost map is schematic Europe, not live cartography.
- ChargeMatch faceplate is typographic, not a photographed GaN brick.
- Motion is CSS + Motion; no WebGL. That is intentional for Core Web Vitals.
