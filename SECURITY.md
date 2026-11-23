# Security policy

## Scope

GitHub Constellation includes an offline renderer, an authenticated read-only GitHub GraphQL collector and a composite GitHub Action. The owner-only workflow publishes generated API-visible calendar imagery and a summary to this repository.

## Reporting

Report security issues privately through GitHub's private vulnerability reporting feature if it is enabled for this repository. Otherwise contact the repository owner privately. Do not publish credentials, private repository identities, exploit payloads or raw authenticated responses in public issues.

## Security requirements

- Never commit tokens, environment files, keys, cookies, OAuth headers or credentials.
- The collector reads GH_TOKEN or GITHUB_TOKEN from the process environment. The composite Action passes its required token input through an environment variable. Never place tokens in source code or logs.
- Do not print request headers or raw GraphQL error bodies. Keep error messages actionable but sanitised.
- Do not commit local-output/ or private-data/ snapshots. Raw official calendar payloads are not required in public assets.
- Treat all input JSON, usernames, URLs, labels and output paths as untrusted. Validate identities and dates, escape SVG/HTML content and reject workspace path traversal or unsafe symlinks.
- Do not fetch arbitrary URLs supplied by input data.
- Never convert synthetic fixtures into a personalised fallback after API failure.
- API-visible contribution totals may not include all private activity. Avoid publishing private repository names or claiming completeness beyond the token and account settings.
- The owner workflow uses contents: write only to commit its public preview assets and README summary to this repository. The reusable Action itself does not push.
- Keep dependencies and GitHub Action references reviewed. Prefer immutable SHA pins for third-party Actions in consumer workflows.
- Do not add trackers, analytics, remote fonts or untrusted runtime scripts.

## Current limitations

The collector has a 20-second timeout per GraphQL request and fails closed, but it does not yet retry transient failures or implement rate-limit backoff. The Action is smoke-tested in the owner repository; broader external-consumer and token-scope testing remains on the roadmap.
