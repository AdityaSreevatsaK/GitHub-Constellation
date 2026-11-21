# Data sources, provenance and privacy

Source truth is a core product requirement. Every displayed day and metric must be traceable to its input contract.

## 1. Synthetic event samples

The repository contains two synthetic contract-v1 fixtures:

- fixtures/demo-activity.json: ten isolated example events on ten dates, with no consecutive-date streaks.
- fixtures/streak-demo.json: 69 invented example events across 65 active dates, used to demonstrate dense calendars and true consecutive-date runs.

These fixtures are for design, testing and the local browser gallery. They are not the owner's GitHub history. Keep synthetic labels visible in generated assets and README galleries.

Contract-v1 source github is accepted by the parser for an externally supplied event sample, but this repository does not currently contain a live GitHub event collector. Event counts are mixed recorded activity units, not official contribution totals.

A missing event means no event was supplied. It does not establish that GitHub recorded zero contributions that day.

## 2. Official GitHub contribution calendar

The implemented official collector queries GitHub GraphQL at https://api.github.com/graphql. It requests the selected user's contributionsCollection.contributionCalendar, including daily date, weekday, contributionCount and contributionLevel. The response is normalised into contract v2, not event contract v1.

The collection window is a 53-week display: Sunday 52 weeks before the week containing the as-of date through the as-of date. The collector splits this into two sequential GraphQL requests: the first 14 days and the remaining dates. It does not assume the GraphQL week padding outside each requested window is coverage.

Validation rejects:

1. Missing or different user identity.
2. GraphQL errors or missing calendar structures.
3. Invalid ISO dates or weekday/date disagreement.
4. Negative, non-integer or excessive daily counts.
5. Unknown contribution levels or zero/count-level contradictions.
6. Duplicate dates, missing dates or unexpected coverage.
7. Invalid or future as-of dates.
8. A snapshot whose displayed total does not match the daily counts when parsed by the renderer.

The GraphQL request has a 20-second timeout per window. Failures stop the collection. There is currently no automatic retry, rate-limit backoff or stale-cache fallback. Do not claim otherwise.

The collector uses GitHub's returned calendar date as canonical. Do not convert it through local time and shift a day. It validates weekday against the UTC calendar date.

## 3. What API-visible means

The snapshot visibility is explicitly api_visible. The number is the sum of daily contributionCount values returned for that authenticated query and selected account. It is not independently certified as the complete private-plus-public total.

Private contribution visibility depends on the account's GitHub settings and the identity/permissions of the token used. The repository's owner workflow successfully collected the owner's API-visible calendar using its workflow token, but that does not establish private-count completeness for every account or consumer workflow.

No private repository names are queried or stored. The public preview does reveal the daily activity counts that the API returned for the owner. Consider this when changing publication behaviour.

## 4. Authentication and secrets

- Local CLI reads GH_TOKEN first, then GITHUB_TOKEN.
- Composite Action receives a required token input and passes it to the collector as GH_TOKEN.
- The owner workflow uses the repository's GITHUB_TOKEN secret.
- Never hardcode a token, print request headers, save credentials in snapshots or expose raw GraphQL error bodies.
- Do not commit local-output/ or private-data/ contents.
- The Action needs no repository write permission for collection or rendering. A calling workflow needs contents: write only if it chooses to commit generated assets.
- The owner workflow has repository-level contents: write permission because it commits the owner preview assets and README summary. Its script stages only those paths; GitHub does not enforce path-level limits on that token permission.

## 5. Visual semantics

| Source | Meaning | Intensity |
|---|---|---|
| Contract v1 | Recorded events in the supplied sample | Mixed activity-unit bands: 1, 2-3, 4-6, 7+ |
| Contract v2 | API-visible GitHub daily contribution counts | GitHub contribution levels: none and first through fourth quartile |

Do not use one source's legend for the other. A synthetic fixture must never be used as a fallback for an official query failure. The date position and number of active stars must remain identical across all three designs for the same snapshot.

## 6. Publication and reproducibility

- The owner workflow publishes SVG/GIF previews and a count/timestamp summary, not the raw v2 JSON snapshot.
- The README summary is derived from the validated snapshot used by the same workflow run.
- Test fixtures and unit tests must remain offline and must not contain credentials.
- A failed collection must not overwrite the previous public preview.
- Keep provenance visible in SVG metadata and descriptions.
- If adding support for another account, explain the selected token and visibility semantics without exposing private repository details.
