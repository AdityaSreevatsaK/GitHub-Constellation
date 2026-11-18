# Implementation roadmap for AI agents

**Status at migration, 18 November 2026:** the three visual engines, 24 SVG exports, synthetic fixtures and offline unit/browser test code were copied from Studio concept/constellation at be7f524. Six GIF binaries cannot be directly transferred as Git objects across repositories and are to be regenerated in GitHub Actions. Do not mark migration complete until the generated GIFs and workflow status are independently verified.

## P0. Establish independent repository and migration parity

**Goal:** fully runnable, reproducible, visually complete standalone Constellation.

Deliverables:
- Root engine.mjs, export.mjs, export_gif.py, preview.html and all modern tests.
- Local demo and stress fixtures, eliminating references to the old shared/ path.
- 24 deterministic SVG assets.
- Six GitHub-compatible synthetic GIFs, 16 sec each, both themes.
- Comprehensive README, AGENTS.md and architecture/data/development/quality/migration docs.
- GitHub test CI plus separate GIF-preview workflow.
- Verify local/CI tests and actual GitHub README playback.
- Do not merge Studio PR #1; when migration is verified, a migration-link comment and administrative closure are appropriate.

**Pass:** fresh clone succeeds; Node tests 28/28, Python GIF tests 5/5, browser smoke at desktop and mobile, and all expected assets exist with correct links. **Blocked:** GitHub Actions cannot commit GIFs, missing files or unverified live playback.

## P1. Official GitHub contribution-calendar collector, starting with AdityaSreevatsaK

**Priority: critical. The user wants visuals of their actual GitHub account.**

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

**Goal:** any GitHub user can install the action and display chosen animation in their README.

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
