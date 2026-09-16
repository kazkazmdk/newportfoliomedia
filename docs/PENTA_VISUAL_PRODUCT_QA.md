# PENTA Visual Product QA

This report is an integrity report, not a design review.

**Baseline SHA (visual-depth V2):** `55da9c0ae6cf306580574ddcd3a82d0aaa83e412`  
**Product-first SHA:** `d2e2cd3509186897983d4987d819494b43b67b41`  
**Integrity implementation start:** `b774b61` (first commit of this pass)  
**Report generated from:** `git rev-parse HEAD` at the commit that last updated this file. Do not treat a hardcoded “final HEAD” as durable — the next commit would make it stale.

Viewports asserted by Playwright: `390×844`, `1440×1000`, `1440×1600`.  
Captures in `docs/visual-product-qa/` named `*-mobile-after.png`, `*-desktop-1440x1000-after.png`, `*-desktop-1440x1600-after.png` come from `pnpm qa:visual` against `next start`.

**Status vocabulary**

| Label | Meaning |
| --- | --- |
| **VERIFIED** | Automated test asserted the claim (URL, text, bounding box, or interaction). |
| **MANUALLY REVIEWED** | Screenshot / human reading only. |
| **NOT VERIFIED** | Not tested in this pass. |

A fold claim is **VERIFIED** only when Playwright checks `box.y + box.height <= viewport.height + 2`.

---

## TripCost

### Home

| Claim | Status | Proof |
| --- | --- | --- |
| `Compare trip` fully in first 390×844 viewport | VERIFIED | Playwright bounding box |
| From / To / People drive `/tripcost/{from}/to/{to}?travellers=` | VERIFIED | Interaction: travellers=2 on submit |
| No invented live fare on empty home | MANUALLY REVIEWED | Screenshot |
| Safari / iOS | NOT VERIFIED | Chromium only |

**Before / after**
- `tripcost-home-mobile-before.png` / `tripcost-home-mobile-after.png`
- `tripcost-home-desktop-1440x1000-before.png` / `tripcost-home-desktop-1440x1000-after.png`
- `tripcost-home-desktop-1440x1600-before.png` / `tripcost-home-desktop-1440x1600-after.png`

### Result — Paris → Lyon

Previous bug: `useState(4)` ignored `?travellers=`. Fixed: `sanitizeTravellers()` reads the query (default 2, clamp 1–6) and `router.replace` keeps `?travellers=` in sync.

| Claim | Status | Proof |
| --- | --- | --- |
| Home with 2 travellers → URL `travellers=2` → `Best for 2` | VERIFIED | Interaction test |
| Slider to 5 → URL `travellers=5` → `Best for 5` | VERIFIED | Interaction test |
| Fastest / Cheapest cash / True cost / Best for N fully in 390×844 | VERIFIED | `.tc-verdicts [data-verdict=*]` bounding boxes |
| Verdicts come from `compareRoute()` sorts, not hardcoded labels | VERIFIED | Unit + UI uses engine sorts |
| `.tc-hero.is-result` no longer uses 100svh | MANUALLY REVIEWED | CSS + screenshot |
| Map is compact on result | MANUALLY REVIEWED | Screenshot |

**Before / after**
- `tripcost-result-mobile-before.png` / `tripcost-result-mobile-after.png`
- `tripcost-result-desktop-1440x1000-after.png`
- `tripcost-result-desktop-1440x1600-after.png`
- Desktop 1440×1600 before: **No preserved before screenshot**

---

## ChargeMatch

Frozen this pass except regression checks.

| Claim | Status | Proof |
| --- | --- | --- |
| Device, Charger, Expected W, Check power fully in 390×844 | VERIFIED | Bounding boxes |
| Changing charger updates expected watts | VERIFIED | Apple 20W → Anker 65W changes the W figure |
| Multiport 1 plugged → 2 plugged changes allocation | VERIFIED | `.cm-branch` watt texts change |
| Limiter text present | VERIFIED | `/limited by/i` |
| Safari | NOT VERIFIED | |

**Before / after**
- `chargematch-home-mobile-before.png` / `chargematch-home-mobile-after.png`
- `chargematch-home-desktop-1440x1000-before.png` / `chargematch-home-desktop-1440x1000-after.png`
- `chargematch-home-desktop-1440x1600-after.png` — **No preserved before screenshot**
- `chargematch-result-mobile-before.png` / `chargematch-result-mobile-after.png`
- `chargematch-multiport-mobile-after.png`

---

## WearThere

Previous bug: `worn` / `hero` were computed from all `visible` pieces. The UI said the look updates; unpacking did not change the stack. Fixed: `packedPieces = visible.filter(id ∈ packed)`; hero and stack come from packed pieces only. Empty: “Nothing packed yet.” Buttons: `Remove from case` / `Add to case`.

| Claim | Status | Proof |
| --- | --- | --- |
| `Wear this` fully in first 390×844 viewport | VERIFIED | Bounding box of the real “Wear this” label |
| `Plan this trip` is the planner CTA | VERIFIED | Role=button exists |
| `Plan this trip` is first-fold | **NOT claimed** | Not asserted in-fold. Honest: Wear this is the first-fold product answer; Plan may sit below 844px |
| Remove from case changes look ids | VERIFIED | `data-look-ids` changes |
| Packed count decreases | VERIFIED | `data-packed-count` changes |
| Packing works without drag | VERIFIED | Button click only |
| Mobile order destination → climate → visual → Wear this → planner | MANUALLY REVIEWED | CSS order + screenshot |

