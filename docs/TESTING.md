# Verification and acceptance plan

## Test matrix

| Area | Check | Implemented test or command |
|---|---|---|
| Calendar | Exactly 53 x 7 slots; Sunday-first; correct column/row and future-day mapping | tests/test_engine.mjs |
| Time | Correct UTC dates, leap days, year/week transitions and generated_at boundaries | tests/test_engine.mjs |
| Provenance | Contract v1 source validation, untrusted URLs, event kinds and counts | tests/test_engine.mjs |
| Deduplication | Duplicate IDs ignored, same-day events become one day-star | tests/test_engine.mjs |
| Streaks | Only true adjacent dates; singletons and missing days break runs; week wrap | tests/test_engine.mjs + tests/test_motion.mjs |
| Intensity | Source-backed summed units and matching legend; no fabricated contributions | tests/test_engine.mjs |
| Rendering | Three designs, two themes, accessible self-contained SVGs, deterministic output | tests/test_engine.mjs |
| Motion | Comet/week wrap and Starforge arrival alignment | tests/test_motion.mjs |
| GIF | Exactly 16 s encoded duration, repeated-tail handling, visible motion, dimensions and size | tests/test_gif.py |
| Browser | All controls, pause, compare, focus/inspector, no errors, mobile/desktop overflow | tests/browser_smoke.py |
| CI | Node + Python regression and optional browser smoke | .github/workflows/tests.yml |
| Asset regeneration | Six night/paper GIFs and encoder regression | .github/workflows/generate-gifs.yml |

## Commands

~~~powershell
node --test tests/test_engine.mjs tests/test_motion.mjs
py -3 -m unittest tests/test_gif.py -v

# Chromium optional on a workstation
py -3 -m pip install pillow playwright
py -3 -m playwright install chromium
py -3 tests/browser_smoke.py
py -3 export_gif.py

# Regenerate SVGs
node export.mjs
node export.mjs --input fixtures/streak-demo.json --out assets/stress --label "SYNTHETIC STREAK STRESS TEST"
~~~

## Merged quality gate: planned production readiness

Pass all unit checks plus:
- No GitHub Actions failure from missing dependencies, network calls or permissions.
- All 24 committed SVGs parse and 12 animated SVG variants are distinguishable from their still counterparts.
- All six GIFs exist in the standalone repository, have actual 16,000-ms loops, show visible motion and remain within acceptable size.
- Human visual inspection at approximately 700 px README width and a narrow mobile viewport; ensure calendar legibility and clear legend.
- GitHub-hosted image playback observed on the actual repository README, not merely inferred from local browser success.
- Explicit labels that current demo fixtures are synthetic and mixed event units are not official contributions.
- No hardcoded API token, private data, external network runtime dependency or HTML/SVG injection.
- Migration code paths are correct from a **fresh standalone clone**, not from the Studio monorepo.

## Additional tests needed for the next milestones

An official GraphQL collector must have offline tests for login mismatch, invalid token, GraphQL errors, rate-limit, timeout, non-negative daily counts, missing/duplicate dates, calendar-year boundaries, leap years, completeness, private contribution visibility and safe log redaction.

The public GitHub Action must have workflow tests for explicit inputs, least-privilege token, forks/PR security, file path validation, refusal to overwrite on failed fetch, deterministic output, safe commit-if-changed semantics, no workflow loop, and manual re-run.

## Status policy

Do not label a result 'passed' unless actually executed. Treat GitHub-hosted visual playback as **unverified** until independently inspected. Tests and workflows are part of this repository, but their success must be checked per commit. Record non-passing and skipped cases in the associated PR.
