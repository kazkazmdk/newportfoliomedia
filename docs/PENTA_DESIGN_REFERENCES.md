# Penta — design references

Audit date: 17 September 2026. Rechecked the same day: each Awwwards listing and each practical site was opened or confirmed live.

These references define a visual language and a functional benchmark for each
product. They are not templates to reproduce. Penta keeps its own data,
interaction model, identity, accessibility requirements and truth boundaries.

| Product | Awwwards (visual) | Live visual site | Practical site |
| --- | --- | --- | --- |
| FixCode | [Shinkei Systems — Honorable Mention](https://www.awwwards.com/sites/shinkei-systems) | [shinkei.systems](https://shinkei.systems/) | [Samsung washer error codes](https://www.samsung.com/us/support/troubleshoot/TSG10000997/) |
| AutoSpec | [Porsche Motorsport Hub — Honorable Mention](https://www.awwwards.com/sites/porsche-motorsport-hub) | [racing.porsche.com](https://racing.porsche.com/) | [BMW Owner's Manuals](https://www.bmwusa.com/owners-manuals.html) |
| WearThere | [When to Travel — Site of the Day](https://www.awwwards.com/sites/when-to-travel) | [Inside Asia Tours — When to Travel](https://www.insideasiatours.com/when-to-travel) | [Packr](https://packr.app/en/) |
| ChargeMatch | [Zaptec — Site of the Day](https://www.awwwards.com/sites/zaptec) | [zaptec.com](https://www.zaptec.com/) | [GearVerify USB-C Power Calculator](https://gearverify.com/electronics/usb-c-power-calculator/) |
| TripCost | [Made for Spain & Portugal — Honorable Mention](https://www.awwwards.com/sites/made-for-spain-portugal-2) | [madeforspainandportugal.com](https://www.madeforspainandportugal.com/) | [ViaMichelin Routes](https://www.viamichelin.com/routes) |

## Shared rules

- The primary decision remains visible before decorative storytelling.
- Motion must explain state or causality and respect `prefers-reduced-motion`.
- No visual treatment may imply live, measured, scanned or official data when
  the underlying evidence is modelled, typical or manually selected.
- Every product keeps a distinct art direction while sharing legible controls,
  keyboard navigation, responsive layouts and explicit provenance.
- Competitor capabilities are adopted only when the current graph and runtime
  can support them honestly.

## FixCode

**Awwwards:** [Shinkei Systems](https://www.awwwards.com/sites/shinkei-systems) — Honorable Mention, Asimov Collective.  
**Live site:** [shinkei.systems](https://shinkei.systems/)  
**Practical site:** [Samsung washing machine error codes](https://www.samsung.com/us/support/troubleshoot/TSG10000997/)  
**Exploration complement:** [iFixit Appliances](https://www.ifixit.com/Device/Appliance)

Why this pair: Shinkei is an industrial hardware surface — warm paper, signal
orange, technical illustrations, numbered system blocks. Samsung Support is the
real diagnostic job: displayed code → meaning → reversible first checks →
service boundary when the code persists.

Transferable functional patterns:

- identify appliance, brand and code before interpretation;
- lead with reversible checks and place warnings at the point of risk;
- expose the DIY / service boundary beside each branch.

Boundary: illustrations describe the graph. They do not claim visual scanning,
component detection, parts commerce or community repair coverage.

## AutoSpec

**Awwwards:** [Porsche Motorsport Hub](https://www.awwwards.com/sites/porsche-motorsport-hub) — Honorable Mention, AKQA.  
**Live site:** [racing.porsche.com](https://racing.porsche.com/)  
**Practical site:** [BMW Owner's Manuals](https://www.bmwusa.com/owners-manuals.html)

Why this pair: the Hub treats the vehicle as the primary object — dark cockpit,
technical values, anatomical detail. BMW's manuals are the practical ownership
lookup: identity first, then oil, tyres, intervals and warnings for that
vehicle. AutoSpec already uses BMW 3 Series identities; this is the honest
lookup path, not an OEM telemetry app.

Transferable functional patterns:

- progressive vehicle identification;
- prioritise now, soon and reference information;
- show source, date and acquisition mode for every state.

Boundary: AutoSpec does not imply OEM telemetry, a health state, recall
clearance or working VIN decode when those inputs are unavailable.

## WearThere

**Awwwards:** [When to Travel](https://www.awwwards.com/sites/when-to-travel) — Site of the Day, Unseen Studio.  
**Live project:** [Inside Asia Tours — When to Travel](https://www.insideasiatours.com/when-to-travel)  
**Practical site:** [Packr](https://packr.app/en/)

Why this pair: When to Travel is a seasonal editorial rail — destination, month
timeline, climate and events as a story. Packr is the packing tool people
actually use: destination + dates + weather → a wearable / packable list.

Transferable functional patterns:

- destination and dates remain the minimal entry;
- months form a keyboard- and touch-accessible comparison rail;
- distinguish climate context from capsule decisions.

Boundary: compiled typical climate is never styled or labelled as a live
forecast. Multi-traveller, offline and shared luggage features require separate
product work.

## ChargeMatch

**Awwwards:** [Zaptec](https://www.awwwards.com/sites/zaptec) — Site of the Day and Developer Award, Good Morning.  
**Live site:** [zaptec.com](https://www.zaptec.com/)  
**Practical site:** [GearVerify USB-C Power Calculator](https://gearverify.com/electronics/usb-c-power-calculator/)

Why this pair: Zaptec is a premium charging-hardware bench — isolated objects,
monochrome surfaces, one electrical signal colour. GearVerify is the closest
existing tool to the ChargeMatch job: device + charger + cable, then the lowest
link in the chain.

Transferable functional patterns:

- build the chain progressively from device to charger, cable and port;
- keep compatibility, expected watts, protocol and bottleneck persistent;
- grade blocking, limiting and unknown constraints separately.

Boundary: expected wattage is a rated calculation, not a laboratory measurement.
Decorative 3D must not delay the verdict or weaken mobile performance.

## TripCost

**Awwwards:** [Made for Spain & Portugal](https://www.awwwards.com/sites/made-for-spain-portugal-2) — Honorable Mention, Muskae.  
**Live site:** [madeforspainandportugal.com](https://www.madeforspainandportugal.com/)  
**Practical site:** [ViaMichelin Routes](https://www.viamichelin.com/routes)  
**Multimodal complement:** [Rome2Rio](https://www.rome2rio.com/)

Why this pair: Made for Spain & Portugal uses the map as the editorial scene
and a clear destination entry. ViaMichelin is the European driving-cost tool:
A→B, vehicle assumptions, fuel, tolls, fastest vs cheapest, cost split by
travellers.

Transferable functional patterns:

- immediate origin/destination entry and clear traveller effect;
- compare modes on cost and door-to-door duration;
- label cheapest, fastest and group outcomes explicitly;
- keep editable assumptions, per-person breakdown and provenance nearby.

Boundary: the current line is a corridor representation, not road geometry.
Costs and fares remain transparent models rather than live prices, traffic or
toll data.
