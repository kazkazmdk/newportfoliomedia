# PENTA Visual Product QA

Baseline SHA: `55da9c0ae6cf306580574ddcd3a82d0aaa83e412`  
Pass SHA: recorded at commit time in git (`main`)  
Viewports: `1440×1000`, `1440×1600`, `390×844`  
Rule: product first, art direction second. Identities unchanged.

Screenshots live in `docs/visual-product-qa/`.

---

## TripCost

### Home — desktop 1440×1000 / 1440×1600

**First viewport**
- CTA visible? **Yes.** `Compare trip` sits on the map as a command bar (`left/right/bottom: 1.2rem`).
- Product understood? **Yes.** From / To / People control a geodesic corridor.
- Result preview visible? **Partial.** Route line + city nodes update with the selects. No invented fare chips on the empty home.
- Scroll required before interaction? **No.**

**Hierarchy**
- Primary: From, To, People, Compare trip
- Secondary: selected Paris–Lyon geodesic
- Decorative: Europe land polygon, muted unused corridors

**Issues**
- P0 (before): `.tc-map { min-height: 36rem }` + svg `min(78vh, 720px)` put ~700px of map above the form. CTA y > 844 on mobile; on 1440×1000 the form was a footer under the map.
- P1 (before): form read as “the section after the poster”.

**Fix made**
- `apps/web/src/app/tripcost/tripcost.css` — mobile form `order: 1`, map `order: 2`, compact svg; desktop form absolutely docked on the map (solid paper, no glass).
- `apps/web/src/app/tripcost/components/home-map.tsx` — CTA label `Compare trip`; people default 2.
- `apps/web/src/app/tripcost/components/route-map.tsx` — selected route stroke 3.4–4px; unused corridors 0.16 opacity; city labels only for hubs + endpoints.

**Before / after**
- `tripcost-home-mobile-before.png` / `tripcost-home-mobile-after.png`
- `tripcost-home-desktop-1440x1000-before.png` / `tripcost-home-desktop-1440x1000-after.png`
- `tripcost-home-desktop-1440x1600-before.png` / `tripcost-home-desktop-1440x1600-after.png`

Measured mobile after: From + To + People + Compare trip + a map slice all have `y < 844`.

### Result — Paris → Lyon

**First viewport**
- CTA / decision visible? **Yes.** Fastest / cheapest cash / true cost / best for N.
- Labels used only from `compareRoute()`: Fastest = min `minutes_door`; Cheapest = min `cash_eur`; True cost = min `true_eur`; Best for N = `result.best`.
- Scroll before the comparison? **No** on 390×844 (verdict grid immediately under the map).

**Hierarchy**
- Primary: corridor title, people slider, four verdicts
- Secondary: door-to-door / cash race / break-even
- Decorative: map land fill

**Fix made**
- `apps/web/src/app/tripcost/route-compare.tsx` — `.tc-verdicts` from engine sorts only.

**Before / after**
- `tripcost-result-mobile-before.png` / `tripcost-result-mobile-after.png`
- `tripcost-result-desktop-before.png` / `tripcost-result-desktop-after.png`

Show-don’t-tell: changing people recomputes `result.best` and the four chips.

---

## ChargeMatch

### Home — 1440×1000 / 390×844

**First viewport**
- CTA visible? **Yes on 390×844.** `Check power` sits under Expected watts. Before: CTA y was below the 14rem nodes + objects.
- Product understood? **Yes.** Device → charger → expected W.
- Result preview visible? **Yes.** `powerChain()` watts + `limitingComponent` + protocol.
- Scroll before interaction? **No** on mobile. Desktop keeps device → cable → charger to the right of the desk.

**Hierarchy**
- Primary: Device, Charger, Expected W, Check power
- Secondary: industrial outline of device/brick (diagram, not fake photo)
- Decorative: 48px technical grid

**Issues**
- P0 (before): `.cm-node { min-height: 14rem }` + CSS “photoreal” bodies buried the CTA.
- P1: result weight < object weight.

