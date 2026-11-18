# Architecture and engineering invariants

## Purpose

GitHub Constellation is a GitHub-profile-ready renderer for real calendar-shaped activity, with Comet Streaks, Celestial Cartographer and Starforge animation modes. It is a verified official GitHub calendar renderer and reusable composite Action, with separate synthetic event-sample demonstrations. Consumer profile installation is opt-in. All three modes share one date model; only presentation differs.

## Source layout

| Location | Responsibility | Key guarantees |
|---|---|---|
| engine.mjs | Parse contract-v1 snapshots; aggregate events per UTC date; calculate 371 cells, streaks and SVG geometry | Deterministic output; reject malformed data; preserve date positions |
| export.mjs | Source-to-SVG CLI | No external npm packages; strict source selection; 12 assets per fixture |
| export_gif.py | Render SVG motion via Chromium; encode palettes and save GIFs via Pillow | 16,000 ms duration, visible frame changes, consistent dimensions |
| preview.html | Browser lab and accessible controls | No server API; event inspector; keyboard access; narrow viewport scrolling |
| fixtures/demo-activity.json | Ten-event synthetic contract v1 | Isolated active dates, exactly zero real consecutive-date streaks |
| fixtures/streak-demo.json | Larger explicitly synthetic showcase | 65 active dates, 69 events, seven real date-consecutive runs |
| assets/ | Source-controlled demo SVG exports | Animated and still, both themes, three designs |
| assets/stress/ | Source-controlled stress-test SVGs and generated GIF previews | Every visual backed by synthetic stress fixture, not owner data |
| tests/ | Unit and browser/encoder regressions | Event semantics, motion, timing and responsive interaction |
| docs/ | Architecture, provenance, standards and agent instructions | This standalone repo is authoritative |
| .github/workflows/ | Validation and optional automated GIF asset generation | No paid API, least privileges |

Legacy experiments (radial/clustered star maps, older calendar-sky Python) are intentionally excluded: they were rejected as hard to understand and are retained only in Studio history.

## Current rendering pipeline

~~~text
Synthetic JSON fixture (contract v1)
    |
    +--> engine.parse: validate, deduplicate and aggregate by calendar day
    |        |
    |        +--> Sunday-first 53 x 7 cells
    |        +--> active days, mixed-unit intensity, factual streak groups
    |
    +--> engine.render: choose design, theme, static/animated
             |
             +--> export.mjs: deterministic self-contained SVGs
             +--> preview.html: interactive browser gallery and inspector
             +--> export_gif.py: Chromium frame capture -> Pillow palette/frames
                                   -> 16-second native GIF loop
~~~

The diagram is conceptually synchronous. No network or token is required for the current renderer.

## Strong cross-design invariants

- **Calendar:** exactly 371 fixed slots arranged as 53 weeks by seven Sunday-first days. No positional interpolation, randomisation or reshuffling of active days.
- **Date:** event timestamp parsing is UTC; the same source date must map to the same cell in every design and theme. Real GitHub GraphQL calendar dates require a different, explicitly verified date interpretation.
- **Identity:** source event IDs deduplicated; one active day remains one day-star regardless of number or kind of source events.
- **Intensity:** contract-v1 sums documented mixed source activity units into four explicit levels. These are not GraphQL contribution totals.
- **Streaks:** calculate only from distinct observed consecutive calendar dates, not proximity of SVG coordinates. Week wrapping cannot create spurious diagonal connections.
- **Motion:** animated modes must converge to the same final still; no motion may conceal or fabricate data.
- **Determinism:** sorted records and fixed rendering options produce byte-identical SVG outputs. GIF generation verifies encoded playback timing.
- **Security:** validate all inputs and escape injected text/links in exports. No execution from input data and no external assets in generated SVGs.

## Rendering designs

**Comet:** chronological motion on each consecutive-day run; singleton stars do not have moving trails. At a Saturday/Sunday transition the comet must wrap visually without implying a diagonal line of unobserved calendar cells.

**Cartographer:** an original miniature observatory sits outside the calendar lattice and scans weeks left to right, revealing only source-backed active dates.

**Starforge:** a sparkle leaves the forge and reaches one active calendar cell; the corresponding permanent star brightens on arrival. High-density snapshots cap the *number of animated particles*, not the number of displayed source days.

For all designs, a still export is a first-class output and must remain useful at reduced motion, on mobile and in a GitHub README.

## Future real-data architecture

The official GitHub contribution calendar is an independent source and **not a thin adapter that turns contribution counts into fake repo events**. Proposed pipeline:

~~~text
Authenticated read-only GitHub GraphQL query
    -> validate actor, window, completeness, day coverage, visibility
    -> official-calendar snapshot (separate schema/version)
    -> common typed calendar model (metric_kind = official_contributions)
    -> same three renderers, correct units and legends
    -> local SVG / GIF, then optional profile GitHub Action
~~~

The calendar rendering interface can be shared while provenance and metrics remain separate. Keep the read/validate/transform stages independently testable with offline API-response fixtures. A live-data failure should fail closed, not fall back to synthetic images labelled personalised.

## Performance and output constraints

- 371 calendar cells must always be rendered.
- Avoid unbounded animation particles for busy users.
- Use lazy/optional Chromium and Pillow only for GIF export.
- Generated images must be self-contained and modest in size. Existing synthetic GIF benchmark: 720 by 234 px and 16 seconds, with each source GIF under approximately 1.8 MiB.
- Avoid paid APIs, external fonts, tracker calls or browser-side credentials.
- Work on Windows PowerShell without WSL; CI runs on standard GitHub-hosted Linux.

## Known risks

1. GitHub image proxy may suppress embedded SVG animations; native GIFs are intended for README motion and static SVGs are fallbacks.
2. GitHub's official calendar semantics may differ from event-derived UTC dates: do not assume equivalence without testing.
3. Privacy and access scope differ when querying another user or authenticated private contributions.
4. Live official data collection and scheduled project-local updates are implemented. The public consumer Action has been smoke-tested in this repository but is not installed in the owner's profile.
5. The original Studio's draft PR, commits and legacy experiments remain historical provenance, not the active repository.

See DATA_SOURCES.md for strict collection requirements and ROADMAP.md for the implementation sequence.

## Implemented official-calendar architecture (18 November 2026)

The official GitHub contribution-calendar source is separate from the event-sample contract. official_calendar.mjs collects and validates complete dated contributions from two GraphQL windows, rejecting missing days, altered identity, incorrect weekdays, negative counts, unexpected levels and API failures. collect-contributions.mjs accepts a token through an environment variable and writes a validated 2-official-calendar snapshot to an ignored local path. engine.mjs reads this typed data directly, retaining the 371-cell geometry while using actual contribution counts and API-defined intensity tiers, with source-specific tooltips and legends.

exporters produce source-faithful SVGs and verified 16-second GIFs. action.yml provides an installable composite GitHub Action with validated username, design, theme and safe output path. The owner-calendar workflow operates only on this repository; its daily schedule is enabled on the default branch. The owner workflow successfully collected and rendered actual GitHub contributions for AdityaSreevatsaK on 18 November 2026, and also exercised the composite Action itself.
