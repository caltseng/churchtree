# Main Branch

Main Branch is a growing collection of tools for exploring Christian history and
its sources. The project began as ChurchTree; the public site is **Main Branch** at
**main-branch.com**. It is a static website, with no application server, database,
or login required.

## What's here

| Page | Route | Current experience |
| --- | --- | --- |
| Home | `/` | Tile-based inventory of the available explorations |
| Church History | `/church-history/` | Connected branch overview, compact lineage, vertical and horizontal timelines, search, sourced profiles, ancestry and successor navigation |
| Church in China | `/china-history/` | Sourced chronology, 635-2024; Era navigator, reading chapters, timelines, search and evidence details |
| U.S. denominations | `/us-denominations/` | U.S. adult affiliation estimates from Pew's 2023-24 Religious Landscape Study; two lenses and sourced detail |
| The global church | `/global-church/` | Country chooser for the available sourced histories |
| Church in Cambodia | `/cambodia-history/` | Sourced chronology, 1555-2025; communities, language, displacement, timelines and text fallback |
| Church in Thailand | `/thailand-history/` | Sourced chronology, 1567-2023; local and cross-border agency, qualified dates and text fallback |
| Westminster Confession | `/wcf/` | Text-first reader of all 33 chapters / 172 sections, chapter navigation, section links and historical-edition source notes |
| Westminster Standards | `/westminster-standards/` | Shared entry point for the Confession of Faith and both catechisms |
| Westminster Shorter Catechism | `/wsc/` | Complete 107 questions and answers, question links and edition sources |
| Westminster Larger Catechism | `/wlc/` | Complete 196 questions and answers, question links and edition sources |
| Logo studies | `/assets/brand/logos/` | Design-study archive, not another primary exploration |

The home card **The global church** opens the country chooser. Existing country
links and fragments remain country-specific.

The reader hosts the historical 1647 English text in Schaff's 1919 edition, with
specified exclusions and spelling conventions; see the [source/licensing memo](docs/westminster-content-sources.md).
Research plans and incomplete study notes are not published scholarly commentary.

The history explorer opens on the vertical timeline. Choose Compact lineage for
the connected major-branches overview, or toggle Vertical / Horizontal. Nearby
entries form named groups; splits and mergers use distinct lanes. Profiles open
in a mobile reading sheet or a resizable desktop panel. The Catholic Church's
1054 timeline marker is not a claim that its history began then.

## Run and test

Use Node.js 20 or newer. CI uses Node 24 on **Ubuntu 24.04**, pinned because the
current Playwright version does not support the newer `ubuntu-latest` image.

```sh
npm ci
npx playwright install chromium
npm run build
npm run serve
```

Open **http://127.0.0.1:4173/**. The server serves the generated `dist/` website.
Rebuild after editing source files. D3 currently loads from d3js.org, so the explorer
needs access to that CDN. The home page and reader have no D3 dependency.

Generated pages, `public-data.js` bundles and `dist/` are ignored. Commit source
templates, builders and editorial inputs, not generated output. Church History
builds from `templates/church-history.html`; hand-authored logo studies remain tracked. CI checks that
rebuilding leaves Git status clean on Windows and Linux.

