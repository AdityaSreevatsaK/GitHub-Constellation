# AGENTS.md: GitHub Constellation

This is the **authoritative root instruction document for AI software agents** working in https://github.com/AdityaSreevatsaK/GitHub-Constellation. Read all applicable files in the required order; do not reuse branch restrictions or paths from the former GitHub-Activity-Studio monorepo.

## 1. Mission and creative direction

Build an original, exceptionally polished, **clearly recognisable GitHub contribution calendar** that can eventually be embedded in any GitHub profile, analogous in usability and memorability to GitHub Snake but NOT its mechanics or visual art.

The familiar 53-column, seven-row GitHub contribution lattice must stay the primary subject. Every highlighted square/star corresponds to a real dated input record. Users must understand the story at normal profile-README width with only a brief one-line legend. A beautiful but ambiguous constellation chart, generic scattered starfield, random lines between repositories or decorative dashboard is a design failure.

Three designs already exist and must remain genuinely distinct:

1. **Comet Streaks:** light a star for each active day, then animate comets only over uninterrupted consecutive active dates; singletons remain stars and missing dates split a trail. Handle Saturday-to-Sunday wraps without suggesting false adjacent geometry.
2. **Celestial Cartographer:** a miniature original observatory outside the grid guides a left-to-right week sweep that reveals the recorded day-stars. The calendar remains visible, not obscured.
3. **Starforge:** a small stellar forge dispatches bounded particles to their correct recorded calendar positions, which brighten as each spark arrives. Multiple source events in one day form one day-star, never fake extra days.

Preserve dark/night and light/paper treatments, a strong static final frame, 16-second motion, reduced-motion alternatives, accessible descriptions, and visually meaningful intensity. No unrelated Code Factory, Metro, Developer World, Agent Swarm or portfolio work belongs here.

## 2. Source of truth: read before editing

Read in this order:

1. This AGENTS.md.
2. docs/ARCHITECTURE.md for components and invariants.
3. docs/DATA_SOURCES.md and docs/DATA_CONTRACT.md for provenance, calendar semantics and security.
4. docs/DEVELOPMENT.md and docs/TESTING.md for commands and acceptance checks.
5. docs/ROADMAP.md for priorities and definitions of done.
6. README.md and, for historical context only, docs/MIGRATION.md.
7. The exact source files you will change, and their tests.

Do not treat old Studio prompt docs as current requirements. The source reference is Studio branch concept/constellation at commit be7f524597285c2078565068ab23a683316404a2, and Studio PR #1 was a draft. This repository is now the independent home.

## 3. Repository and change-control rules

- Default branch: **master**. Use descriptive feature branches for substantial work and draft pull requests for owner review. Do not force-push master, publish releases, change repository visibility/settings, select a licence or modify the owner profile without explicit approval.
- A request to implement means **make working source changes, tests, exports and docs**, not simply deliver an idea or handoff.
- Do not edit GitHub-Activity-Studio or sibling concept repositories as part of normal Constellation development.
- Never delete the source repository or old historical material without explicit approval.
- Keep all required assets self-contained; no mandatory external fonts, CDNs, analytics, paid APIs or untrusted remote script execution.
- Verify branch head and file state before writing. Do not overwrite other agents' concurrent changes. Prefer idempotent commands and atomic file updates.
- Keep commits focused. Describe observed test results accurately. Distinguish tests you ran, tests only documented, and behaviour not independently verified.

## 4. Strict data integrity and provenance

**Absolute rule: no fake personal contributions.** The currently committed ten-event and stress fixtures are synthetic. They must always be plainly marked as synthetic; do not call their aggregated activity units GitHub contribution counts.

Contract v1 is an **event-sample** input: schema_version 1; source demo/github; generated_at UTC; user; repositories; activity events. Strictly validate types, permitted HTTPS github.com URLs, distinct IDs, repository names, recognised kinds and positive integer count values. Deduplicate IDs; keep PR-opened and PR-merged events distinct. Count and brightness mean recorded mixed activity units only.

Blank cells in an event sample mean **no recorded event in this input**. They are NOT proof of zero contributions. When an annual official contribution collection is fetched, keep a **separately typed model/contract** describing GitHub GraphQL contributionsCollection.contributionCalendar. Do not silently translate its daily contributionCount into fake commit events, and do not conflate it with event-source contract v1.

For a real account, respect GitHub API authentication, scope, selected user identity, time window, server-side calendar dates, read-only access and visibility constraints. Report hidden/private contributions honestly, without naming private repositories or disclosing credentials. Reject incomplete/stale/failed collection rather than silently generating misleading personalised images. Never store tokens in committed fixtures, SVGs, logs, actions or the browser gallery.

