# Profile installation and automated updates

**Status:** the official contribution collector and reusable Action are available on master following approval of PR #1. The owner's live profile has not been modified.

## Consumer workflow

Create the following file in your own GitHub profile repository (which must have the same name as your username), or another repository that will host your images: .github/workflows/constellation.yml.

~~~yaml
name: Refresh profile constellation
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
      - name: Render the official GitHub contribution calendar
        uses: AdityaSreevatsaK/GitHub-Constellation@master
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          username: YOUR_GITHUB_USERNAME
          design: comet
          theme: night
          output-dir: assets/constellation
          gif: 'true'
      - name: Commit changed imagery only
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

In your profile README use:

~~~markdown
![My GitHub constellation](assets/constellation/comet-night.gif)
~~~

For reduced motion use assets/constellation/comet-night-still.svg.

**The @master reference is now valid.** For reproducibility in third-party workflows, pin to a reviewed commit SHA or a future versioned release. Generated output is not published automatically by the composite Action. The consumer explicitly authorises committing in their own workflow.

## Action inputs

| Input | Default | Description |
|---|---|---|
| token | Required | API token passed securely in the environment |
| username | Repository owner | GitHub account whose calendar is queried |
| design | comet | comet, cartographer, starforge, all |
| theme | night | night, paper, both |
| output-dir | constellation | Relative directory in the checked-out workspace |
| gif | true | Generate native 16-second GIFs in addition to static/animated SVG |

The two GitHub GraphQL queries cover the full 53-week grid and reject missing dates. Source data comes from the official calendar count and intensity fields, never fabricated events. The token may see public contributions only, or additional private contribution counts depending on authorisation and GitHub settings. No private repository names are collected.

## Secure collection from Windows

~~~powershell
$env:GH_TOKEN = "YOUR_TOKEN"
node collect-contributions.mjs --username YOUR_GITHUB_USERNAME --out local-output/official.json
node export.mjs --input local-output/official.json --out local-output/images --design all --theme both
py -3 export_gif.py --source local-output/images --out local-output/images
Remove-Item Env:GH_TOKEN
~~~

Keep local-output ignored, do not store tokens in scripts or files. Node.js 22 and Python 3.11+ are required for the optional GIF pipeline.

## Maintenance

Scheduled GitHub Actions run only when the workflow is on the repository's default branch and may run late. A failed GraphQL request stops rendering and does not replace previously working images. The companion owner-calendar workflow in GitHub-Constellation updates **only this project's assets**, not any profile repository.

No licence has yet been selected by the owner. Public release and the final Action version should be reviewed before endorsing use by unrelated users.
