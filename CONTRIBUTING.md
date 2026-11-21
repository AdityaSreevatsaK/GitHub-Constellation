# Contributing to GitHub Constellation

The project creates source-faithful, recognisable GitHub contribution-calendar animations. Contributions must preserve the 53x7 date grid, the three distinct designs and the separation between synthetic event samples and official contribution counts.

## Before changing code

1. Read [AGENTS.md](AGENTS.md) and the relevant architecture, data, development, testing and roadmap documents.
2. Inspect Git status, current branch, recent commits and latest Actions. Preserve existing local changes.
3. Establish whether the requested capability is implemented, partial, planned or deprecated before proposing a duplicate implementation.
4. Use a focused feature branch and reference an issue for substantial work.

## Local requirements and checks

Use Node.js 20+ and Python 3.11+. Core SVG rendering has no npm dependencies. The CI baseline uses Node 22 and Python 3.11.

~~~powershell
node --test tests/test_engine.mjs tests/test_motion.mjs tests/test_official.mjs tests/test_action.mjs tests/test_readme.mjs
py -3 -m unittest tests/test_gif.py -v
py -3 tests/browser_smoke.py
~~~

See [DEVELOPMENT](docs/DEVELOPMENT.md) for export, collector, GIF and preview commands.

## Pull request standard

Explain the user-visible change, exact source files, data contract affected, tests and actual results, regenerated assets, security/privacy effects and remaining limitations. Include screenshots or links for visual changes. State explicitly if GitHub-hosted playback has not been inspected.

Keep synthetic fixtures labelled. Do not claim their values are personal GitHub contributions. Do not publish raw authenticated snapshots or tokens. Update the relevant documentation in the same PR.

## Licensing

This repository currently has no selected licence. Do not assume code reuse rights or add a licence without the owner's explicit decision.
