# Implementation roadmap for AI agents

**Status at migration, 18 November 2026:** the three visual engines, 24 SVG exports, synthetic fixtures and offline unit/browser test code were copied from Studio concept/constellation at be7f524. Six GIF binaries could not be directly transferred as Git objects across repositories; they were successfully regenerated and committed in standalone GitHub Actions run 44268515679. Standalone quality gates **passed** at commit ba81f083 ([Actions run 44269551217](https://github.com/AdityaSreevatsaK/GitHub-Constellation/actions/runs/44269551217)): 28 Node tests, five Python GIF tests, desktop/mobile Chromium smoke and deterministic 24-SVG verification. All six GIFs exist; only independent human observation of GitHub-hosted image playback remains outstanding.

## Current development progress (18 November 2026)

- **P1 implemented and exercised:** official GraphQL collector (two date-scoped requests) validates every visible day, user identity and per-day counts/intensity without creating fake events.
- **Real owner preview succeeded:** first real API-visible image run confirmed 1,803 contributions across 99 active dates and 16 consecutive-day runs as at 18 November 2026. Six animated GIFs and twelve SVGs committed only to the feature branch. Live image-proxy playback still awaits human inspection.
- **P2 code implemented, not merged:** reusable composite Action, strict output-path handling and owner preview workflow. A separate real-account smoke step successfully invoked the composite Action with GIF rendering disabled. Scheduling activates only after the workflow is merged to master; the owner's actual profile remains untouched.
- **Review boundary:** development is isolated on feature/official-calendar-and-automation and draft PR #1, with no profile installation, release or licence change.


## P0. Establish independent repository and migration parity

**Goal:** fully runnable, reproducible, visually complete standalone Constellation. **Engineering migration verified** by successful standalone Actions (18 November 2026); human playback review remains outstanding.

Deliverables:
- Root engine.mjs, export.mjs, export_gif.py, preview.html and all modern tests.
- Local demo and stress fixtures, eliminating references to the old shared/ path.
- 24 deterministic SVG assets.
- Six GitHub-compatible synthetic GIFs, 16 sec each, both themes.
- Comprehensive README, AGENTS.md and architecture/data/development/quality/migration docs.
- GitHub test CI plus separate GIF-preview workflow.
- Verify local/CI tests and actual GitHub README playback.
- Studio PR #1 was linked to this standalone repository and closed as superseded without merging on 18 November 2026; original source branch/history are preserved.

**Pass:** fresh clone succeeds; Node tests 28/28, Python GIF tests 5/5, browser smoke at desktop and mobile, and all expected assets exist with correct links. **Blocked:** GitHub Actions cannot commit GIFs, missing files or unverified live playback.

## P1. Official GitHub contribution-calendar collector, starting with AdityaSreevatsaK

**Implementation and real-account collection verified on feature branch. Keep the next tests, provenance and consumer integration honest.**

Implementation plan:
1. Verify the live GitHub GraphQL schema and API limits for user(login) and contributionsCollection.contributionCalendar, date-window options, permissions, hidden/private contribution semantics and calendar boundaries.
2. Implement a **read-only CLI** that accepts a username and a date window; secrets only in environment variables. Do not require a token for offline rendering/testing.
3. Introduce an explicit **official-calendar schema**, distinct from contract v1, with documented source provenance, selected account, fetch timestamp, date range, days and daily counts.
4. Create schema validation and offline normalisation fixtures; ensure duplicate dates, gaps and invalid counts are rejected or clearly reported.
5. Adapt the shared calendar model to official daily contribution counts without invented repository events; preserve both kinds of sources.
6. Extend all three designs to render official units with truthful intensity and legend.
7. Generate a personalised still and animated output for AdityaSreevatsaK after successful complete collection.
8. Explain if count visibility is incomplete and never mix public vs private contributions ambiguously.

**Pass:** output positions/counts match a verified GraphQL response for the intended account; no synthetic data is presented as real; all designs/theme combinations pass tests.

## P2. Public reusable action and profile automation

**Goal:** any GitHub user can install the action and display chosen animation in their README. **Composite Action and example consumer workflow implemented; no automatic live profile installation.**

Requirements:
- Action inputs: username, design, theme, date range, output directory, file format and explicit privacy behaviour.
- Reproducible Node/ Python environment with cache and rate-limit management.
- Minimum permissions: separate read-only collector token and narrowly scoped write permission where an output commit is required.
- Manual workflow_dispatch and documented daily schedule for consumers, with concurrency protection and commit-if-changed.
- No leaked secrets in logs or generated images; no automatic modifications to the owner's live profile without explicit approval.
- Clear example README embed instructions and error recovery on a clean repository.

**Pass:** fork-safe CI, no paid dependencies, verified daily/action/manual runs, authentic official contributions and documented reusable installation.

## P3. Visual polish, customisation and accessibility

- Compare at full size and actual GitHub README width in light and dark mode.
- Improve distinction between low/high daily contribution counts on the final official data.
- Refine art, tasteful movement, visual identity, static finale and animation pacing without hiding the chart.
- Add option validation and reasonable customisation without making the project overly complex.
- Retain meaningful reduced-motion and mobile accessibility; run visual/perceptual review.

**Pass:** each design unmistakably recognisable, distinct in mechanics, readable at profile size and source-faithful.

## P4. Public release readiness

- Owner selects licence; publish only after choice.
- Add contributor guidelines and security policy, issue/PR templates and compatible release/version policy.
- Produce concrete quick-start instructions and a maintainable test matrix.
- Check GitHub-hosted GIF playback and image size/refresh performance.
- Confirm privacy, token handling and provenance documentation.
- Release version only on explicit owner approval.

## Change process

Each AI agent must actually implement approved work, run relevant tests, export fixtures, commit code and update this roadmap. Prefer focused draft PRs, and do not merge or change master after the initial migration without authorisation. Never assume another session has completed a milestone without verifying current repository state.
