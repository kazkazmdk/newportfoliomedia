# Visual rebuild — reference QA

Five independent art directions. If the five homes read as one design system, this pass failed.

| Product | Current | Reference | After | Main gap remaining |
| ------- | ------- | --------- | ----- | ------------------ |
| WearThere | Previous first-fold: editorial landing + widgets (`wt-hero`, pills, planner panel). | [When to Travel](https://www.insideasiatours.com/when-to-travel) · Packr | `wearthere-home-*` + `wearthere-tokyo-*` | Destination photography still licensed stills, not a live climate film. Capsule silhouettes are graphic, not photographed garments. |
| AutoSpec | Ownership dashboard + boxed car (`as-hero` / cockpit cells). | [Porsche Motorsport Hub](https://racing.porsche.com/) · BMW manuals | `autospec-home-*` + `autospec-vehicle-*` | Licensed stills, not a studio turntable. Zone inspect is crop/pan, not a real system x-ray. |
| ChargeMatch | Hardware bench with CSS brick mockups and a global tech strip. | [Zaptec](https://www.zaptec.com/) · GearVerify | `chargematch-home-*` + result + multiport | SVG hardware is more material but still illustrated, not photographed products. |
| FixCode | Industrial documentation dashboard + diagram in a panel. | [Shinkei Systems](https://shinkei.systems/) · Samsung / iFixit | `fixcode-home-*` + `fixcode-error-*` | Machine anatomy is a richer schematic, not a photographed exploded washer. |
| TripCost | Route calculator + GIS-feeling schematic. | [Made for Spain & Portugal](https://www.madeforspainandportugal.com/) · ViaMichelin | `tripcost-home-*` + `tripcost-result-*` | Map remains a geodesic atlas, not live routing cartography. |

## Screenshot matrix

Captured by `tests/visual-qa/product-first.spec.ts` into this folder.

Viewports: `390×844`, `1440×1000`, `1440×1600`.

Routes: five homes, WearThere Tokyo, AutoSpec BMW 320d G20, ChargeMatch simple + multiport, FixCode Samsung 4C, TripCost Paris → Lyon.

## Anti-homogenization

| Product | Signature |
| --- | --- |
| WearThere | Full-bleed destination scene, month rail, climate/pack modes, spatial wardrobe |
| AutoSpec | Dark cinematic vehicle, zone rail, physical spec layers |
| ChargeMatch | Light hardware bench, device → watts → charger, Y-split multiport |
| FixCode | Paper industrial anatomy, giant code, sticky diagnostic scroll |
| TripCost | Editorial atlas map, inline FROM/TO, route as the object |

## Status key

`STRONG` · `ACCEPTABLE` · `WEAK` · `NOT VERIFIED`

Statuses in each `{product}.md` are from real screenshots after this pass, not from reading the CSS.
