# Install the reusable GitHub Action

## Status and boundaries

The composite Action is implemented in action.yml and smoke-tested by the owner-calendar workflow in this repository. It can collect an official contribution calendar and write SVG/GIF files into the calling workflow's workspace.

It does **not** commit or push files. A consumer workflow must explicitly grant contents: write and publish its own output. The owner's separate profile repository has not been modified or installed.

There is no versioned release tag yet. For a production consumer, pin uses to a reviewed full commit SHA rather than following master. Update that SHA only after reviewing a new release/commit.

## Example consumer workflow

Create .github/workflows/constellation.yml in the repository where the images should live:

~~~yaml
name: Refresh GitHub Constellation

on:
  workflow_dispatch:
  schedule:
    - cron: '17 2 * * *'

permissions:
  contents: write

concurrency:
  group: profile-constellation
  cancel-in-progress: false

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Render official contribution calendar
        uses: AdityaSreevatsaK/GitHub-Constellation@<REVIEWED_40_CHARACTER_COMMIT_SHA>
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          username: YOUR_GITHUB_USERNAME
          design: comet
          theme: night
          output-dir: assets/constellation
          gif: 'true'
      - name: Commit changed images
        shell: bash
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add -- assets/constellation/
          if git diff --cached --quiet; then
            echo "No changes"
          else
            git commit -m "chore: refresh constellation"
            git push origin HEAD
          fi
~~~

The example requires the consumer to replace the SHA and username. The Action itself only writes to the workspace; the final step is the consumer's explicit publication step.

Embed the resulting asset in the README:

~~~markdown
![My GitHub Constellation](assets/constellation/comet-night.gif)
~~~

For reduced motion or a still image, use assets/constellation/comet-night-still.svg.

## Action inputs and outputs

| Input | Required | Default | Supported values |
|---|---:|---|---|
| token | Yes | None | Token passed securely to the collector |
| username | No | Calling repository owner | Valid GitHub login |
| design | No | comet | comet, cartographer, starforge, all |
| theme | No | night | night, paper, both |
| output-dir | No | constellation | Safe relative path inside the workspace |
| gif | No | true | true or false |

Outputs:

- output-dir: validated absolute output directory in the workspace.
- username: validated GitHub login used for collection.

Selecting all designs and both themes creates twelve SVGs and six GIFs. Selecting one design/theme creates the corresponding outputs only. GIF generation installs Python 3.11, Pillow, Playwright and Chromium; set gif: 'false' for SVG-only output.

The Action does not accept a date range or as-of input. The local collector supports --as-of, but that CLI option is not exposed as an Action input.

## Token and visibility

The token must be accepted by GitHub GraphQL for the requested user. The owner workflow has successfully used its repository GITHUB_TOKEN for the owner's API-visible calendar. This does not guarantee that every consumer's token can query every account or expose private contribution counts.

GitHub's contribution calendar visibility depends on account settings and token authorisation. The output is labelled API-visible and must not be described as a guaranteed complete private-plus-public total. If a consumer needs additional visibility, they must supply an appropriately authorised token through repository or organisation secrets. Never put a token in workflow YAML or command-line arguments.

The Action only needs to read the contribution calendar. The calling workflow needs contents: write only because the example commits generated files. Keep those permissions separate in your own workflow design.

## Local CLI alternative

~~~powershell
$env:GH_TOKEN = "YOUR_TOKEN"
node collect-contributions.mjs --username YOUR_GITHUB_USERNAME --out local-output/official.json
node export.mjs --input local-output/official.json --out local-output/images --design all --theme both
py -3 export_gif.py --source local-output/images --out local-output/images
Remove-Item Env:GH_TOKEN
~~~

Keep local-output/ ignored. Never commit the raw snapshot. Node.js 20+ is sufficient for the core CLI; GIF generation additionally requires Python 3.11+, Pillow, Playwright and Chromium.

## Maintenance

The owner-calendar workflow in GitHub-Constellation updates only that repository's assets and README summary. It does not publish into a consumer's profile. Scheduled GitHub Actions may run later than the configured cron time. A failed collection stops the workflow before replacing the previous committed assets.

No licence or stable release has been selected. Review the licence and pin a reviewed commit SHA before recommending this Action for general reuse.
