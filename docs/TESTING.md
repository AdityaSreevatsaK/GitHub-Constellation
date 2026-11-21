# Testing and verification

## Current automated test matrix

| Suite | Coverage | Command / evidence |
|---|---|---|
| tests/test_engine.mjs | v1/v2 parsing, 371 cells, date boundaries, validation, deduplication, intensity, deterministic SVG | Node test runner |
| tests/test_motion.mjs | Comet adjacency/week wrap, Cartographer/Starforge distinction, timing and final stills | Node test runner |
| tests/test_official.mjs | GraphQL windows, completeness, identity, dates, weekday, count/level validation, failures and API snapshot behaviour | Node test runner |
| tests/test_action.mjs | Invalid username/design/theme and unsafe workspace output paths | Node test runner |
| tests/test_readme.mjs | Official-only README summary, timestamp/count derivation and marker safety | Node test runner |
| tests/test_gif.py | Exact 16-second loop, malformed frames, coalesced trailing frames, dimensions and visible motion | Python unittest |
| tests/browser_smoke.py | Synthetic gallery at 390px and 1280px, designs/themes, compare, pause, keyboard focus and overflow | Playwright Chromium |

Run all suites:

~~~powershell
node --test tests/test_engine.mjs tests/test_motion.mjs tests/test_official.mjs tests/test_action.mjs tests/test_readme.mjs
py -3 -m unittest tests/test_gif.py -v
py -3 tests/browser_smoke.py
~~~

The Node suite is dependency-free. Python GIF tests require Pillow for the GIF-specific cases. Browser smoke requires Playwright and Chromium. In CI, the workflow uses Node 22 and Python 3.11, installs Pillow/Playwright and selects runner Chrome or installs Chromium.

## Export reproducibility

~~~powershell
node export.mjs
node export.mjs --input fixtures/streak-demo.json --out assets/stress --label "SYNTHETIC STREAK STRESS TEST"
git diff --exit-code -- assets/
~~~

The CI archive check parses 24 synthetic SVGs and, when present, twelve official owner SVGs. It regenerates synthetic exports and verifies no tracked asset changes. The owner workflow separately checks the official SVG source marker and all six official GIFs for 720x234 dimensions, multiple frames and exactly 16,000ms total duration.

## Verified workflow evidence

- Quality gate [run 44329856067](https://github.com/AdityaSreevatsaK/GitHub-Constellation/actions/runs/44329856067) passed on 18 November 2026: 42/42 Node tests, 5/5 Python tests, Chromium desktop/mobile smoke and 24 synthetic plus 12 official SVG validation.
- Latest scheduled owner refresh at this audit, [run 44892083199](https://github.com/AdityaSreevatsaK/GitHub-Constellation/actions/runs/44892083199), completed successfully on 21 November 2026. It collected official data, exercised the composite Action, rendered and validated all official assets, refreshed README statistics and committed the outputs.
- Earlier scheduled refreshes [run 44717177984](https://github.com/AdityaSreevatsaK/GitHub-Constellation/actions/runs/44717177984) and [run 44506254424](https://github.com/AdityaSreevatsaK/GitHub-Constellation/actions/runs/44506254424) also succeeded.

These are point-in-time results. Always inspect the latest run for the current commit before reporting CI status. Bot-generated refresh commits do not necessarily trigger other workflows. Early migration runs failed because a recursive asset glob mixed official SVGs into the synthetic count; the workflow now checks the 24 synthetic and twelve official SVGs separately. See docs/MIGRATION.md for the failure links and correction.

## What these tests do not prove

- The browser smoke is an offline synthetic gallery test. It does not verify the actual GitHub README rendering or image proxy.
- The official collector is unit-tested with offline response fixtures. The owner workflow provides a real API integration smoke for the configured owner and token, not a universal account/permission test.
- The composite Action is exercised in this repository. A clean external consumer repository and private-contribution visibility across different token types remain unverified.
- A successful GIF decode and 16-second duration do not prove GitHub's image proxy displays animation. Human visual inspection on the actual README is still required.

Never report skipped or unexecuted checks as passed. Distinguish unit tests, browser smoke, real API workflow integration and manual GitHub visual review.
