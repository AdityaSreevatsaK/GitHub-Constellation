# Developer guide (Windows-first)

## Prerequisites and environment

- Git and Node.js **20+**; Node 22 is suitable.
- Python **3.11+**, preferably 3.11 or 3.12.
- A modern browser. No Node package install and no paid API are needed for SVG generation.
- For optional GIF/interactive browser automation only: Pillow, Playwright and Playwright Chromium.
- Windows PowerShell is the reference shell. Linux CI uses the equivalent commands.

From a clean clone:

~~~powershell
git clone https://github.com/AdityaSreevatsaK/GitHub-Constellation.git
Set-Location GitHub-Constellation
node --version
py -3 --version
~~~

Do not add API keys to source files or generated SVG assets. An official collector, when implemented, must use a secret environment variable or Actions secrets.

## Fast development loop

~~~powershell
# Pure Node regression tests, no dependencies
node --test tests/test_engine.mjs tests/test_motion.mjs tests/test_official.mjs tests/test_action.mjs

# Regenerate deterministic fixture outputs
node export.mjs
node export.mjs --input fixtures/streak-demo.json --out assets/stress --label "SYNTHETIC STREAK STRESS TEST"

# Launch browser preview (stop with Ctrl+C)
py -3 -m http.server 8000
~~~

Open http://localhost:8000/preview.html. Select design, theme or dataset, pause animation, compare all three, hover/focus a day-star. The browser must not overflow at 390 px wide, even if the calendar panel scrolls.

## GIF toolchain (optional locally, automated in workflow)

~~~powershell
py -3 -m pip install pillow playwright
py -3 -m playwright install chromium

# All six stress-demo GIFs (three designs by two themes)
py -3 export_gif.py

# One specific output
py -3 export_gif.py --design comet --theme night --fps 2 --width 720

# Encoder and live-browser regression
py -3 -m unittest tests/test_gif.py -v
py -3 tests/browser_smoke.py
~~~

GIF timing is tested against an actual decoded 16,000 ms loop. Repeated trailing frames must be coalesced with **duration retained**, not dropped early. Check visible frame changes and file size. Do not commit enormous intermediary screenshots.

The complete SVG archive contains 24 files: six still + six animated for each of the two fixtures. SVGs are **1200 x 390**. Normal GIFs are **720 x 234** and loop for 16 seconds. Static SVGs always remain the primary fallback.

## Export CLI details

- node export.mjs: ten-event fixture, outputs to assets/.
- node export.mjs --input PATH: override fixture. Source should remain contract v1.
- node export.mjs --out DIR: output directory.
- node export.mjs --label TEXT: explicit provenance label.
- node export.mjs --help: supported options.

Stable input and options must yield byte-identical SVG outputs; after code changes, regenerate and inspect affected assets. Never edit exported art manually while leaving source renderer unchanged.

## Test-first changes

When changing calendar logic:
1. Add failing tests to tests/test_engine.mjs for the exact source/date edge case.
2. Update engine.mjs; preserve both themes and all designs.
3. Regenerate SVGs and compare final positions.
4. Run Node and Python unit tests, browser smoke and GIF export.
5. Check normal GitHub profile width and mobile width.

When changing animation:
1. Add motion timing assertions in tests/test_motion.mjs.
2. Keep final still unchanged unless there is an intentional documented visual redesign.
3. Re-export both static and animated variants and GIFs.
4. Check both themes, an isolated date, a long streak and a week wrap.

When adding the official collector:
1. Create a **new versioned contract** and offline fixtures, separate from event contract v1.
2. Make token handling, scope and completeness checks testable without network.
3. Verify actual GitHub GraphQL contribution calendar and its date semantics.
4. Integrate carefully with current calendar model; preserve event-sample demos.
5. Only then generate an asset with real activity, labelled accurately.

## CI and source control

Validation: .github/workflows/tests.yml. Regenerating committed preview GIFs: .github/workflows/generate-gifs.yml. The preview workflow attempts to commit only generated GIFs, using scoped contents:write permission; a repo policy may block that, in which case read its Action logs and report the constraint.

Use feature branches for substantial changes. The repository's master branch holds the initial standalone migration and is not automatically installed in the owner's GitHub profile. Avoid editing other repositories, modifying repository settings, tagging releases or merging PRs without approval.

## Troubleshooting

- **Cannot import module**: serve preview.html via an HTTP server, not file://.
- **No comets in ten-event fixture**: expected. Its dates are isolated, so a truthful renderer shows zero streaks.
- **GIFs missing in a fresh checkout**: use export_gif.py, or inspect the preview-generation Actions workflow.
- **Pillow/Playwright unavailable**: SVG export and Node tests still work. The Python GIF encoder and browser smoke checks require optional dependencies.
- **Windows Playwright browser install fails**: run py -3 -m playwright install chromium and verify browser cache; no WSL is required.
- **GitHub SVG animation appears static**: GitHub image proxy may suppress SVG motion. Use native GIF and static SVG fallback.
- **Synthetic labels**: do not remove them to make the image appear personalised. Implement the official collector instead.

## Real GitHub calendar and consumer Action

See docs/PROFILE_INSTALLATION.md for a full consumer workflow. For the read-only CLI, set GH_TOKEN locally, run node collect-contributions.mjs --username USER --out local-output/official.json, then node export.mjs --input local-output/official.json --out local-output/images --design all --theme both. Run py -3 export_gif.py --source local-output/images --out local-output/images for six GIFs. Keep local-output ignored. Never put secrets or raw account snapshots in source control. Scheduled updates in this repository begin after approved merge; installing into the owner's profile is a separate explicit decision.
