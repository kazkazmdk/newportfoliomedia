# WearThere — visual rebuild QA

## REFERENCE

When to Travel treats destination + time + weather as one continuous interface. Month is navigation. Photography is the page, not a column. Packr is the functional benchmark: capsule as a packing decision.

## CURRENT

Before this pass the home was still a premium editorial landing:

```
NAV · HERO · IMAGE · TABS · STATS · FORM · CLIMATE · CAPSULE · SEASONS
```

Header was a standard Destinations / Weather / Capsule / Plan bar. The planner was a form panel. SeasonRail sat too low. Capsule was a garment card grid.

## VISUAL GAP

- Header read as SaaS/editorial nav.
- First viewport assembled copy + photo rectangle + form.
- Time was not primary navigation.
- Climate / Pack were pills, not modes that change the scene.
- Capsule was catalogue cards.

## DESIGN DECISION

- Mast: `WEARTHERE · TOKYO / NOV / JAPAN · CLIMATE / PACK · PLAN`.
- Full-bleed destination stage. Climate numbers and pack silhouettes swap in-scene.
- JAN–DEC rail sits in the first viewport and rewrites climate, palette, and capsule.
- Planner is inline values (`TOKYO · 12–18 NOV · CLASSIC`) with expand-in-place controls.
- Destination index is a climate atlas of family rails, not a marquee list.
- Capsule is a layered figure (coat / knit / trouser / boot) plus loose objects.

## AFTER

Screenshots: `wearthere-home-mobile-after.png`, `wearthere-home-desktop-1440x1000-after.png`, `wearthere-home-desktop-1440x1600-after.png`, same for `wearthere-tokyo`.

Verified live on `/wearthere` and `/wearthere/tokyo`. Markup is `wt-mast` + `wt-stage`, not `wt-hero`.

## REMAINING GAP

Photography is still a single licensed hero per city. Month change retints and swaps climate data; it does not crossfade a real seasonal plate. Garments are SVG silhouettes, not photographed clothes.

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
