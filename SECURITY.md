# Security policy

## Scope

This is currently an experimental offline SVG/GIF renderer. GitHub API collection, personal token support and reusable profile automation are **not yet implemented**. As those features arrive, treat source authenticity and token safety as critical.

## Reporting

For a security concern, use GitHub's private vulnerability reporting feature if enabled; otherwise contact the repository owner privately. Do not publish tokens, private repository identities, exploit payloads or credentials in public issues.

## Engineering requirements

- Never commit environment files, tokens, keys, cookies, OAuth headers or credentials.
- Validate and escape untrusted user/repository labels, URLs, dates and counts before producing SVG/HTML.
- Render only source-backed calendar cells; do not fetch arbitrary URLs from user-controlled input.
- Read-only collector tokens and narrowly scoped output-write permissions must remain separate.
- Avoid leaking private contribution details in publicly committed data, logs or generated images.
- Reject incomplete or stale source collections instead of substituting synthetic data.
- No external trackers, analytics, paid services, remote fonts or scripts in generated SVGs.
- Pin/update dependencies reasonably; CI must test both engine and optional GIF/browser pipelines.

Do not disclose a vulnerability publicly before the owner has been given a reasonable opportunity to remediate it.