Calendar mapping: 53 columns by seven Sunday-first rows, UTC and API date precision, leap years, week/year boundaries, future-day handling, deterministic dates and consistent data-to-visual correspondence. Derived animation must never invent or relocate days.

## 5. Current implementation and technical constraints

The production candidate is a small Node ESM + Python stack:

- engine.mjs: calendar parsing/aggregation and SVG geometry, one shared model for all designs.
- export.mjs: deterministic offline still/animated SVG exporter.
- export_gif.py: optional Chromium and Pillow GIF encoder with full-loop timing tests.
- preview.html: interactive control surface, keyboard/focus inspection and mobile horizontal scrolling.
- fixtures/demo-activity.json and fixtures/streak-demo.json: clearly synthetic reference inputs.
- assets/ and assets/stress/: generated SVGs and six GIF targets; SVGs remain the reliable static fallback.
- tests/: Node tests for semantics/motion, Python GIF timing tests and optional Chromium browser smoke.

Supported primary developer workstation: **Windows PowerShell, Python 3.11+ and Node 20+**, without WSL or paid APIs. Keep offline rendering and core tests fast and dependency-free. GIF/Chromium dependencies are optional locally and may be installed in CI.

SVG motion may not run inside GitHub's image proxy. Native GIF is the intended README animation format. Do not claim actual GitHub-hosted playback is verified until it has been observed on the rendered GitHub page. Preserve static alternatives in all cases.

## 6. Non-negotiable quality and visual acceptance

- First-frame comprehension: the viewer recognises GitHub's calendar in five seconds.
- Star positions correspond exactly to calendar dates and are stable between designs.
- One recorded active day yields one star, no fake streak; weekends wrap factually; missing days break streaks.
- Multiple events for a date aggregate without multiplying calendar stars.
- Honest intensity scale in both themes: 1, 2-3, 4-6, 7+ mixed event units for contract v1.
- 53 by seven visible cells; proper leap-year, year-boundary and UTC logic.
- No invented data or decorative stars visually confused with dated contributions.
- No HTML or SVG injection through source names, URLs, labels or JSON.
- Generated files reproducible given identical input, source and options; size, duration and visible motion verified.
- Reduced-motion support, static fallback, alt/title/desc, keyboard inspector, contrast and responsive mobile scrolling.
- No browser network calls for rendering the offline demo.
- Tests must cover empty data, malformed input, high-density data, long streaks, duplicates, zero activity, time boundaries and cross-theme equivalence.

## 7. Development, tests and CI

Run before proposing a code change:

~~~powershell
node --test tests/test_engine.mjs tests/test_motion.mjs
py -3 -m unittest tests/test_gif.py -v
node export.mjs
node export.mjs --input fixtures/streak-demo.json --out assets/stress --label "SYNTHETIC STREAK STRESS TEST"
~~~

When Playwright/Chromium is available, also run:

~~~powershell
py -3 tests/browser_smoke.py
py -3 export_gif.py
~~~

The repo contains test CI and a separate GIF rendering workflow. Workflow-generated GIFs must each retain 16-second playback with visible motion. If GIF artefacts are missing or the workflow cannot write because of permissions, report that explicitly and keep the SVG fallback; do not fake a successful migration.

## 8. Prioritised next development initiative

**P0: migration verification.** Confirm file count, source imports, real command paths, all 24 SVG variants and six GIF binaries (or a clearly reported Actions blocker), README rendering, 28 Node tests, five Python tests and browser smoke. Keep original data provenance.

**P1: real GitHub account support.** Implement a read-only, secure GitHub GraphQL contributionCalendar collector and a separately defined official-calendar model; fetch for AdityaSreevatsaK as the first real demonstration. Tests must prove days, counts, date coverage and scope. No hardcoded synthetic days or fallbacks claiming to be live.

**P2: reusable public action.** Expose username, theme, design, time window, destination and output format through documented inputs. Implement least-privilege token handling, reproducible export, cache/rate-limit behaviour, daily schedule and safe commit semantics. Do not automatically modify the owner's profile without approval.

**P3: release polish.** Inspect GitHub-rendered dark/light assets, animation motion, narrow widths, accessible contrast, documentation, contribution templates, licensing choice and release verification.

Consult docs/ROADMAP.md for detailed acceptance criteria and sequencing; update it when steps are objectively completed.

## 9. Done means working and evidenced

For each development PR provide: summary, exact paths changed, screenshots or committed exported previews, commands and test outcomes, explicit provenance and scope, security considerations, unresolved behaviour and a brief next step. Never merge a draft PR or assert GitHub rendering worked based solely on a local browser or successful file export. Make code changes first, not a handoff-only document.
