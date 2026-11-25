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
| Church in China | `/china-history/` | Separate sourced chronology, 635-2024; shared vertical/horizontal timelines, search, display-lane/date filters, evidence details and a complete text fallback |
| The global church | `/global-church/` | Country chooser for the available sourced histories |
| Church in Cambodia | `/cambodia-history/` | Introductory 42-record chronology, 1555-2025; visible source credit, uncertainty, shared timelines and complete text fallback |
| Church in Thailand | `/thailand-history/` | Introductory 40-record chronology, 1567-2023; local and cross-border agency, claim sources, qualified dates and complete text fallback |
| Westminster Confession | `/wcf/` | Text-first reader of all 33 chapters / 172 sections, chapter navigation, section links and historical-edition source notes |
| Westminster Standards | `/westminster-standards/` | Shared entry point for the Confession of Faith and both catechisms |
| Westminster Shorter Catechism | `/wsc/` | Complete 107 questions and answers, question links and edition sources |
| Westminster Larger Catechism | `/wlc/` | Complete 196 questions and answers, question links and edition sources |
| Logo studies | `/assets/brand/logos/` | Design-study archive, not another primary exploration |

The home card **The global church** opens a country chooser generated from
`site.config.json`'s `countryHistories`. China, Cambodia and Thailand are available;
existing `/china-history/` links and fragments remain country-specific.

The reader hosts the historical 1647 English text in Schaff's 1919 edition, with
specified exclusions and spelling conventions; see the [source/licensing memo](docs/westminster-content-sources.md).
The optional chapter-study layer is being developed separately; don't treat a
research plan or an incomplete note file as a published scholarly commentary.

The explorer opens on the vertical timeline on desktop and mobile. Choose Compact
lineage to see the connected major-branches overview. Drill-ins open the detailed timeline;
Vertical / Horizontal is a direct toggle. Nearby timeline entries collapse into
named groups, while splits and mergers use distinct branch lanes. The Catholic Church
node marks the 1054 schism on the timeline. Its profile explains the tradition’s
earlier history. Mobile profiles open
in a reading sheet; desktop keeps a resizable graph/profile split.

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

For the same checks used in GitHub Actions:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'chromium'
$env:CHURCHTREE_TEST_ROOT = 'dist'
npm run ci
```

On macOS/Linux, set those two environment variables in your shell before running
`npm run ci`. Tests can use an existing Playwright installation via
`PLAYWRIGHT_MODULE`; locally the browser defaults to Microsoft Edge unless
`PLAYWRIGHT_CHANNEL=chromium` is set. Screenshots go to `.tmp/browser-check/`.

`npm run ci` builds the artifact, checks JavaScript/JSON syntax, validates data and
local asset references, and runs model, failure-guard, desktop, mobile, reader and
landing/theme checks. See [user scenarios](docs/user-scenarios.md) for manual steps,
expected behavior, automated coverage and the difference between emulation and
physical-device testing.

Builders and browser views share `html-escape.js` through CommonJS or the
`HTMLEscape` browser global. Load it before dependent views. Its `esc` escapes
all five HTML metacharacters; `escReader` preserves the reader's existing
three-character serialization, and `escNullable` keeps missing explorer text empty.

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
- GitHub Pages serves `main-branch.com` through GitHub Actions. DNS and HTTPS were
  verified on 2026-11-22; see the [deployment evidence](docs/deployment.md#domain-cutover).
  If Fortinet blocks the site as "Newly Registered Domain", use the
  [approved access-remediation steps](docs/deployment.md#fortiguard-access-blocks).
  Website code cannot override a network administrator's policy.

The checked-in workflow and ruleset template describe the intended policy;
GitHub settings and the actual workflow/check/deployment results establish its live
state. A passing PR, merged commit and successful production deployment are distinct.

## Data and historical coverage

Research notes and canonical JSON live under `data/sets/<set>/`; shared sources and
citations live under `data/common/`. The release build discovers all sets and
regenerates the browser bundle from those sources. `data/data.js` is the legacy
source-preview bundle, regenerated by `scripts/build-data-js.ps1`; do not edit it
by hand. Tests of a release use **`dist/data/data.js`**.

The current baseline has 63 nodes across 13 sets. It is **not exhaustive**. Pentecostal
records exist, but additional streams and precursor bodies are among the audited
coverage gaps. Read the [data audit](docs/data-quality-audit.md) and
[historical coverage standard](docs/spec/historical-coverage-standard.md) before
adding records. Filled fields and resolved citations do not prove historical accuracy.

Research not yet approved for production discovery belongs outside `data/sets/`.
The [China church-history foundation](docs/research/china/README.md) remains
outside the public artifact. The separate `/china-history/` experience uses
45 selected records (including two unplaced research gaps) from the original
54-row research foundation. Nine of those original rows are held or outside the selected milestone
roster, not silently turned into institutional origins.
Its canonical editorial input and validator live in `china-history/`; the shared
country builder and template render its configured route. Only generated HTML,
approved public data and shared `country-history/` CSS/controller are published.
China records never enter `data/sets/` or the denomination bundle.
This is a writer-reviewed introductory selection, not independent scholarly
approval or a current-through-2026 history. Use the reusable
[country church history research skill](.github/skills/country-church-history/SKILL.md)
for comparable country-specific research, and its
[independent research-audit companion](.github/skills/country-church-history-audit/SKILL.md)
to test substantive coverage before comparison with existing records.
The [applied China audit](docs/research/china/audit.md) expands the underlying
research beyond the public selection; it does not automatically publish new rows.

The [Cambodia foundation](docs/research/cambodia/README.md) contains 50 research
rows, with 42 selected for `/cambodia-history/` and eight explicitly held. Its
latest selected institutional event is 2025-06-28, not the 2026 retrieval date.
The [coverage register](docs/research/cambodia/coverage.md) names missing traditions,
Khmer scholarship, primary documents and demographic methods. Writer self-review
is not the later independent research audit. No country records enter denomination
discovery and no contemporary vulnerable rosters or copied media are published.

The [Thailand foundation](docs/research/thailand/README.md) contains 44 research
rows, with 40 selected for `/thailand-history/` and four explicitly held. Supported
coverage ends in 2023; the national affiliation reference is December 2021,
not the 2026 retrieval date. Its [coverage register](docs/research/thailand/coverage.md)
retains local-language, regional, tradition and demographic gaps, including a
provisional hospital-closure date. The route reuses the same selector, approved-field
builder and shared country controller/CSS; only generated HTML/public data are added
to the artifact. Writer self-review is not the later independent research audit.

## Design language and identity

The selected mark is **Woodland solid**, a side-graft symbol, with three fixed colors:
bark `#9B7555`, leaf `#6E9D50`, and straw `#D6B579`. Shared lockups live in `brand.css`;
canonical SVGs are `assets/brand/logos/main-branch.svg` and
`main-branch-wordmark.svg`. Update source templates/builders and their generated
pages so branding survives rebuilding.

