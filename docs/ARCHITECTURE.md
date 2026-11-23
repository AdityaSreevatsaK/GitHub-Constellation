# Architecture and engineering invariants

## System overview

GitHub Constellation has two independent data paths that share one calendar model and three renderers:

~~~text
Synthetic v1 fixtures
    -> engine.mjs
    -> preview.html interactive gallery
    -> deterministic SVG exports
    -> optional Playwright + Pillow GIF exports

Authenticated GitHub GraphQL
    -> official_calendar.mjs
    -> validated v2 official-calendar snapshot
    -> engine.mjs
    -> SVG exports
    -> optional 16-second GIF exports
    -> reusable composite Action or owner-calendar workflow
         -> public preview assets + README summary
~~~

The offline renderer needs no token or network. The official collector requires an authenticated GraphQL request. The interactive preview page currently loads only the two synthetic v1 fixtures. It is not a live-data dashboard.

## Source layout

| Path | Responsibility |
|---|---|
| engine.mjs | Parses both input contracts, maps dates to 371 cells, derives active days/streaks, renders the three SVG designs |
| official_calendar.mjs | GraphQL query, two-window collection, response validation and v2 snapshot normalisation |
| collect-contributions.mjs | Secure-environment CLI for official data; writes a local snapshot |
| export.mjs | Deterministic offline SVG exporter |
| export_gif.py | Captures SVG animation frames in Chromium and encodes a native GIF with Pillow |
| preview.html | Interactive synthetic-fixture gallery, comparison, pause and keyboard inspector |
| validate-action.mjs | Validates Action identity, design, theme and workspace-relative output path |
| action.yml | Composite Action that collects official data and exports SVG plus optional GIF |
| update_readme_stats.mjs | Updates one marked README summary using a validated official snapshot |
| fixtures/ | Synthetic contract-v1 inputs |
| assets/ | Synthetic still/animated SVGs and stress GIFs |
| assets/real/AdityaSreevatsaK/ | Public owner preview assets from API-visible official data |
| tests/ | Node, Python and Chromium smoke tests |
| .github/workflows/ | CI, synthetic GIF generation and owner-only refresh |

There is no package.json, lockfile or npm dependency tree. Core JavaScript uses Node built-ins. The optional Python pipeline uses Pillow and Playwright with Chromium.

## Data contracts and shared model

The engine dispatches by schema version:

- Contract v1: event-sample data, aggregated into mixed recorded activity units. The synthetic fixtures use this path.
- Contract v2: official GitHub contribution-calendar data, with daily contribution counts and GitHub-defined contribution levels.

Both are converted to a shared 53-column by seven-row Sunday-first model (371 cells). A source date maps to the same cell in every design and theme. One active date creates one calendar star regardless of event count. Streaks are based on adjacent dates, not visual proximity.

Contract-v1 intensity uses mixed activity-unit bands: 1, 2-3, 4-6 and 7+. Official data uses the GitHub contribution-level quartiles and a separate official legend. Never mix the two legends or metrics.

For v2, the collector treats the GraphQL date as canonical, checks weekday/date agreement and requires a complete contiguous range. The range starts on the Sunday 52 weeks before the week containing the as-of date and ends on that date. The resulting snapshot contains 365 to 371 dates, with the remaining grid cells marked as future.

## Rendering designs

- **Comet Streaks:** only consecutive active dates are joined by motion. Isolated days remain stars. Weekend adjacency is handled without a false diagonal.
- **Celestial Cartographer:** an observatory and scanning beam reveal recorded days chronologically; the calendar remains visible.
- **Starforge:** bounded particles travel from the forge to true active-day cells. Particle count is capped for dense calendars, but every active date remains visible.

SVG output is self-contained and uses a 1200 by 390 viewBox. Native GIF output defaults to 720 by 234, two frames per second and a 16-second loop. The GIF encoder coalesces identical frames while retaining their durations, then verifies encoded duration and visible motion.

## Official collection and automation

official_calendar.mjs sends two sequential GraphQL requests to api.github.com/graphql. The first covers 14 days and the second covers the remainder of the 53-week calendar window, keeping each request below a one-year range. Each request has a 20-second timeout. The collector validates returned login, ISO dates, weekday, non-negative integer counts, contribution-level consistency, duplicates and complete coverage. Missing or malformed days fail closed. There is no retry or rate-limit backoff implementation yet.

collect-contributions.mjs reads GH_TOKEN or GITHUB_TOKEN from the environment. It writes the v2 snapshot to a local path, normally local-output/, which is ignored by Git. The token and raw snapshot are not committed.

action.yml validates the username, design, theme and relative output path before collection. It writes only within the checked-out workspace, exports static and animated SVGs, and optionally installs Python 3.11, Pillow, Playwright and Chromium to create GIFs. It does not commit or push output. The calling workflow owns publication and requires contents: write only if it wants to commit assets.

The owner-calendar workflow is guarded to this repository. It runs on a daily UTC schedule, manual dispatch and selected master-branch source changes. It collects the owner's API-visible calendar, exercises the local composite Action, validates twelve SVGs and six 16-second GIFs, refreshes the marked README summary, and commits only the public preview assets and README. It does not modify the separate profile repository or commit the raw snapshot.

update_readme_stats.mjs accepts only a valid v2 snapshot and exactly one ordered marker pair. It derives counts from the same daily data used for rendering. It never writes the raw calendar payload to README.

## Workflows

| Workflow | Trigger | Purpose |
|---|---|---|
| tests.yml | master/feature branch pushes, pull requests, manual | 42 Node checks, five Python GIF tests, synthetic gallery browser smoke and SVG reproducibility |
| generate-gifs.yml | relevant master changes or manual | Regenerate six synthetic stress GIFs |
| owner-calendar.yml | daily schedule, manual, selected master source changes | Refresh owner official assets and README totals |

The exact latest run status must be checked in GitHub Actions before reporting it. Workflow YAML is not evidence of successful execution.

## Security boundaries

- Tokens exist only in Action environment variables or local shell environment.
- No raw official snapshot or private repository names are published.
- The owner workflow has contents: write because it commits public assets to this repository. The composite Action itself does not push.
- Action output paths are relative, checked against workspace traversal and symlinks.
- SVG/HTML labels and links are escaped or validated by the renderer.
- GitHub documents that private/internal contributions require the optional read:user scope and the account's private-contribution visibility setting. The owner workflow uses repository GITHUB_TOKEN, not a user-authorised token with that scope, so its output must be treated as public/API-visible. The collector does not currently query hasAnyRestrictedContributions and cannot detect omitted private activity. Do not overstate completeness.

## Known limitations

1. GitHub image proxy playback of the embedded GIFs has not been independently inspected in the live README. Native GIF files and durations are validated; static SVGs remain available.
2. The owner Action and workflow are tested in this repository. A clean external consumer repository and multiple account/token configurations still need end-to-end acceptance.
3. The collector times out and fails closed but does not retry or back off on rate limits or transient network failures.
4. The browser gallery is synthetic-only. Real account previews are generated through the CLI/Action pipeline.
5. No licence or versioned Action release has been selected. A public repository is not automatically an open-source licence.
