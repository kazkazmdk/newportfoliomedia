# TripCost — visual rebuild QA

## REFERENCE

Made for Spain & Portugal is an editorial atlas: paper, geography as the page, type that names places. ViaMichelin / Rome2Rio are the functional comparators.

## CURRENT

Before this pass TripCost was a route calculator with a schematic map in a frame, a classic compare form, and truth copy (modelled / geodesic / heuristic) on every surface.

## VISUAL GAP

- Header was comparator chrome (Compare / Routes / Methodology).
- Map felt like a GIS debug drawing.
- Form was a floating panel.
- Mode comparison read as a dashboard table.

## DESIGN DECISION

- Mast: `TRIPCOST · FROM — TO · ROUTES`. Method is secondary.
- Home is a full-bleed atlas. FROM / TO / travellers sit on the map. Cheapest / fastest / best-for-N are scene decisions, not a dark card.
- Result first viewport: `PARIS → LYON` / `{mode} wins for 2` / time · € pp, then map, then alternatives.
- Mode restyles the geodesic (train continuous, car dashed road, flight arc).
- One honest line: `MODELLED PRICES · NOT LIVE FARES` + Method & sources.
- Door-to-door and break-even remain dedicated visual moments below the fold.

## AFTER

Screenshots: `tripcost-home-*`, `tripcost-result-*`.

Verified live on `/tripcost` and `/tripcost/paris/to/lyon?travellers=2`. Markup is `tc-atlas` on home, `tc-result-title` + `tc-verdicts` on the corridor.

## REMAINING GAP

The map is still a geodesic diagram, not a designed physical atlas plate. City imagery is unused by choice (map stays the signature). Cost race is more typographic than a true editorial race composition.

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
| INTERACTION | STRONG |
| MOTION | ACCEPTABLE |
| MOBILE | ACCEPTABLE |
| POLISH | ACCEPTABLE |
| REFERENCE PARITY | ACCEPTABLE |
