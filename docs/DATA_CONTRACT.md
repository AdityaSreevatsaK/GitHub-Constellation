# Input contracts

The renderer supports two deliberately separate schemas. Preserve source provenance and metric meaning end to end.

## Contract v1: event samples

Used by the synthetic fixtures and any explicitly supplied event sample.

~~~json
{
  "schema_version": "1",
  "source": "demo",
  "generated_at": "2026-11-16T00:00:00Z",
  "user": {
    "login": "sample-dev",
    "url": "https://github.com/example"
  },
  "repositories": [
    {
      "full_name": "sample-dev/aurora",
      "name": "aurora",
      "url": "https://github.com/example",
      "language": "Python",
      "stars": 0
    }
  ],
  "activity": [
    {
      "id": "demo-1",
      "kind": "commit",
      "repo_full_name": "sample-dev/aurora",
      "occurred_at": "2026-11-01T10:00:00Z",
      "url": "https://github.com/example",
      "count": 1
    }
  ]
}
~~~

Rules:

- source is demo or github. The checked-in fixtures use demo and are synthetic.
- id identifies a source event. Duplicate IDs are ignored.
- kind is commit, pr_opened, pr_merged, issue_opened or release. Opened and merged PRs remain distinct.
- count is a positive integer for that recorded event. Summed counts are mixed recorded activity units, not official GitHub contribution totals.
- occurred_at and generated_at must be ISO 8601 UTC timestamps.
- Each activity repo_full_name must refer to a declared repository.
- Repository and activity URLs must be HTTPS github.com URLs without credentials or ports.
- Input labels and metadata are untrusted and must be validated/escaped.
- An unlit date means no event in this input, not proof of zero GitHub contributions.

No live GitHub event collector currently creates contract-v1 data. The source value github is part of the schema, not evidence that a live event ingestion workflow exists.

## Contract v2: official contribution calendar

Created by official_calendar.mjs and consumed directly by engine.mjs.

~~~json
{
  "schema_version": "2-official-calendar",
  "source": "github_contribution_calendar",
  "user": {
    "login": "example",
    "url": "https://github.com/example"
  },
  "as_of": "2026-11-18",
  "fetched_at": "2026-11-18T14:24:00.000Z",
  "visibility": "api_visible",
  "window": {
    "from": "2025-11-16",
    "to": "2026-11-18"
  },
  "calendar_days": [
    {
      "date": "2026-11-16",
      "contribution_count": 3,
      "contribution_level": "SECOND_QUARTILE"
    }
  ],
  "displayed_contributions": 3
}
~~~

The example is illustrative, not a complete valid 53-week snapshot. A valid snapshot must satisfy all of the following:

- schema_version is exactly 2-official-calendar and source is github_contribution_calendar.
- user.login is a valid GitHub login and user.url is exactly https://github.com/{login}.
- as_of is a real ISO calendar date, not in the future at collection time.
- fetched_at is a valid timestamp.
- window.from is the Sunday 52 weeks before the week containing as_of; window.to equals as_of.
- calendar_days is complete, ordered and contiguous from window.from through as_of. Depending on weekday, this is 365 to 371 days.
- Each contribution_count is an integer from 0 through 1,000,000.
- contribution_level is NONE, FIRST_QUARTILE, SECOND_QUARTILE, THIRD_QUARTILE or FOURTH_QUARTILE.
- A zero count must correspond to NONE; a positive count must have a non-NONE level.
- displayed_contributions must equal the sum of all daily counts.
- visibility is api_visible. This means the API-visible result, not a guarantee that all private activity is included.

The official daily count is never transformed into synthetic event records. Its intensity uses GitHub's returned level, not contract-v1 mixed-unit thresholds.

## Change policy

If either schema changes, update its parser, fixtures, tests, architecture and source documentation together. Do not silently broaden a schema or reinterpret old data. Keep all tests offline by using validated fixture responses rather than real credentials.
