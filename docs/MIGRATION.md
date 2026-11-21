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

## Current operational boundaries

- The owner workflow modifies only GitHub-Constellation. It does not install or update imagery in the owner's separate GitHub profile repository.
- Official numbers are API-visible. Private contribution visibility depends on GitHub settings and token authorisation.
- The interactive preview gallery still uses synthetic fixtures; official account output is generated through the CLI/Action pipeline.
- The native GIFs pass encoding, motion and 16-second timing checks. GitHub-hosted image-proxy playback has not been independently visually confirmed.
- The reusable Action has been exercised in this repository but has no stable release tag and has not been fully accepted in an external consumer repository.
- No licence has been selected. Public repository visibility does not grant an assumed licence to reuse the code.

For current state and remaining work, use docs/ROADMAP.md. Historical source facts in this document should not be interpreted as evidence that the current branch still has the same state.
