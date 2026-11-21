# Developer guide

## Prerequisites

- Local core development: Node.js 20+.
- CI and composite Action: Node.js 22.
- GIF and browser checks: Python 3.11+, Pillow, Playwright and Chromium.
- Windows PowerShell is the documented local shell. CI runs on GitHub-hosted Ubuntu.
- No package.json, npm install, build system or paid API is required for offline SVG work.

Clone and inspect:

~~~powershell
git clone https://github.com/AdityaSreevatsaK/GitHub-Constellation.git
Set-Location GitHub-Constellation
node --version
py -3 --version
git status --short --branch
~~~

## Fast regression loop

The Node suite has no dependencies. Install the optional Python tools once before running GIF tests or browser smoke:

~~~powershell
py -3 -m pip install pillow playwright
py -3 -m playwright install chromium
~~~

Then run the regression suites:

~~~powershell
node --test tests/test_engine.mjs tests/test_motion.mjs tests/test_official.mjs tests/test_action.mjs tests/test_readme.mjs
py -3 -m unittest tests/test_gif.py -v
py -3 tests/browser_smoke.py
~~~

The browser smoke uses Chromium at 390px and 1280px widths. It exercises the synthetic gallery, all designs, themes, compare mode, pause, keyboard focus and horizontal overflow. It does not test a live GitHub README or live official-data preview.

## Synthetic SVG and GIF exports

~~~powershell
node export.mjs
node export.mjs --input fixtures/streak-demo.json --out assets/stress --label "SYNTHETIC STREAK STRESS TEST"

py -3 -m pip install pillow playwright
py -3 -m playwright install chromium
py -3 export_gif.py
py -3 -m unittest tests/test_gif.py -v
~~~

The first export writes twelve SVGs for the ten-event fixture to assets/. The second writes twelve SVGs for the stress fixture to assets/stress/. The GIF exporter reads the animated SVGs in assets/stress/ by default and creates six GIFs, three designs by two themes. GIFs default to 720 by 234 pixels, two frames per second and 16 seconds. The SVG viewBox is 1200 by 390.

The GIF CLI also accepts --source, --out, --fps (2 to 12), --width (480 to 1200), --design and --theme. It uses Chromium to capture frames and Pillow to encode and validate exact loop duration and visible motion.

## Collect and render official GitHub data

The collector has a required username and output path. Its optional --as-of date defaults to the current UTC date. It does not accept arbitrary from/to windows.

~~~powershell
$env:GH_TOKEN = "YOUR_TOKEN"
node collect-contributions.mjs --username YOUR_GITHUB_USERNAME --out local-output/official.json
node export.mjs --input local-output/official.json --out local-output/images --design all --theme both
py -3 export_gif.py --source local-output/images --out local-output/images
Remove-Item Env:GH_TOKEN
~~~

The CLI accepts GH_TOKEN or GITHUB_TOKEN. The token is read only by the trusted collector and is never written into the snapshot. Keep local-output/ ignored. Do not commit the snapshot. For SVG-only output, omit the GIF command.

The collector requests two windows, validates complete official date coverage and fails closed on API errors. It uses a 20-second timeout per request and currently has no retry/backoff. See DATA_CONTRACT.md and DATA_SOURCES.md before changing its schema or authentication.

## Interactive browser gallery

~~~powershell
py -3 -m http.server 8000
~~~

Open http://localhost:8000/preview.html. The gallery loads fixtures/demo-activity.json and fixtures/streak-demo.json only. It supports all designs, both themes, compare, pause and keyboard-readable day inspection. It does not display the owner account's real data.

## GitHub Action and workflows

action.yml is a composite Action with these inputs:

| Input | Default | Values |
|---|---|---|
| token | Required | Token passed through an environment variable |
| username | Calling repository owner | Valid GitHub login |
| design | comet | comet, cartographer, starforge, all |
| theme | night | night, paper, both |
| output-dir | constellation | Safe relative directory inside workspace |
| gif | true | true or false |

The Action collects official data, writes SVG outputs and optionally installs Python/Playwright/Chromium for GIFs. It does not commit or push files. The calling workflow is responsible for publication.

Workflows:

- tests.yml: Node 22, Python 3.11, all five Node test files, Python GIF tests, browser smoke and deterministic SVG archive checks.
- generate-gifs.yml: rebuilds six synthetic stress GIFs on relevant master changes or manual dispatch.
- owner-calendar.yml: daily at 02:23 UTC, manual dispatch and selected source pushes; refreshes the owner's assets and README summary in this repository only.

Generated workflow commits use GITHUB_TOKEN and may not trigger other workflows. Check Actions history and logs rather than assuming downstream jobs ran. The quality-gate workflow prefers preinstalled runner Chrome when available, passes its path through CONSTELLATION_CHROMIUM, and falls back to Playwright's Chromium install. Both tests/browser_smoke.py and export_gif.py honour that executable override.

## Change discipline

1. Inspect Git status, branch, recent commits and current remote head before editing.
2. Read relevant docs, source and tests. Establish implemented/partial/planned/deprecated status from evidence.
3. Add or update tests with behaviour changes.
4. Regenerate only the affected assets from source.
5. Run the complete relevant test suite.
6. Update architecture, data and roadmap docs in the same PR.
7. Inspect README links and generated asset inventory.
8. Preserve local changes and never merge or publish a release without explicit approval.

## Troubleshooting

- Browser module import errors: serve preview.html over localhost, not file://.
- No comets in the ten-event fixture: expected; its dates are isolated.
- No API data: verify GH_TOKEN/GITHUB_TOKEN is set and can access GitHub GraphQL.
- Incomplete calendar or GraphQL error: collection fails closed; do not substitute synthetic data.
- Rate limit or transient network failure: current collector does not retry; rerun after checking GitHub status and token limits.
- Missing GIFs: install Pillow, Playwright and Chromium, then run export_gif.py.
- GIF appears static on GitHub: proxy playback has not been independently confirmed. Use the native GIF and provide a still SVG fallback.