Shared semantic colors live in `theme.css`. Open **Site menu → Settings → Appearance** to choose **Parchment** (default), **Slate**, or **Ink**. The browser saves the selection across pages. These interface palettes remain evolving proposals, separate
from the selected logo's fixed colors. See the [design-language contract](docs/design-language.md).

## Where to make changes

- `site.config.json`: landing-page entries, public folders and custom domain.
- `templates/home.html` + `scripts/build-home.cjs`: generated home page.
- `templates/global-church.html` + `countryHistories`: generated country chooser.
  Register a country once in `site.config.json` after preparing its editorial
  `data.cjs` and `validate.cjs`; no per-country builder, template or public-file
  entries are needed.
- `templates/westminster-standards.html` + `site.config.json`'s `westminsterDocuments`:
  the collection page generated by `scripts/build-home.cjs`. Existing `/wcf/`,
  `/wsc/`, `/wlc/` and legacy `/westminster/` reader links remain unchanged.
- `church-history/index.html`, root explorer CSS/JS and timeline modules: history UI.
- `timeline-model.js`: shared temporal clustering and branch-lane model.
- Country `data.cjs` and `validate.cjs`: separate editorial chronology and explicit
  research crosswalk/held roster, using `scripts/validate-country-history.cjs`.
  `historical-dates.js` preserves year/month/day precision.
- `scripts/build-country-history.cjs` + `templates/country-history.html`: shared
  approved-field projection and page rendering. Each `countryHistories` entry
  supplies `pageDescription`, `searchPlaceholder` and `lastVerified` as well as card
  metadata. Optional `scopeDetails` is trusted editorial HTML for source notices;
  `showCountryChooser` and `noScript` preserve route-specific navigation and copy.
  `country-history/controller.js` and `history.css` enhance every route, consuming
  only `COUNTRY_HISTORY_DATA`. The build publishes each registered route's
  `index.html` and `public-data.js` automatically, never its editorial inputs.
- `westminster/content.json` + `westminster/build.cjs`: reader text and generated HTML.
- `theme.css`, `theme.js`, `theme-controls.css`, `brand.css`: shared visual foundation.
- `scripts/build-site.cjs`: clean website-only artifact; `.github/workflows/`: CI/deploy.

When adding an exploration, add its card metadata and public folder to
`site.config.json`, build the page, and add a scenario/test before exposing its link.
Keep default reading/navigating simple and deeper tools optional.
See the [second timeline guide](docs/second-historical-timeline.md) for a worked
example covering research, data modeling, layout, validation and publication.

[Architecture](docs/architecture/README.md) · [Product spec](docs/spec/product-spec.md) ·
[Documentation drift audit](docs/documentation-drift-audit.md) ·
[Implementation review](docs/implementation-review.md)

Tracing the history of beliefs and disagreements is **planned**, not implemented:
[future belief-history plan](plans/belief-history-future.md). Older plans record
historical decisions; current README/spec/architecture take precedence.
