# FixCode — visual rebuild QA

## REFERENCE

Shinkei Systems is machine anatomy: paper, black ink, signal red, diagrams at extreme scale. Samsung support + iFixit are the functional diagnostic flows.

## CURRENT

Before this pass FixCode already had the right materials (paper, mono, giant code) but the composition was an industrial dashboard: form card, process rail, diagram inside a panel, source trace in the chrome.

## VISUAL GAP

- Header exposed too much system (FC.01, System ready, Source trace).
- Home was form → cards → diagram.
- Machine visual sat in a framed stage rather than occupying the page.
- First action was a generic card.

## DESIGN DECISION

- Mast: `FIXCODE · DIAGNOSE / BROWSE` + LED evidence.
- Home anatomy: washer schematic dominant, giant `4C`, identity as `SAMSUNG / WASHER / 4C`.
- Error page keeps the giant code, then sticky machine + numbered water path (source / hose / valve / control).
- First reversible check is integrated under the code, not a separate card stack.
- Scope & evidence stays a disclosure. Index is a typographic atlas, not a card grid.

## AFTER

Screenshots: `fixcode-home-*`, `fixcode-error-*`.

Verified live on `/fixcode` and `/fixcode/samsung/washer/4c`. Markup is `fc-anatomy` on home, `fc-code-giant` + `fc-pin-wrap` on the 4C path.

## REMAINING GAP

The washer is still a schematic, not a photographed exploded machine. Non-water codes get less scrollytelling. Diagnose tool retains more form language than the public error scene.

## Rubric

| Criterion | Status |
| --- | --- |
| HEADER | STRONG |
| HERO | STRONG |
| COMPOSITION | STRONG |
| TYPOGRAPHY | STRONG |
| IMAGERY | ACCEPTABLE |
| OBJECT QUALITY | ACCEPTABLE |
| DATA INTEGRATION | STRONG |
| INTERACTION | STRONG |
| MOTION | ACCEPTABLE |
| MOBILE | ACCEPTABLE |
| POLISH | ACCEPTABLE |
| REFERENCE PARITY | ACCEPTABLE |
