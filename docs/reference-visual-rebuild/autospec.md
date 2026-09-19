# AutoSpec — visual rebuild QA

## REFERENCE

Porsche Motorsport Hub treats the car as the interface: cinematic scale, dark metal, sparse type, inspection as a scene change. BMW manuals are the functional benchmark for identity + service truth.

## CURRENT

Before this pass AutoSpec was a technical ownership dashboard with a boxed car image, a SaaS header (Garage / Vehicle / Service / Spec / + Add), and a repetitive cockpit grid (Now / Soon / Reference).

## VISUAL GAP

- Car trapped in a panel.
- Header was product-nav SaaS.
- Data lived in five identical cells.
- Truth language (licensed still, no telemetry) dominated the art direction.

## DESIGN DECISION

- Mast: `AUTOSPEC · BMW 320D G20 · GARAGE`.
- Cinema stage: car at ~60–80% of the useful desktop scene, ground shadow, zone rail (ENGINE / TYRES / BATTERY / SERVICE) that crops and dims the still.
- Specs become physical layers (OIL 5.0 L, TYRES 225/45 R18, SERVICE interval, BATTERY 12V).
- Truth moved into `Data & source`.
- VIN remains a disclosure stub, never a decode CTA.

## AFTER

Screenshots: `autospec-home-*`, `autospec-vehicle-*`.

Verified live on `/autospec` and `/autospec/bmw/3-series/g20/320d-b47`. Markup is `as-cinema` + `as-stage`.

## REMAINING GAP

No studio turntable, no OEM photography beyond licensed stills already in the repo. Zone inspect is a crop, not an exploded powertrain. Garage surfaces still carry more utility UI than the public vehicle scene.

## Rubric

| Criterion | Status |
| --- | --- |
| HEADER | STRONG |
| HERO | STRONG |
| COMPOSITION | STRONG |
| TYPOGRAPHY | ACCEPTABLE |
| IMAGERY | ACCEPTABLE |
| OBJECT QUALITY | ACCEPTABLE |
| DATA INTEGRATION | STRONG |
| INTERACTION | ACCEPTABLE |
| MOTION | ACCEPTABLE |
| MOBILE | ACCEPTABLE |
| POLISH | ACCEPTABLE |
| REFERENCE PARITY | ACCEPTABLE |