For the same checks used in GitHub Actions:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'chromium'
$env:CHURCHTREE_TEST_ROOT = 'dist'
npm run ci
```

On macOS/Linux, set those environment variables in your shell. An existing
Playwright installation can be selected with `PLAYWRIGHT_MODULE`; the local
browser otherwise defaults to Microsoft Edge. Screenshots go to
`.tmp/browser-check/`. `npm run test:countries` discovers country data and browser
cases from `site.config.json`.

Full interaction flows run once for each shared implementation. Other viewport
cases are layout smokes, not repeats of the full flow: they check overflow,
readable labels, usable controls and responsive details. Country routes still
each exercise their source links and no-JavaScript/D3-offline fallbacks; China
has a separate Era flow. Country and U.S. suites wait for observable state or
animation frames, not fixed sleeps. Validator mutations run once per validator;
editorial values, module identity and public-file inventories are not test oracles.

For timing comparisons, record the browser channel, artifact revision, exact
script digests and pass/fail results alongside elapsed wall time. Consolidated
and original suites have different test sets: report their suite-time change as
an **unmatched** comparison, not a speedup for identical tests.

`npm run ci` builds the artifact, checks JavaScript/JSON syntax, validates data and
local asset references, and runs model, failure-guard, desktop, mobile, reader and
landing/theme checks. See [user scenarios](docs/user-scenarios.md) for manual steps,
expected behavior, automated coverage and the difference between emulation and
physical-device testing.

Page builders share `scripts/page-shell.cjs` for head metadata, branded headers
and footer partials. Keep the Main Branch lockup in that file, pass each page's
canonical URL and skip target, and put page-specific controls in the template.
The single skip-link style lives in `theme.css`.

## Delivery and hosting

Changes go through **topic branch → pushed PR → required CI → merge → deployment**.
A local commit is not completion: push the relevant work and open/update its PR.
Follow [AGENTS.md](AGENTS.md) and preserve other chats' unrelated working files.

- The active GitHub `main` ruleset requires a PR and the **Build and test** check.
  It blocks force pushes and has no bypass actors.
- PRs are checked but do not publish. Main builds publish only after all checks pass.
- The deployment uploads exactly `dist/`, not the repository or a local server.
- Passing trusted same-repository PRs can merge automatically for now. The automation
  honors branch rules; it does not merge arbitrary public-fork PRs or drafts. Set
  repository variable `MAIN_BRANCH_AUTOMERGE=false` to pause it.
- GitHub Pages serves `main-branch.com` through GitHub Actions; see the
  [deployment evidence](docs/deployment.md#domain-cutover).
  If Fortinet blocks the site as "Newly Registered Domain", use the
  [approved access-remediation steps](docs/deployment.md#fortiguard-access-blocks).
  Website code cannot override a network administrator's policy.

GitHub settings and actual check/deployment results establish live state, not
workflow templates alone. Passing CI, merging and production deployment are distinct.

## Data and historical coverage

Canonical denomination JSON and research notes live under `data/sets/<set>/`;
shared evidence lives under `data/common/`. The current baseline has
94 nodes across 20 sets. It is **not exhaustive**. Read the
[data audit](docs/data-quality-audit.md) and
[historical coverage standard](docs/spec/historical-coverage-standard.md) before
adding records. Resolved citations do not prove historical accuracy.

Country editorial inputs are separate `*-history/data.cjs` files; their research
packets and held crosswalks stay outside the public artifact and denomination
catalog. Current selections, verified against those inputs and the registry:

| Country | Selected records | Held rows | Research roster | Research and gaps |
| --- | --- | --- | --- | --- |
| China | 45 | 9 | 54 | [Foundation](docs/research/china/README.md), [audit](docs/research/china/audit.md) |
| Cambodia | 46 | 11 | 57 | [Foundation](docs/research/cambodia/README.md), [coverage](docs/research/cambodia/coverage.md) |
| Thailand | 45 | 5 | 50 | [Foundation](docs/research/thailand/README.md), [coverage](docs/research/thailand/coverage.md) |

China's selection includes two unplaced research gaps; later audit additions are
not automatically published. Cambodia's latest selected event is 2025-06-28;
Thailand's supported coverage ends in 2023. Retrieval dates are not event dates.
These introductory selections are not exhaustive histories or independent
scholarly approval. Contemporary vulnerable rosters and copied media are excluded.
Use the [country research skill](.github/skills/country-church-history/SKILL.md)
and [independent audit companion](.github/skills/country-church-history-audit/SKILL.md)
for further research.

## Design language and identity

**Woodland solid** is the side-graft mark, with fixed bark `#9B7555`, leaf
`#6E9D50` and straw `#D6B579` colors. Shared lockups use `brand.css` and canonical
SVGs under `assets/brand/logos/`. **Site menu → Settings → Appearance** selects
Parchment (default), Slate or Ink across pages. Interface palettes are separate
from logo colors; see the [design-language contract](docs/design-language.md).

## Where to make changes

Start with [architecture](docs/architecture/README.md) for source locations,
country registration, rendering and release boundaries, or the
[second timeline guide](docs/second-historical-timeline.md) for a worked example.
Add card metadata, build the page and cover its scenario before exposing a new
exploration. Keep ordinary reading/navigation simple and deeper tools optional.

[Architecture](docs/architecture/README.md) · [Product spec](docs/spec/product-spec.md) ·
[Documentation drift audit](docs/documentation-drift-audit.md) ·
[Implementation review](docs/implementation-review.md)

Tracing the history of beliefs and disagreements is **planned**, not implemented:
[future belief-history plan](plans/belief-history-future.md). Older plans record
historical decisions; current README/spec/architecture take precedence.
