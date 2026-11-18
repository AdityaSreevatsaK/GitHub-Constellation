# Activity sources, truthfulness and privacy

This document is a **mandatory acceptance contract** for any collector, fixture, renderer or README description. Source provenance is as important as appearance.

## A. Current source: event-sample contract v1

Both checked-in fixtures are synthetic and incomplete event observations.

- **fixtures/demo-activity.json:** shared ten-event fixture, ten isolated days, no consecutive streaks.
- **fixtures/streak-demo.json:** 69 invented example events on 65 active dates, with seven date-consecutive streaks.
- **source=demo:** always display a synthetic-demo label. No owner-specific assertions.
- **source=github under contract v1:** denotes recorded GitHub *events* only. It is not authoritative for GitHub's profile contribution totals.
- **count:** a positive source-backed integer per event. Summing commit, PR-open, PR-merge, issue and release records gives mixed **recorded activity units**, never a GitHub contribution total.
- **Missing event:** no observation in the input. A dark square does not prove that no GitHub contribution occurred.

Never use fake events to fill gaps in real personalised imagery. Do not rename a synthetic file to imply it came from the user.

## B. Official GitHub contribution calendar: implemented on master

Use GitHub GraphQL and query the intended GitHub user:

~~~graphql
query($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    login
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            color
            weekday
          }
        }
      }
    }
  }
}
~~~

The source-backed collector now lives in `official_calendar.mjs` and `collect-contributions.mjs`. It reads the GraphQL `contributionCount`, `contributionLevel`, `date` and `weekday` fields, validates the response and emits a separate `2-official-calendar` JSON contract. Two contiguous windows ensure the 53-week display is covered without exceeding one-year query windows. The real owner workflow successfully exercised this collector on 18 November 2026. Treat API-returned **date** as canonical; never convert it through a local timezone in a way that shifts cells.

Proposed distinct model:

~~~json
{
  "schema_version": "2-official-calendar",
  "source": "github_contribution_calendar",
  "login": "example",
  "fetched_at": "2026-11-18T00:00:00Z",
  "window": {"from": "2025-11-18", "to": "2026-11-18"},
  "calendar_days": [
    {"date": "2026-11-17", "contribution_count": 3}
  ],
  "coverage": {"complete": false, "warning": "illustrative, not a full-year response"}
}
~~~

The example above is schema discussion only. A true response MUST pass full-window completeness checks and should never be published with complete=false. Define and test this schema before enabling it as an engine input. Preserve day counts, official semantics and clear legends. Do not convert a count into N fictitious commits or repositories.

## C. Authentication and security

- Token is read from a secret or environment variable on the trusted collector side, never committed.
- Default to read-only permissions; do not request repository write access just to query the calendar.
- GitHub Action output publishing requires separate explicitly scoped contents:write permission to its own destination repository, not collector authority for arbitrary repositories.
- Never include the token, unredacted headers, private-repository names, GraphQL sensitive error payloads or unrelated user data in logs, SVG tooltips or shipped fixtures.
- For other public accounts, distinguish public contributions from any authenticated private-contribution visibility. Do not assert a total when scope prevents complete verification.
- Implement timeouts, rate-limit handling and actionable authentication errors; never silently substitute synthetic data on HTTP failure.
- Restrict user-supplied URLs and file destinations; guard against path traversal and output injection.

## D. Validation of an official-calendar response

Before rendering a personalised asset, verify at minimum:

1. Requested login exists and matches the returned account identity.
2. Authentication succeeded; no GraphQL errors; expected fields and types are present.
3. Requested date range is explicit, includes the intended calendar period and does not accidentally include unsupported future contributions.
4. Every returned week contains correct weekday order, no duplicate days and valid ISO dates.
5. Every count is a non-negative integer; no negative/NaN or fictional default values.
6. Calendar coverage and server date span are measured, not inferred from the current event-sample implementation.
7. Total count semantics are verified against the API response (window and possible calendar-alignment differences considered).
8. Private contribution visibility and account permissions are honestly labelled.
9. Rendered cell dates and daily counts agree with the raw, normalised calendar snapshot.
10. A failed/stale API response does not produce a misleading 'live' badge or overwrite a known-good profile asset.

## E. Visual semantics

For event-samples: legend reads 'Recorded activity units'; brightness thresholds 1, 2-3, 4-6 and 7+. For official data: legend reads 'GitHub contributions' with thresholds explicitly chosen and labelled for that source.

Do not equate colour returned by GitHub with numeric thresholds without verification. Always show actual numeric daily counts in available interactive inspection, and do not imply invisible/unknown activity is zero.

## F. Privacy, reproducibility, observability

- Tests must be entirely offline with labelled fixtures/mocked GraphQL responses.
- If scheduled updates are introduced, distinguish checked/fetched at from activity day, and avoid committing raw personal history when it is not necessary for output.
- Use actor-safe filenames/paths and stable sorting.
- Prefer metadata containing source type, generated time, GitHub username and query range (but no secrets).
- For publicly released Actions, document token requirements separately for the data-query and output-write stages.

See DATA_CONTRACT.md for the existing event-sample schema and ROADMAP.md for migration to an official-calendar pipeline.