**Fix made**
- `connect-hero.tsx` — live `powerChain()` expected block; hardware after the desk on desktop, hidden on mobile.
- `chargematch.css` — nodes `min-height: 0`; hardware converted to stroke diagrams (Option A).
- Multiport entry: `/chargematch/macbook-air-13-m3/with/anker-100w-2c` (published pair).

**Before / after**
- `chargematch-home-mobile-before.png` / `chargematch-home-mobile-after.png`
- `chargematch-home-desktop-1440x1000-before.png` / `chargematch-home-desktop-1440x1000-after.png`

Measured mobile after: Expected `20W`, Limited by port, Check power all `y < 844`.

### Result / multiport

**First viewport**
- Expected watts + match + limiter are the first block (`.cm-result-bar`).
- Multiport: `allocate()` on `anker-100w-2c` is `100 → 65+30` when C2 is plugged. Port buttons change `plugged` and re-run `allocate()`.

**Fix made**
- `pair-studio.tsx` — result bar first; plug count drives `usedPorts`.

**Before / after**
- `chargematch-result-mobile-before.png` / `chargematch-result-mobile-after.png`
- `chargematch-result-desktop-before.png` / `chargematch-result-desktop-after.png`
- `chargematch-multiport-mobile-after.png`

Show-don’t-tell: changing the charger changes expected W and “limited by”.

---

## WearThere

### Home — 390×844

**First viewport (measured after)**
1. Destination + dates — `TOKYO` / `12 Nov–18 Nov`
2. Climate — `9–17°C` · `Rain likely` · humidity
3. Destination still
4. Essential clothes — `Merino knit + Packable rain shell + Wool coat` from `capsuleFor()`
5. Planner / Plan this trip (in-fold or one short scroll)

**Before:** `.wt-hero-type { order: 2 }` put the photo/planner above Tokyo. First screen was a cropped still + form, no climate→clothes sentence.

**CTA / result**
- Compact result (`Wear this`) is in the first 844px.
- Plan this trip is the explicit action; it may sit just under the style field.

**Hierarchy**
- Primary: city, climate numbers, clothing sentence
- Secondary: planner
- Decorative: rain veil on the still

**Fix made**
- `destination-hero.tsx` — climate read + `capsuleFor()` essential line.
- `wearthere.css` — mobile flex order: type 1, frame 3, answer 4, planner 5. Photo `min-height: 28vh` (was 52vh).

**Before / after**
- `wearthere-home-mobile-before.png` / `wearthere-home-mobile-after.png`
- `wearthere-home-desktop-1440x1000-before.png` / `wearthere-home-desktop-1440x1000-after.png`
- `wearthere-tokyo-mobile-before.png` / `wearthere-tokyo-mobile-after.png`

### Desktop

Climate (°C, rain) sits in the same column as `Wear this`. The still remains the right-hand editorial field.

### Capsule

`wardrobe-board.tsx` — one dominant look (coat + knit + trousers + shoes stacked) plus secondary pieces and the existing pack/unpack board. No prices, no shop.

Show-don’t-tell: Tokyo → Reykjavik changes mood tokens, °C, and the essential sentence.

---

## AutoSpec

### Home — onboarding (no owned vehicle)

**First viewport**
- Job: **identify**. Headline `What do you drive?`
- Input: make/model search. Hits are real `findVehicles()` rows.
- VIN is `<details>` with `Unavailable · stub` (`VIN_SUPPORT === NOT_IMPLEMENTED`). Not a peer CTA.
- Car photo `100vw` on 390×844 (was `min(70vw, 920px)`).

**Covered identities** starts after an ownership explanation block — not immediately under the hero.

**Issues**
- P1 (before): home mixed “Your car, understood” + featured G20 identity + VIN decode as a real control.
- P1 (before): car ~70vw, too small.

**Fix made**
- `page.tsx` — onboarding copy; identities moved down.
- `garage-entry.tsx` — VIN demoted; default query `320d` so a real hit appears.
- `autospec.css` — `.as-car-photo { width: 100vw }` under 820px.
- `vehicle-stage.tsx` — `sizes` 100vw on small screens.

