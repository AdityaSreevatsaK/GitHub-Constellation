# Migration history and engineering decisions

## Origin and destination

- Source: https://github.com/AdityaSreevatsaK/GitHub-Activity-Studio
- Source branch: concept/constellation
- Source implementation commit: be7f524597285c2078565068ab23a683316404a2
- Historical Studio draft PR: https://github.com/AdityaSreevatsaK/GitHub-Activity-Studio/pull/1
- Standalone destination: https://github.com/AdityaSreevatsaK/GitHub-Constellation
- Destination default branch: master
- Standalone repository created and migration completed: 18 November 2026

The standalone repository was created so Constellation could evolve, be documented and eventually be released independently rather than remain one concept inside the Studio monorepo. The Studio PR was closed as superseded, not merged. The original source branch and history remain provenance.

## Vision and design evolution

The original requirement was a GitHub-profile-ready reinterpretation of the familiar contribution calendar. The 53-week by seven-day grid had to remain recognisable, date positions had to be source-backed, both light and dark themes were required, and local SVG/GIF exports, a browser preview, tests and Windows-friendly instructions were part of the engineering scope.

Early radial, clustered and astronomy-first layouts were rejected because they made the contribution calendar hard to recognise or obscured its date structure. The approved designs became:

1. Comet Streaks: consecutive-date streaks become comet motion; isolated dates stay isolated.
2. Celestial Cartographer: an observatory scans the calendar in date order.
3. Starforge: bounded sparks travel to exact active-day positions.

The designs share one calendar model so the same input cannot shift dates between visualisations. Native GIF became the intended README animation format because GitHub may suppress embedded SVG motion. Static SVG alternatives remain essential.

## Extracted source and excluded experiments

The migration moved the modern engine, exporter, browser gallery, GIF exporter, fixtures, tests, assets and project documentation to the standalone repository. Relative paths and imports were corrected for the new root.

The following were deliberately excluded: Code Factory, Open Source Metro, Developer World, Agent Swarm and unrelated Studio infrastructure. Older Python calendar-sky, radial, clustered and calendar-atlas experiments remain only in Studio history.

The original event-sample contract and synthetic fixtures were retained. Synthetic examples were never relabelled as personal activity.

## Standalone implementation milestones

- **18 November 2026:** migration and standalone CI completed. The six synthetic stress GIFs were regenerated and committed by Actions because binary Git blobs could not be reused directly across repositories.
- **18 November 2026:** official GitHub GraphQL contribution-calendar collection was added as a separate v2 schema. It validates account identity, complete dated coverage, weekday, counts and contribution levels. It does not manufacture event records.
- **18 November 2026:** the reusable composite Action and owner-only scheduled refresh were merged through PR #1. The Action writes assets but does not commit them. The owner workflow commits only public preview assets and README summary to this repository.
- **18 November 2026:** README summary automation was added so displayed contribution totals and fetch time stay aligned with generated images.
- **19-21 November 2026:** scheduled owner refreshes completed successfully and updated the real-account assets and README summary.

## Technical challenges and lessons learned

- **Monorepo-to-standalone paths:** the motion tests and browser scripts initially carried assumptions about the Studio directory layout. Imports and fixture paths were corrected so the standalone root is self-contained. See [the path correction](https://github.com/AdityaSreevatsaK/GitHub-Constellation/commit/6e71b968f4).
- **Binary asset transfer:** source-repository Git blob references cannot be reused directly in a separate repository tree. The six GIFs were regenerated from the committed SVGs in the destination workflow and then validated.
- **Source-aware SVG labels:** exports must not label an arbitrary custom input as the default synthetic demo. Export label handling and committed demo SVGs were corrected and regenerated in [0d98c79](https://github.com/AdityaSreevatsaK/GitHub-Constellation/commit/0d98c79c37) and [ba81f08](https://github.com/AdityaSreevatsaK/GitHub-Constellation/commit/ba81f08313).
- **Synthetic versus official asset inventory:** early quality-gate runs [44316964982](https://github.com/AdityaSreevatsaK/GitHub-Constellation/actions/runs/44316964982), [44317418668](https://github.com/AdityaSreevatsaK/GitHub-Constellation/actions/runs/44317418668) and [44317429288](https://github.com/AdityaSreevatsaK/GitHub-Constellation/actions/runs/44317429288) failed because a recursive SVG glob counted the twelve new official SVGs as part of the 24-file synthetic archive, producing 36 instead of 24. The check was corrected to inventory root synthetic SVGs, stress synthetic SVGs and official owner SVGs separately. Never restore a recursive all-assets count as a synthetic-only assertion.
- **Browser provisioning:** repeated Playwright Chromium installation was slow on hosted runners. CI now uses preinstalled Chrome when available, passes its executable through CONSTELLATION_CHROMIUM, and falls back to Playwright's Chromium installation. Both browser smoke and GIF export honour that variable. See [the CI adjustment](https://github.com/AdityaSreevatsaK/GitHub-Constellation/commit/c43fb8b911).
- **GitHub image hosting:** embedded SVG animation may be suppressed by GitHub's image proxy. Native GIFs are therefore the README animation format, with static SVG alternatives. The actual rendered README still needs human playback inspection.
- **Data authenticity:** official contribution counts are not event records. The v2 calendar contract remains separate from synthetic/event contract v1. The current owner GITHUB_TOKEN does not carry the optional read:user scope, so do not claim private/internal contributions are included.
- **Documentation drift:** early agent workplans became stale after implementation. AGENTS.md now requires a fresh Git and Actions inspection, and ROADMAP.md is the sole current backlog.

## Current operational boundaries

- The owner workflow modifies only GitHub-Constellation. It does not install or update imagery in the owner's separate GitHub profile repository.
- Official numbers are API-visible. Private contribution visibility depends on GitHub settings and token authorisation.
- The interactive preview gallery still uses synthetic fixtures; official account output is generated through the CLI/Action pipeline.
- The native GIFs pass encoding, motion and 16-second timing checks. GitHub-hosted image-proxy playback has not been independently visually confirmed.
- The reusable Action has been exercised in this repository but has no stable release tag and has not been fully accepted in an external consumer repository.
- No licence has been selected. Public repository visibility does not grant an assumed licence to reuse the code.

For current state and remaining work, use docs/ROADMAP.md. Historical source facts in this document should not be interpreted as evidence that the current branch still has the same state.
