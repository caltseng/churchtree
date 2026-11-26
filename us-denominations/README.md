# U.S. denominations data contract

The standalone `/us-denominations/` route uses Pew Research Center's 2023-24
Religious Landscape Study (RLS), published February 26, 2025. Estimates measure
**adult self-identification**, not membership rolls, children or historical
lineage. [`sources.json`](sources.json) records provenance and reuse decisions.
The [route UI specification](../docs/us-denominations-spec.md#interaction-and-layout)
owns interaction, URLs, chart behavior, accessibility and layout requirements.

## Offline commands

From the repository root:

```text
npm run build
npm run test:us-denominations
node us-denominations/build.cjs
node us-denominations/data.cjs
node us-denominations/data.cjs --ledger
node us-denominations/demographics.cjs --ledger
```

Build before route tests. These commands download nothing; the build and reader
must remain offline. Ledgers resolve every cell's source title, panel/column/row
or complete interactive path and each lens's subset mapping from the inputs,
not a second copy of the values.

## Inputs and API

| File | Contract |
| --- | --- |
| `sources.json` | Study, field period, geography, denominators, metrics, revisions/hashes, locators, reuse notices, precedence decisions and omissions. |
| `affiliation.json` | Stable IDs, source/display labels, kind, classification scope, exact published string, status, precision and source row/path. |
| `attendance.json` | Independent monthly in-person NETs; each `populationId` identifies respondents, not an affiliation-tree child. |
| `demographics.json` | Broad affiliations within twelve populations, exact cells, subgroup denominators, definitions, nonresponse/uncertainty and renewed review/reuse record. |
| `demographics.cjs` | Offline validation, intentional public projection and demographic ledger; no national substitution. |
| `hierarchies.json` | Two trees referencing shared records, sourced subset edges and lens-specific panels. Absent panels are leaves; `coverage: selected` means **Published detail**, not closed totals. |
| `data.cjs` | Authoritative CommonJS build-time loader, validation and pure helpers; no controller or requests. |
| `view.js` | Pure CommonJS/browser presentation module shared by generator and controller. |
| `controller.js`, `build.cjs` | Offline progressive enhancement and deterministic route generation. |

`loadData()` validates inputs. `records(data)` and `getRecord(data, id)` resolve
inherited `seriesId` into `series` (metric/denominator), `study`
(wave/geography/population/field period) and `checkedDate`. Metadata is stored
once; record IDs also identify groups.

`getChildren(data, lens, id)` ranks numeric estimates descending, then thresholds,
suppressed and unavailable rows, with ASCII-ID ties; source order is unchanged.
`getAncestors(data, lens, id)` returns root-to-parent IDs. Both reject IDs outside
the lens; the controller normalizes state first.

`presentation(data, id)` exposes exact `valueText`, nullable `barValue`,
denominator/population labels and resolved source. Plot only numeric
`barValue !== null`; thresholds are not bounds-as-values or zero. Missing rows
have reasons. The population root has no affiliation estimate. Affiliation
denominators remain national; attendance uses adults in each named group, with
all-U.S. adults identified explicitly.

`deriveShare(data, lens, childId, parentId)` returns `null` or an approximate
whole-percent conditional value with denominator, input IDs, formula and rounding
disclosure. It requires an actual ancestor and compatible numeric national
affiliation series. Whole-percent cells below 10%, thresholds, missing values,
attendance and unrelated groups are excluded. SBC within Baptist is about 37%
(4.4 / 12.0 * 100), never a replacement for **4.4% of U.S. adults**.

## Source reconciliation

**Independent review passed November 22, 2026**, covering revision
`c9613120af2dd5aecc5c6d17b658fa47fbdf0ff5`, report/topline hashes, every selected
cell/path/qualifier, denominator, classification, precedence and reuse boundary;
no selected values changed. See `review` and decision `reviewStatus` in
`sources.json`. Offline checks are not independent source verification.
Changed or expanded selections require renewed review.

1. Verify the [report](https://www.pewresearch.org/wp-content/uploads/sites/20/2025/02/PR_2025.02.26_religious-landscape-study_report.pdf)
   hash. Read **Among all U.S. adults > 2023-24** on printed pp. 85-87
   (PDF pp. 86-88). Cross-check family totals on p. 25 and denominations on
   p. 30. Four additional thresholds, including Progressive National Baptist
   Convention, come from p. 30; retain `<0.3%`.
2. Select **2023-24** (`data-independent-var=2024`) in the
   [national interactive](https://www.pewresearch.org/religious-landscape-study/region/united-states/).
   Follow each complete `source.path`, retaining strings, precision and
   family/tradition qualifiers. Broad 62%, 7%, 29% and separately published 1%
   nonresponse are not a synthetic partition. Cross-check chapter 1.
3. Check [Appendix B](https://www.pewresearch.org/religion/2025/02/26/appendix-b-classification-of-protestant-denominations/):
   ABCUSA/PC(USA) are mainline, SBC/PCA evangelical; the three named National
   Baptist conventions are historically Black. Independent Baptist estimates
   are tradition-specific; Churches of Christ is a network/identity grouping.
   Pew classified 36% of Protestants with nonspecific identities using race
   and/or born-again identification. Nonspecific and nondenominational remain separate.
4. Review `tradition-precision`: selected report values 23.1%, 11.5%, 5.4%
   differ from interactive strings 23%, 11%, 5% for the same scope.
   **11.5 does not ordinarily round to 11.** Do not invent a microdata
   explanation; omit unresolved estimates rather than alter qualifiers.
5. Check [chapter 8](https://www.pewresearch.org/religion/2025/02/26/religious-attendance-and-congregational-involvement/#attending-religious-services-in-person),
   image 08-04 (199166), printed p. 165/PDF p. 166, **NET Monthly or more often**;
   topline p. 23, `ATTENDPERRLS` (`red`), excludes weddings/funerals. Overall
   NET is 33%; use Black Protestant NET 46%, not rounded 33% + 12%.
6. Record reviewed revision, scope, decisions and corrections in `sources.json`;
   rerun offline checks.

## Demographic selection and review

Use three directly published affiliations (Christian, Other religions,
Religiously unaffiliated), not sums/residuals, within twelve populations.
Nonresponse remains in denominators. No intersectional filters, denomination
cross-tabs, national substitutes or reverse-denominator composition tables.

| Dimension | Source columns |
| --- | --- |
| Age | Interactive 2023-24 top-level `traditionHeading`/`traditionPercentage`: 18-29, 30-49, 50-64, 65+; not child sums or birth-cohort labels. |
| Gender | Men/women, report printed p. 98/PDF p. 99, table 01-018 (198916). |
| Race/ethnicity | White/Black/Asian/Hispanic, p. 95/PDF p. 96, 01-015 (198913). |
| Education | College graduates/less than a college degree, p. 97/PDF p. 98, 01-017 (198915). |

White/Black/Asian mean non-Hispanic single-race; Asian covers English speakers;
Hispanics may be any race. GENDER is self-description (questionnaire p. 82;
Appendix A p. 348/PDF p. 349), not sex at birth or an exhaustive binary.
Age uses YOBMOD and education EDUC_ACS, questionnaire p. 74.

**Independent demographic reconciliation passed November 22, 2026** at
`606dff5b766d74d5c8af8e75898296c5e4142e9b`: 36 cells, twelve nonresponse notes,
four age margins, denominators, definitions and limited-excerpt reuse; no numeric
corrections. Instrument-locator clarifications were approved without repeat review.
`demographics.json` pins report/instrument/snapshot hashes; changed dynamic HTML
requires cell/wave/note reconciliation, not assumed snapshot identity.
Future expansions stay draft pending independent reconciliation of the complete
ledger and recorded revision/scope; passing CI is not source review. The trusted-PR
workflow can merge non-draft PRs.

## Reuse and publication boundaries

[Pew Terms](https://www.pewresearch.org/about/terms-and-conditions/), effective
May 25, 2018, checked November 22, 2026: section 1 grants limited attributed
use; sections 2/3 cover citation/prohibitions, section 13 datasets.
This original excerpt retains one national wave's selected affiliation cells,
twelve attendance NETs and 36 demographic cells, not a principal-part mirror.
It omits prior waves, detailed demographic denomination cross-tabs, most
interactive details and report prose from the 393-page report/multi-wave database.
No written permission or Pew endorsement is claimed; expansion needs renewed review.
No downloaded PDFs, artwork, snapshots or microdata are committed/published;
the public-use dataset omits detailed identity variables and was not used.
Preserve Pew credit, direct sources, dates, fielding, denominators, qualifiers,
coverage, classification/methods/instrument links, **© 2026 Pew Research Center**
and `reuse[].disclaimer`. Respondent data requires reassessing section 13.

`site.config.json` allows five exact public files, never recursive directory
publication. `public-data.js` intentionally projects `schemaVersion: 1`, keyed
records, two ranked lenses, locators, separate tradition strings and reuse context;
attendance and demographics have independent explicit projections.
Inputs, hashes, review tooling and CommonJS loaders remain internal.
Generated HTML is capped at 120,000 UTF-8 bytes; route tests check every fallback
row's locator/shared-note links, payload shape and complete published directory.

Never sum rounded children, infer Appendix-B estimates, manufacture an all-family
Independent Baptist total, assign attendance to denominations or join contemporary
estimates to historical lineage. PRRI/USRC remain excluded pending separate scope
and reuse decisions. Home discovery uses the existing builder/config; timeline
files and state remain unchanged.