**Before / after**
- `autospec-home-mobile-before.png` / `autospec-home-mobile-after.png`
- `autospec-home-desktop-1440x1000-before.png` / `autospec-home-desktop-1440x1000-after.png`

### Vehicle / garage — ownership

Cockpit cells from the graph only:
- Service = `nextService()[0].km_left`
- Oil = `oil.spec` + `capacity_liters`
- Tyres = `tyres.front`
- Battery = `12V` + `battery.type`
- Recalls = VIN-specific check source (no invented clean bill)

**Before / after**
- `autospec-vehicle-mobile-before.png` / `autospec-vehicle-mobile-after.png`

Show-don’t-tell: inspect zones (engine / tyres / battery / service) change the callout on the still.

---

## FixCode

### Home

Unchanged composition (P2: do not restage). Brand / appliance / error / observed / Run diagnostic + schematic still share the first desktop viewport.

**Before / after**
- `fixcode-home-mobile-before.png` / `fixcode-home-mobile-after.png`

### Error / diagnose

**Hierarchy after**
1. Code (`4C`) + plain-English meaning
2. `Do this first` = `questions[0]`
3. Illustrated check + `Next branch`
4. Remaining checks
5. Stop boundary from `tree.boundaries`
6. Alternative causes
7. Manufacturer source (secondary)

**Fix made**
- `error-hero.tsx` / `[code]/page.tsx` / `diagnose-tool.tsx`
- Schematic plate mark: `Water path` instead of `SYSTEM SCHEMATIC`
- Header status: `Ready` instead of `System status`

**Before / after**
- `fixcode-error-mobile-before.png` / `fixcode-error-mobile-after.png`

Show-don’t-tell: answering a diagnose branch dims eliminated systems on the plate.

---

## Accessibility / performance (P2)

- Focus rings on primary controls (product colour tokens, 2px / 3px offset).
- Selects/inputs/CTAs `min-height: 44px` where they are the action.
- `aria-expanded` on the five mobile nav toggles.
- `overflow-x: clip` on each product root.
- Existing `prefers-reduced-motion` blocks kept (paths, scan, photo mask, flow dots).
- `next/image` `sizes` updated only where crop width changed (AutoSpec 100vw, WearThere hero unchanged 100vw/58vw). Priority remains on heroes.

---

## Automated QA

`tests/visual-qa/product-first.spec.ts` + `playwright.config.ts`

- Routes return OK
- `390×844` and `1440×1000` screenshots (non-blocking, not pixel-diff)
- No horizontal overflow (`scrollWidth <= clientWidth + 1`)
- Primary CTA / result copy visible and `y < 844` on mobile
- Main product landmark exists
- Mobile nav opens
- No `pageerror`

Command: `pnpm qa:visual` (CI starts `next start` after `pnpm build`).

---

## Remaining defects

### P0
None observed after the pass on the required viewports.

### P1
- WearThere `Plan this trip` can sit just under the 844px fold when the still + essential line are both present. The clothing answer is in-fold; this is accepted.
- ChargeMatch home desktop still has unused grid field around the outlines. Identity kept; not filled with cards.

### P2
- Chrome headless letter-spacing screenshots collapse small uppercase tracking (`FROM` reads as `FROMFROM`). Live CSS tracking is unchanged.
- FixCode home remains a tall diagnostic hero by design.
- TripCost SVG land is still a coarse polygon (no MapLibre added).
- AutoSpec `findVehicles("BMW 320d")` fails because the concatenated identity is `bmw 3 series … 320d`, not `bmw 320d`. Default query is now `320d`. Token search would be a later engine change.

---

## Gate questions

| Product | Without the logo, does the UI show the engine? | Tool or Behance? |
| --- | --- | --- |
| FixCode | Code → meaning → do this first → schematic zone | Tool |
| WearThere | °C / rain → named garments | Tool |
| ChargeMatch | Device + charger → expected W + limiter | Tool |
| AutoSpec | Search vs cockpit (service/oil/tyres/battery) | Tool |
| TripCost | From/To/People → compare → fastest/cheapest/true | Tool |
