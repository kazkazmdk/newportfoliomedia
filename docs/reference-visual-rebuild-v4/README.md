# Reference visual rebuild v4

This pass removes the shared Penta starter silhouette.

It is a capture, assertion, and documentation folder. It does **not** automatically prove aesthetic quality.

## Status system

| flag | meaning |
| --- | --- |
| `REFERENCE_CAPTURE_PASS` | Official reference screenshots actually captured and accepted |
| `STRUCTURAL_ALIGNMENT_PASS` | Objective DOM metrics stay inside expected bands |
| `REGRESSION_PASS` | Current screenshots and state asserts succeed |
| `MANUAL_VISUAL_STATUS` | Human review only: `NOT_REVIEWED` / `MANUAL_CLOSE` / `MANUAL_FAIL` / `MANUAL_PASS` |
| `REFERENCE_PARITY_PASS` | Allowed only if home + feature references are verified, structural QA passes, regression passes, **and** manual visual status is `MANUAL_PASS` |

If Cursor or this environment cannot actually see and compare screenshots, `MANUAL_VISUAL_STATUS` stays `NOT_REVIEWED`.

A feature reference that cannot be captured is `NOT_VERIFIED`. It is never PASS.

## Folders

- `reference/` official captures or `*.UNAVAILABLE.txt`
- `current/` Penta captures
- `comparison/` optional side-by-side files
- `METRICS.json` structural measurements, not a design score
- `REFERENCE_CONTRACT.md` borrow / do-not-borrow / targets
- `FINAL_QA.md` product-by-product closeout
