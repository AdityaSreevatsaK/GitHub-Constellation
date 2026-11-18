# Next agent: detailed implementation instructions

This file is an **engineering task backlog**, not a substitute for implementation. AGENTS.md remains authoritative. Read ARCHITECTURE.md, DATA_SOURCES.md, DATA_CONTRACT.md, DEVELOPMENT.md, TESTING.md and ROADMAP.md first.

## Current verified source baseline

The migrated source originated at Studio concept/constellation, commit be7f524. It contains a deterministic engine for three designs, both themes, 371 cells, two synthetic data fixtures, 24 SVG exports and tests. Studio reported 28 Node test passes, five GIF test passes and a Chromium smoke pass before migration. These do not automatically establish correctness in this new repository.

Do **not** spend time redesigning unrelated concepts or claiming real account support without implementing and verifying it.

## Immediate first task: close the parity loop

1. Inspect HEAD and the GitHub Actions pages for master, especially the quality gate and preview-generation workflows.
2. Confirm all expected root source, docs, test and fixture files exist. Run Node and Python tests from a clean standalone clone.
3. Confirm the six generated GIFs exist in assets/stress/ and decode for exactly 16 seconds with visible motion.
4. Open the **actual GitHub repository README** and check rendering at both night and paper variants; inspect image links.
5. If Actions lacks permission to commit generated GIFs, report the exact failure, fix the workflow if permitted, or prepare a reproducible documented manual upload. Do not manufacture GIF-complete status.
6. Verify that fixture paths in browser smoke, export CLI and tests are independent of GitHub-Activity-Studio.
7. Update docs/ROADMAP.md and a draft PR with grounded outcomes.

## Next main task: personal contribution calendar, not fake event snapshots

Design a new standalone data-collection and normalisation module. Use GitHub GraphQL's authorised contributionCalendar source after checking current API schema and scope. The user's intended first identity is **AdityaSreevatsaK**, not an arbitrary sample account. Do not hardcode this username into general library defaults.

Implementation design:
- Define source-specific classes or schema for official calendar days, counts, window, visibility and fetched_at; distinguish from event contract v1.
- Implement a read-only collector with an explicit login, start/end range, environment-supplied token, timeouts, rate-limit-aware failure and zero token leakage.
- Validate the collection includes a continuous, expected range. Check weekday ordering, timezone/calendar semantics, non-negative counts and returned username.
- Use a single shared 53 by seven date model; add correct official metric labels/intensity. Keep three distinctive animation modes and static alternatives.
- Build offline tests covering valid calendar, empty data, leap day, boundaries, account mismatch, missing/duplicated date, token rejection, GraphQL errors and private contribution disclosure.
- Generate a personalised still from the first authenticated, verified data response. Do not commit raw API data containing private details unnecessarily.
- Generate the matching night/paper GIFs only after the real-data test passes; label the provenance as an official calendar.

## Next task: public action and daily updates

Once authentic source support is complete:
- Create a reusable GitHub Action with clearly documented username/design/theme/date range/output inputs and safe default permissions.
- Supply a minimal consumer example workflow with daily schedule, manual dispatch, concurrency and commits only on changes.
- Separate collection permissions from destination writes; never store personal secrets in the repo.
- Test safe paths, invalid input, missing token, rate-limit, concurrent updates and manual reruns.
- Do not change the owner's GitHub profile repository without explicit approval.

## Visual review and release task

After real-account integration:
- Compare all three designs in both themes using the same verified official data.
- Ensure that days with low and high counts are visibly distinguishable.
- Fix any confusing week wrap, cropped labels, too-dark unlit cells, unreadable small-size text or overly long silence in GIF timing.
- Validate static fallback, reduced-motion, keyboard access, mobile horizontal scrolling and GitHub proxy behaviour.
- Add concise installation examples, contributor guidance, security disclosure and owner-approved licence.
- Release only after explicit approval.

## Completion format for every subsequent AI session

End with a verifiable summary: branch and commit/PR URLs, exact source files modified, tests executed with counts, generated assets, what remains blocked, and a recommended next technical action. Avoid handoff-only responses when instructed to implement.
