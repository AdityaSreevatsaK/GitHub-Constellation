# Migration provenance and decisions

## Origin

- Source repository: https://github.com/AdityaSreevatsaK/GitHub-Activity-Studio
- Source branch: concept/constellation
- Source commit: be7f524597285c2078565068ab23a683316404a2 (17 November 2026)
- Historical draft PR: https://github.com/AdityaSreevatsaK/GitHub-Activity-Studio/pull/1
- Destination repository: https://github.com/AdityaSreevatsaK/GitHub-Constellation
- Destination default branch: master
- Migration date: 18 November 2026

This is an intentional extraction of the **modern three-design Constellation implementation**, not a copy of unrelated Studio concepts and not a rewrite of its historical commits.

## Source to destination map

| Studio path | Standalone path | Reason |
|---|---|---|
| concepts/constellation/engine.mjs | engine.mjs | Core shared calendar model |
| concepts/constellation/export.mjs | export.mjs | Root-level CLI |
| concepts/constellation/export_gif.py | export_gif.py | Root-level optional GIF exporter |
| concepts/constellation/preview.html | preview.html | Root-level interactive gallery |
| concepts/constellation/tests/test_engine.mjs | tests/test_engine.mjs | Core unit tests |
| concepts/constellation/tests/test_motion.mjs | tests/test_motion.mjs | Motion tests |
| concepts/constellation/tests/test_gif.py | tests/test_gif.py | Timing/encoder tests |
| concepts/constellation/tests/browser_smoke.py | tests/browser_smoke.py | Offline browser smoke |
| concepts/constellation/fixtures/streak-demo.json | fixtures/streak-demo.json | Source-labelled synthetic stress fixture |
| shared/fixtures/demo-activity.json | fixtures/demo-activity.json | Copied ten-event fixture, no external monorepo dependency |
| concepts/constellation/assets/comet-*, cartographer-*, starforge-* | assets/ | 12 modern SVGs |
| concepts/constellation/assets/stress/comet-*, cartographer-*, starforge-* | assets/stress/ | 12 modern stress SVGs; GIFs regenerated |
| docs/DATA_CONTRACT.md | docs/DATA_CONTRACT.md | Preserved and updated event-sample contract |
| concepts/constellation/AGENTS.md, NEXT_ITERATION.md | AGENTS.md, docs/ROADMAP.md and other docs | Rewritten for standalone ownership and current priorities |

## Deliberately excluded

- Other Studio concepts: Code Factory, Open Source Metro, Developer World, Agent Swarm.
- Old experiments: constellation.py, calendar_sky.py, clustered/radial/calendar-atlas/calendar-trails assets, and their old Python tests. These remain in original Studio history; the current engine implements three approved designs instead.
- Studio root README, branch isolation policies, irrelevant shared files and unrelated prompts.

## Changes applied in extraction

- Fixed fixture-relative imports so export.mjs, preview.html, tests/test_engine.mjs and tests/browser_smoke.py run from the standalone root.
- Replaced legacy branch/PR-only agent instructions with a new root AGENTS.md and extensive documentation.
- Added dedicated GitHub Actions test and GIF generation workflows.
- Kept the synthetic fixture contents intact.
- Kept the renderer and existing test logic unchanged except for relocated imports/paths and gallery naming.

## Binary asset transfer limitation

GitHub Git blobs in the source repository cannot be referenced directly by a tree in a separate Git repository. The 24 UTF-8 SVG exports are copied directly. The six binary GIFs are regenerated from their committed SVG sources by the standalone .github/workflows/generate-gifs.yml workflow, which checks loop timing and commits the resulting outputs when Actions permissions allow.

Do not claim the six GIF files are present until they are confirmed in the new repository. If the workflow fails, inspect permissions/logs and execute the documented offline export before declaring migration parity.

## Old PR and source preservation

Keep the original Studio concept branch intact as auditable provenance. Do not merge old PR #1 into Studio master: there is no longer a reason to integrate independent Constellation into the umbrella repository. After migration parity is verified, link the new repository from PR #1 and close it as superseded, without deleting historical code or other concepts.

## Evidence and unresolved work

Source PR reported 28/28 Node and 5/5 Python tests, 16-second GIFs, and desktop/mobile Chromium smoke on original branch. These are **historical source results**, not automatic proof that the standalone migration runs. Verify the new repository CI and rendered README separately.

Production next steps: GitHub official contributions collection for the owner's actual account, secure reusable Action, daily updates, visual review and licence choice. See ROADMAP.md.
