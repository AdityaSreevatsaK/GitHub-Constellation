# Contributing to GitHub Constellation

This project aims for high-quality, comprehensible GitHub contribution-calendar animations. Development must respect real-data provenance and preserve three original design languages.

## Before a contribution

Read [AGENTS.md](AGENTS.md), [ARCHITECTURE](docs/ARCHITECTURE.md), [DATA_SOURCES](docs/DATA_SOURCES.md), [DEVELOPMENT](docs/DEVELOPMENT.md) and [TESTING](docs/TESTING.md). Open or reference an issue for significant work and use a descriptive feature branch. Keep changes focused, with data validation and tests. Do not introduce unrelated Studio concepts.

Use Node.js 20+ and Python 3.11+. Core export is offline and has no npm dependencies. Python Pillow/Playwright and Chromium are optional for GIF and browser checks.

## Pull request standard

Explain the problem, changed modules, data-source semantics, screenshots of both themes, test commands and outcomes, security/privacy effects, and limitations. Keep the calendar recognisable, day positions correct and static fallbacks available. Do not present synthetic fixtures as personal GitHub history. Use the pull request template.

## Licensing

A public repository is not the same as an open-source licensed repository. No licence has yet been approved by the owner. Until one is selected and published, contributors should not assume reuse rights. Owner approval is required before release and licence choice.