**Before / after**
- `wearthere-home-mobile-before.png` / `wearthere-home-mobile-after.png`
- `wearthere-home-desktop-1440x1000-before.png` / `wearthere-home-desktop-1440x1000-after.png`
- `wearthere-home-desktop-1440x1600-after.png` — **No preserved before screenshot**
- `wearthere-tokyo-mobile-before.png` / `wearthere-tokyo-mobile-after.png`

---

## AutoSpec

Previous bug: garage and public vehicle used `87432` km, `last_oil_km: 76200`, `brake_pct: 72`, `battery: GOOD`, then showed remaining km and a `/100` score as if they were the user’s. Removed.

| Claim | Status | Proof |
| --- | --- | --- |
| Home search field in first viewport | VERIFIED | Bounding box |
| Search `320d` shows a real vehicle hit | VERIFIED | Button matching /320d/ |
| VIN is not a working primary CTA | VERIFIED | `Try decode` count 0 until details; summary says unavailable/stub |
| Public page shows interval (`Every N km / M months`), not remaining km | VERIFIED | Text + `87432` count 0 |
| Public page has Add to My Garage | VERIFIED | Link visible |
| Garage asks for mileage before remaining km | MANUALLY REVIEWED | Code + screenshot of public vs garage |
| Score hidden until all five checks entered | MANUALLY REVIEWED | `ownershipCoverage().ready` gate; no default GOOD/72 |
| Safari | NOT VERIFIED | |

**Before / after**
- `autospec-home-mobile-before.png` / `autospec-home-mobile-after.png`
- `autospec-home-desktop-1440x1000-before.png` / `autospec-home-desktop-1440x1000-after.png`
- `autospec-home-desktop-1440x1600-after.png` — **No preserved before screenshot**
- `autospec-vehicle-mobile-before.png` / `autospec-vehicle-mobile-after.png`

Catalog unit test still uses `87432` as an **internal fixture** for `ownershipScore()`. That is not a user-facing value.

---

## FixCode

Previous bug: recommended action sat in the hero, but the next action CTA (`Next branch`) was after a long water scrollytelling + a duplicated “Start with #1” question.

| Claim | Status | Proof |
| --- | --- | --- |
| `Do this first` in first 390×844 viewport | VERIFIED | Bounding box |
| Associated `Start check` CTA in the same first viewport | VERIFIED | Link bounding box |
| Start check lands on `/fixcode/diagnose` with the same first question | VERIFIED | Interaction |
| First question is not repeated as “Start with #1” | MANUALLY REVIEWED | Section retitled “Why this check first” (why only) |
| Machine visualization still present after the hero | MANUALLY REVIEWED | `fc-pin-wrap` kept |
| Safari | NOT VERIFIED | |

**Before / after**
- `fixcode-home-mobile-before.png` / `fixcode-home-mobile-after.png`
- `fixcode-error-mobile-before.png` / `fixcode-error-mobile-after.png`
- `fixcode-error-desktop-1440x1000-after.png` / `fixcode-error-desktop-1440x1600-after.png` — **No preserved before screenshot** for 1440×1600

---

## Viewport matrix

Playwright writes after-shots for every QA route at all three sizes. Genuine before shots from the visual-depth / product-first passes were kept. Missing befores are listed as **No preserved before screenshot** — none were invented.

Stale `*-qa.png` files from the previous, more lenient run were left on disk as historical extras. They are **not** evidence for this pass.

---

## Automated QA

`tests/visual-qa/product-first.spec.ts`

- 11 routes load without `pageerror`
- Full matrix 390×844 / 1440×1000 / 1440×1600, no horizontal overflow
- Fold: `y + height <= viewport + 2` on the **named** element (not a substitute string)
- Interactions: TripCost 2→5, WearThere pack, ChargeMatch charger + multiport, AutoSpec 320d + VIN stub, FixCode Start check
- Mobile nav `aria-expanded`

Command: `pnpm qa:visual` (starts `next start` after `pnpm build`).

Last local run: **23 passed**.

---

## Remaining defects

### P0

None remaining after this pass. The three P0s that existed at `d2e2cd3` (TripCost travellers ignored, AutoSpec fake odometer/score, WearThere look not bound to packed) are **VERIFIED** fixed.

This line is allowed only because: all Playwright tests passed, the critical interactions ran, and the state-continuity bugs were asserted — not inferred from code review.

### P1

- WearThere `Plan this trip` is not asserted first-fold. Forcing it into 844px would crush the still or `Wear this`. Documented, not faked.
- AutoSpec garage ownership extras (oil km, brakes, battery) are optional this-session fields. Nothing is persisted server-side. That is honest, but a refresh without `?km=` forgets mileage unless the query is kept.

### P2

- Safari / WebKit / iOS: **NOT VERIFIED**
- Chrome headless letter-spacing can collapse small uppercase tracking in screenshots. Live CSS is unchanged.
- `findVehicles("BMW 320d")` still fails (identity string is `bmw 3 series … 320d`). Query `320d` works and is the tested path.
- TripCost land polygon remains a geodesic sketch, not a road map.
- ChargeMatch desktop still has unused grid around the outlines (identity kept).

---

## Gate questions

| Product | UI claim backed by state/engine? | Tool or poster? |
| --- | --- | --- |
| FixCode | Yes — first question + Start check → diagnose | Tool |
| WearThere | Yes — packed set drives look + count | Tool |
| ChargeMatch | Yes — `powerChain()` / `allocate()` | Tool |
| AutoSpec | Yes — public interval; remaining only after mileage | Tool |
| TripCost | Yes — `?travellers=` = `compareRoute()` party size | Tool |
