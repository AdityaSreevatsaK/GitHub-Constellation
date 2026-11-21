# AI agent instructions: GitHub Constellation

This file is the mandatory entry point for AI coding agents. It describes durable project rules, not a substitute for inspecting the live repository. The code, tests, workflows and current Git state take precedence over old summaries or stale documentation.

## 1. Mandatory repository-state inspection

Before any substantial task, establish what is true **now**. Do not start from a previous chat summary, an old roadmap milestone or an assumed branch state.

1. Confirm repository root, remotes, default branch and current branch:
   ~~~powershell
   git rev-parse --show-toplevel
   git remote -v
   git branch --show-current
   git branch -vv
   ~~~
2. Inspect all local work before touching files:
   ~~~powershell
   git status --short --branch
   git diff --stat
   git diff
   git diff --cached --stat
   git diff --cached
   git ls-files --others --exclude-standard
   ~~~
   Treat pre-existing modifications and untracked files as user-owned. Preserve them. Never use reset, clean, checkout or force operations to make the tree look tidy.
3. Refresh and compare remote history when network access is available:
   ~~~powershell
   git fetch origin --prune
   git log -8 --oneline --decorate
   git log -8 --stat
   git diff --stat origin/master...HEAD
   git show --stat --oneline HEAD
   ~~~
   The comparison above assumes the current default branch is master. If GitHub reports a different default branch, substitute its actual remote ref. If fetch is unavailable, state that limitation and use the latest accessible GitHub branch, commit and Actions data. Do not claim to have inspected a local working tree when you have not.
4. Inspect the current tree, source files and matching tests for the requested change. Check recent commits and generated assets, not just filenames.
5. Inspect current GitHub state where relevant: open and recently merged PRs, issues, branch heads, releases/tags, workflow definitions and the latest successful and failed Actions runs. A workflow existing in the tree does not prove it is enabled or passing.
6. Read the relevant project documents below, then reconcile every material statement with code, tests, workflow configuration and recent Git history.
7. Before implementation, classify the affected capability as **implemented**, **partially implemented**, **planned**, or **deprecated**. Cite the exact source/test/workflow evidence in your reasoning and report. Update stale documentation rather than extending it.

When evidence conflicts, use this order: current source and executable configuration; tests and recent successful workflow evidence; current Git history; project documentation; old discussions and AI summaries. Historical context explains decisions but cannot prove current behaviour.

## 2. Required reading order

Read the root instructions, then the documents relevant to the task:

1. docs/ARCHITECTURE.md
2. docs/DATA_CONTRACT.md and docs/DATA_SOURCES.md
3. docs/DEVELOPMENT.md and docs/TESTING.md
4. docs/ROADMAP.md
5. README.md and docs/PROFILE_INSTALLATION.md when touching user-facing usage or the Action
6. docs/MIGRATION.md for historical decisions only
7. Exact source files, workflow files and tests being changed

Do not use the superseded docs/AGENT_WORKPLAN.md as a task backlog. The current backlog is docs/ROADMAP.md.

## 3. Product vision and non-negotiable design rules

Create an original, polished, recognisable GitHub contribution calendar that can be embedded in a GitHub profile. The 53-column by seven-row calendar is the primary subject, not a decorative starfield or unrelated dashboard. Every highlighted day must map to a dated source record. A viewer should recognise the calendar quickly at normal README width.

Three approved visual designs must remain genuinely distinct:

1. **Comet Streaks:** one star per active day; a comet travels only across truly consecutive active dates. Singletons remain stars. Missing dates break trails. Saturday/Sunday adjacency must not become a misleading diagonal.
2. **Celestial Cartographer:** a small observatory outside the calendar sweeps left to right, revealing only source-backed days. It must not obscure the calendar.
3. **Starforge:** bounded sparks travel from a small forge to their actual active-day cells. Several events on one date still create one calendar star.

Keep night and paper themes, 16-second motion, a useful final frame, accessible labels, keyboard focus, responsive mobile behaviour and a static SVG alternative. Never invent, move or multiply contribution days for visual effect.

## 4. Data integrity and privacy

There are two separate input contracts. Never mix their semantics:

- **Contract v1, event samples:** recorded events with mixed activity units. The checked-in fixtures are synthetic. They must be labelled as such. A blank date means no event in that sample, not a verified zero GitHub contribution.
- **Contract v2, official calendar:** GitHub GraphQL contribution-calendar days and API-visible contribution counts/intensity. It is not a list of commits or repositories. Preserve the API date, count, level and visibility caveat.

No fake personal contributions. Do not convert a daily count into fictitious commits, pull requests or repositories. Do not describe mixed event units as official contribution totals. A successful API query proves only what that token and GitHub's visibility settings expose. Never claim private contributions are included unless the actual token and settings justify it.

Never commit tokens, raw authenticated responses, private repository names or unnecessary personal history. Do not expose credentials in command output, logs, SVGs, browser code or README metadata. A failed or incomplete official collection must fail closed and must not replace known-good public assets with synthetic or partial data.

## 5. Current implementation map

