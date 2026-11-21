# Project roadmap and live status

**Last repository audit:** 21 November 2026. This roadmap is a maintained snapshot, not a substitute for inspecting the current branch, code and Actions state. The README owns the automatically refreshed contribution totals; do not duplicate changing counts here.

## Current state

### Implemented and verified

- Standalone repository migrated from GitHub-Activity-Studio. The original Studio PR #1 was closed as superseded, not merged.
- Three distinct designs: Comet Streaks, Celestial Cartographer and Starforge, each with night and paper themes.
- Shared 371-cell calendar model and separate event-sample v1 and official-calendar v2 parsers.
- Offline synthetic gallery, deterministic SVG export and optional native GIF export.
- Authenticated official GitHub GraphQL collector with two date windows and strict completeness/identity/date/count/level validation.
- Reusable composite Action with validated input and safe workspace output paths.
- Owner-only daily preview workflow, including real Action smoke, twelve SVGs, six 16-second GIFs and README count/timestamp refresh.
- CI currently covers 42 Node tests, five Python GIF tests, Chromium desktop/mobile smoke and SVG reproducibility.
- The live GitHub profile repository has not been modified. No licence, release tag or stable Action version has been selected.

### Partially verified

- GitHub-hosted GIF playback: the native files are generated and their timing/motion are checked, but actual playback in the rendered README has not been visually confirmed.
- Consumer Action: the Action is exercised in the owner repository, but a clean external consumer repository and a range of token/visibility configurations have not been tested.
- Private contribution completeness: API visibility depends on the selected user's settings and token authorisation. The public snapshot must remain labelled API-visible.

### Not implemented

- Installation or automated commits in the owner's separate profile repository.
- Automatic retry and rate-limit backoff for GraphQL collection.
- A versioned public Action release/tag and licence.
- Configurable Action as-of date or arbitrary date range. The local collector supports --as-of only.

### Deprecated or historical

- Early radial, clustered, calendar-atlas and calendar-trails experiments were rejected because they weakened recognition of the familiar GitHub calendar. They remain in Studio history, not this standalone renderer.
- docs/AGENT_WORKPLAN.md is superseded by this roadmap and AGENTS.md.
- Studio's draft PR and branch are migration provenance only.

## Priority 0: visual verification on GitHub

- Inspect all six official GIFs in the actual GitHub README at desktop and narrow widths, and in light/dark GitHub themes.
- Confirm the calendar remains recognisable, labels legible and animation motion visible in GitHub's image proxy.
- If the proxy suppresses or alters playback, keep GIF as the animation format and static SVG as the reduced-motion fallback; document the observed behaviour.

**Done when:** a human has inspected the live rendered README and recorded the result with date and screenshots or a concise evidence note.

## Priority 1: consumer Action acceptance

- Test a clean external repository with the documented workflow and no owner-specific assumptions.
- Verify the public/API-visible query with a repository GITHUB_TOKEN and document when a user-provided token is required.
- Test account mismatch, invalid token, missing permission, rate-limit, timeout and failed collection. Confirm old output is not overwritten.
- Confirm the Action creates only the requested SVG/GIF files and never commits or pushes by itself.
- Consider adding a supported as-of input only if it has a clear consumer use case.

**Done when:** a fresh consumer can follow the guide, generate assets, and publish them only through their own explicitly authorised workflow.

## Priority 2: collector resilience and security hardening

- Add bounded retry/backoff for transient HTTP failures and GitHub rate-limit responses, without logging tokens or raw sensitive errors.
- Add tests for retry limits, rate-limit headers, timeout and cancellation.
- Review third-party Action references and pin dependencies to immutable SHAs where practical.
- Review Action path validation and output collision behaviour before broader adoption.

**Done when:** failures are bounded, actionable, tested offline and never replace a valid previous preview.

## Priority 3: visual polish and accessibility

- Inspect all designs at real README width and on mobile.
- Review low/high contribution-level distinction in both themes, contrast, text sizing, static final frames and reduced-motion output.
- Keep the three mechanics recognisably different without obscuring the 53x7 grid.
- Add visual regression evidence if it can be maintained without fragile snapshots.

**Done when:** all designs are legible at embed size, accessible and factually aligned to the same dates.

## Priority 4: public release decision

- Owner chooses and adds a licence before inviting reuse.
- Select a stable Action version/tag and document a SHA-pinned consumer example.
- Confirm SECURITY.md reporting path and contributor expectations.
- Publish a release only after explicit owner approval.

**Done when:** licence, version, docs and examples agree, and the owner approves release.

## Change-management rule

At the start of each task, inspect Git status, branch, recent commits, current source, tests and latest Actions. Reclassify each relevant milestone from evidence. Update this roadmap only when the implementation or verification state actually changes. Do not treat a plan, prior chat or workflow YAML as proof of completion.