| Path | Responsibility and current scope |
|---|---|
| engine.mjs | Shared 371-cell model, strict parsers for v1 and v2, streak logic and all three SVG renderers |
| official_calendar.mjs | Read-only GitHub GraphQL collection, two date windows, identity/date/weekday/count/level/completeness validation |
| collect-contributions.mjs | CLI using GH_TOKEN or GITHUB_TOKEN; writes a local v2 snapshot |
| export.mjs | Offline SVG CLI for v1 or v2; design and theme selection |
| export_gif.py | Optional Playwright/Chromium frame capture and Pillow GIF encoding; exact 16-second loop validation |
| preview.html | Interactive local gallery for the two synthetic v1 fixtures only; it does not fetch live GitHub data |
| validate-action.mjs and action.yml | Composite Action input validation, official collection, SVG output and optional GIF output |
| update_readme_stats.mjs | Replaces the marked README summary from a validated v2 snapshot |
| fixtures/ | Synthetic v1 demo and stress fixtures |
| assets/ | Synthetic SVG exports and stress GIFs |
| assets/real/AdityaSreevatsaK/ | Owner's API-visible official calendar SVG/GIF previews, refreshed by Actions |
| tests/ | Node unit tests, Python GIF tests and synthetic-gallery browser smoke |
| .github/workflows/tests.yml | CI regression, browser and SVG reproducibility checks |
| .github/workflows/generate-gifs.yml | Regenerates the six synthetic stress GIFs |
| .github/workflows/owner-calendar.yml | Owner-only scheduled collection, Action smoke, official assets and README summary refresh |
| docs/ | Architecture, data contracts, development, testing, roadmap and historical provenance |

There is no package.json or npm dependency installation. Core SVG generation uses Node built-ins. The browser gallery is synthetic-only. Real calendar rendering is through the collector, exporter and Action.

## 6. Verified capability boundaries

Use these as the current baseline, then re-check them before relying on them:

| Capability | State | Boundary |
|---|---|---|
| Three designs and two themes | Implemented | Shared date positions and distinct mechanics |
| Synthetic event renderer and browser gallery | Implemented | Preview gallery loads synthetic fixtures only |
| Official GitHub GraphQL calendar collector | Implemented | Two requests, 20-second timeout per request, fails closed; no automatic retry/backoff |
| Official calendar SVG/GIF exports | Implemented | Source-backed owner previews are committed; GitHub image-proxy playback is not visually confirmed |
| Composite GitHub Action | Implemented | Smoke-tested in this repository; no stable release tag |
| Owner scheduled refresh | Implemented | Updates only this repository's public assets and marked README summary |
| Installation in the owner's profile repository | Not implemented | Must remain a separate, explicit decision |
| Licence and versioned public release | Not selected | Do not assume reuse rights or publish a release |
| Private contribution completeness | Not guaranteed | Depends on GitHub visibility and token authorisation |

The latest account totals are intentionally maintained in the README by automation. Do not copy a changing total into these instructions.

## 7. Development and quality gates

Supported local baseline: Node.js 20+ and Python 3.11+. CI and the composite Action use Node.js 22 and Python 3.11. No npm install is required.

Run the complete offline regression suite:

~~~powershell
node --test tests/test_engine.mjs tests/test_motion.mjs tests/test_official.mjs tests/test_action.mjs tests/test_readme.mjs

# Optional Python/browser dependencies, installed once per environment
py -3 -m pip install pillow playwright
py -3 -m playwright install chromium
py -3 -m unittest tests/test_gif.py -v
py -3 tests/browser_smoke.py
~~~

Regenerate deterministic synthetic SVGs:

~~~powershell
node export.mjs
node export.mjs --input fixtures/streak-demo.json --out assets/stress --label "SYNTHETIC STREAK STRESS TEST"
~~~

Optional GIF export requires Pillow, Playwright and installed Chromium:

~~~powershell
py -3 -m pip install pillow playwright
py -3 -m playwright install chromium
py -3 export_gif.py
~~~

For a local official calendar, supply a token only through the environment:

~~~powershell
$env:GH_TOKEN = "YOUR_TOKEN"
node collect-contributions.mjs --username YOUR_GITHUB_USERNAME --out local-output/official.json
node export.mjs --input local-output/official.json --out local-output/images --design all --theme both
py -3 export_gif.py --source local-output/images --out local-output/images
Remove-Item Env:GH_TOKEN
~~~

Keep local-output ignored. Never commit the snapshot or token. See docs/DEVELOPMENT.md and docs/TESTING.md for complete commands and workflow details.

## 8. Change control

- Use a descriptive feature branch for substantial changes. The CI push filter includes feature/**; pull requests also run CI.
- Keep changes focused and preserve the user's existing working tree.
- Update tests and generated outputs whenever source changes require them.
- Update the relevant docs in the same change. Do not duplicate the same roadmap in several files.
- Do not merge PRs, force-push, publish tags/releases, change repository settings or modify the owner's separate GitHub profile unless explicitly requested.
- Do not claim a workflow, action or visual behaviour is verified from its YAML alone. Check the actual run and relevant logs.
- Never use a synthetic fixture as a fallback for a failed live collection.
- Do not add external trackers, remote fonts, paid APIs or runtime CDN dependencies without explicit approval.

## 9. Completion standard

A substantial change is complete only when the implementation, tests, generated assets and documentation agree. Report the branch and commit/PR, exact files changed, commands and actual outcomes, data provenance, any skipped checks, and remaining limitations. Separate what was executed locally from what passed in GitHub Actions. Do not claim GitHub-hosted image playback was verified without inspecting the actual rendered README.
