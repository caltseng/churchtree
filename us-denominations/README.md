# U.S. denominations data contract

The standalone `/us-denominations/` route uses this route-local data foundation,
independently of the historical timeline. The selected estimates come from Pew Research Center's 2023-24 Religious
Landscape Study (RLS), published February 26, 2025. They measure **adult
self-identification**, not membership rolls, institutional counts, children or
historical lineage. Source provenance and reuse decisions are in
[`sources.json`](sources.json).

## Offline commands

From the repository root, run:

```text
npm run test:us-denominations
node us-denominations/build.cjs
node us-denominations/data.cjs
node us-denominations/data.cjs --ledger
```

The ledger resolves every cell to its source title, precise panel/column/row
locator or complete interactive hierarchy, and emits each lens's subset
mapping. It is generated from the same inputs rather than a second copy of the
values. None of these commands downloads anything. The build and reader must
also remain offline.

## Inputs and API

| File | Contract |
| --- | --- |
| `sources.json` | Study/wave, field period, geography, denominator and metric definitions, source revisions and hashes, table panels/columns, reuse notices, source-precedence decisions and omissions. |
| `affiliation.json` | Stable record IDs, source and display labels, kind, explicit classification scope, exact published string, numeric/threshold/unavailable/suppressed status, precision, source panel and row. Interactive-only records include the full published path. |
| `attendance.json` | Independent monthly in-person NETs. Each `populationId` identifies the adults answering that row, **not** a child estimate in an affiliation tree. |
| `demographics.json` | Independently curated broad affiliations within twelve demographic populations, exact source cells, subgroup denominators, definitions, nonresponse/uncertainty and renewed reuse/review record. |
| `demographics.cjs` | Offline validation, explicit public projection and demographic source ledger (`node us-denominations/demographics.cjs --ledger`). No requests or national estimate substitution. |
| `hierarchies.json` | Two trees referencing the same estimate records; shared broad panels plus lens-specific panels. Parent/child edges include a source and subset locator. An absent panel is a leaf. `coverage: selected` means **Published detail**, never a closed total. |
| `data.cjs` | CommonJS loader, validation and pure data helpers for the later builder. No route controller or network access. |

`loadData()` reads and validates these files. `records(data)` and
`getRecord(data, id)` resolve each row's inherited `seriesId` into explicit
`series` (metric and denominator), `study` (wave, geography, population and field
period) and `checkedDate`. Common metadata is stored once, not copied into every
input cell. IDs are also group IDs in any lens where that record occurs.

`getChildren(data, lens, id)` returns independent rows ranked by numeric estimate
descending, then thresholds, suppressed and unavailable rows, with ASCII ID
tie-breaking for reproducibility. It does not mutate source order.
`getAncestors(data, lens, id)` supplies root-to-parent IDs for later breadcrumbs.
These functions reject IDs outside the selected lens; the later URL controller
must choose its own documented fallback before calling them.

`presentation(data, id)` exposes the exact `valueText`, nullable `barValue`,
denominator ID/label, population label and fully resolved source. Render a pie
slice or bar **only when `barValue !== null`**. A threshold is not its upper bound, half its
bound or zero. Unavailable/suppressed rows carry an explicit reason and no
number. The population root has no plotted affiliation estimate. Keep national
labels at every affiliation depth; attendance uses **Adults in each religious
group**, with all-U.S. adults explicitly identified for its overall row.

`deriveShare(data, lens, childId, parentId)` returns either `null` or an approximate
whole-percent conditional value with denominator, both input IDs, formula and
rounding disclosure. It requires an actual ancestor, compatible national
affiliation series and numeric inputs. Whole-percent cells below 10% are too
coarse for this optional ratio and are suppressed; thresholds, missing values,
attendance and unrelated groups are excluded. Example: `sbc` within `baptist`
is about 37%, calculated as 4.4 / 12.0 * 100 using rounded published inputs.
This does not replace SBC's primary **4.4% of U.S. adults**.

## Source reconciliation procedure

**Independent second review passed November 22, 2026**, with no selected value
corrections. The coordinating implementation session independently downloaded
the report and topline, verified both recorded hashes, and reconciled every
selected report cell, interactive path/value/qualifier, denominator and
classification against the publisher. The review covered commit
`c9613120af2dd5aecc5c6d17b658fa47fbdf0ff5`; subsequent changes here record the
review, not new values. See `review` and each decision's `reviewStatus` in
`sources.json` for revision, scope, source-precedence approval and reuse limits.
Offline validation remains distinct from that independent source verification.
Any expanded or changed selection requires renewed review.

1. Open the [dated report](https://www.pewresearch.org/wp-content/uploads/sites/20/2025/02/PR_2025.02.26_religious-landscape-study_report.pdf).
   Check its SHA256 against `sources.json`. Report printed p. 85 is PDF p. 86,
   printed p. 86 is PDF p. 87, and printed p. 87 is PDF p. 88. Read the **Among
   all U.S. adults > 2023-24** column only. Family totals match printed p. 25;
   denominations match printed p. 30. The four additional denomination
   thresholds, including Progressive National Baptist Convention, come from
   p. 30, not p. 87. Retain `<0.3%` exactly.
2. Open the [national interactive](https://www.pewresearch.org/religious-landscape-study/region/united-states/).
   Explicitly select **2023-24** (its selector's `data-independent-var` is
   `2024`). Follow the complete `source.path` of each selected cell, preserving
   its string, whole-percent precision and family/tradition qualifiers. The
   national broad values are Christian 62%, other religions 7%, unaffiliated
   29%, and the separately published nonresponse note 1%; these are not a
   synthetic 100% partition. Check broad Christian categories against
   [chapter 1](https://www.pewresearch.org/religion/2025/02/26/religious-landscape-study-religious-identity/).
3. Reconcile every denomination's family and tradition against
   [Appendix B](https://www.pewresearch.org/religion/2025/02/26/appendix-b-classification-of-protestant-denominations/).
   ABCUSA is mainline, SBC evangelical, and the three named National Baptist
   conventions historically Black. PC(USA) is mainline and PCA evangelical.
   Churches of Christ is a network/identity grouping, not a single institutional
   denomination. Independent Baptist is a general identity classified by race;
   its evangelical and historically Black estimates are distinct.
4. Review `tradition-precision` explicitly: report p. 85 shows 23.1%, 11.5%,
   5.4% of **all U.S. adults**. The interactive shows 23%, 11%, 5% for the same
   wave, national denominator and Pew tradition taxonomy. The current
   source-precedence decision selects the report's published decimals.
   **11.5 does not ordinarily round to 11.** We have not used unrounded
   microdata to explain the different displays and do not assert that the
   interactive is obtained by rounding the report's cells. If a reviewer
   cannot reconcile scope/precision, omit the affected estimate until resolved,
   rather than silently changing its value or qualifier.
5. Open [chapter 8's in-person attendance table](https://www.pewresearch.org/religion/2025/02/26/religious-attendance-and-congregational-involvement/#attending-religious-services-in-person)
   (image 08-04, attachment 199166; report printed p. 165 / PDF p. 166). Check
   the selected religious-group rows against **NET Monthly or more often**.
   Read the [topline](https://www.pewresearch.org/wp-content/uploads/sites/20/2025/02/PR_2025.02.26_religious-landscape-study_topline.pdf)
   printed/PDF p. 23, `ATTENDPERRLS` (coded `red`), excluding weddings and
   funerals. The overall NET is 33%; never derive the Black Protestant NET
   by adding its rounded 33% weekly and 12% once/twice-monthly cells (the
   published NET is 46%).
6. Record the completed independent review and any corrections in
   `sources.json`, including the checked revision, reviewed selection and
   decisions; rerun the offline checks.

Pew reports that 36% of Protestants had nonspecific denominational identities
and were classified using race and/or born-again identification. See Appendix
B's opening paragraphs. “Mainline” is a Pew survey classification, not a
general synonym for a denomination family. Nondenominational and nonspecific
Protestant responses remain separate, as explained in report p. 86's note.

## Selected excerpt and reuse boundary

[Pew Terms of Use](https://www.pewresearch.org/about/terms-and-conditions/),
effective May 25, 2018, were checked November 22, 2026. The grant permitting
attributed content use is **section 1**, citation is section 2, prohibited
conduct is section 3, and survey dataset terms are section 13. The spec's
reference to sections 2/3/13 does not replace section 1's principal-part limit.

This selection retains one national wave's family column, selected denomination
cells, selected interactive family intersections/response categories and one
attendance NET for twelve groups, plus 36 broad affiliation cells within twelve
demographic populations, out of a 393-page report and a multi-wave,
multi-geography database with many measures. We omit prior waves, detailed demographic
denomination cross-tabs, most interactive details, report prose and publisher chart artwork.
This is an original, attributed excerpt comparison, not a mirrored chart,
catalogue or principal-part reproduction. No downloaded PDF, publisher image or
microdata is checked into Git. No written permission has been obtained or
claimed. Expansion needs renewed review of the Terms' excerpt boundary.

The later route must carry **Pew Research Center** credit, source titles/direct
links, publication date, field period, denominator, row qualifiers, coverage
notes, links to classification/methods/instrument, and the applicable notice
**© 2026 Pew Research Center** observed on the consulted website. It must not
imply Pew endorsement; carry `reuse[].disclaimer`. If introducing respondent
data, reassess section 13 and add its required dataset disclaimer. The
[public-use-file description](https://www.pewresearch.org/dataset/2023-24-religious-landscape-study-rls-dataset/)
states that detailed identity variables are omitted; no dataset was used here.

## Publication boundary and downstream handoff

The route does not register `us-denominations` in the public directory allowlist.
`build.cjs` intentionally emits only browser-needed affiliation records,
hierarchy, attendance and source/reuse context in `public-data.js`, plus static
nested lists and an attendance table.
Do **not** copy this directory recursively: `data.cjs`, `test-data.cjs`, the
review tooling and source inputs are internal. `site.config.json` registers five
exact public files, never this directory. Route tests assert both the generated
payload shape and the complete published directory. Attendance has an explicit
public projection, not a copy of the input or internal provenance. Run
`npm run build` before route tests.

Do not sum displayed children, infer missing denominations from Appendix B,
create an all-family Independent Baptist total, assign group attendance to a
denomination, or join these contemporary estimates to the historical timeline.
PRRI and U.S. Religion Census are deliberately excluded pending their separate
scope and reuse decisions. The home card comes from the existing home builder
and site configuration. No timeline files or state are changed.

### Route/controller handoff

`view.js` is a pure CommonJS/browser module shared by the generator and controller.
Its public projection has `schemaVersion: 1`, keyed `records`, two `lenses` with
ranked panel children, estimate-specific source locators, selected source links,
the exact separate tradition interactive strings and applicable reuse context.
Internal review hashes, inputs and source extraction tooling are not browser
assets. `data.cjs` remains the authoritative build-time API.

`controller.js` enhances the static page without requests. Affiliation state is
`{view: "families" | "traditions", group: recordId, format: "chart" | "list"}`.
URLs use `?view=families&group=baptist` with optional `&format=list`; native links
also carry static fragments in nested fallback content. Invalid IDs resolve to
the national root; a known incompatible Protestant descendant resolves to
Protestant. Lens switching preserves an identical shared record/scope, including
denominations, otherwise falls back to Protestant. Duplicate and unknown URL
parameters are corrected with a visible status message. Back goes up one parent;
Reset keeps the lens. Browser history replays state. Drill-in focuses the selected
heading; going up restores the departing child link when available.

Affiliation chart mode is a drill-down pie (`pieModel`/`renderPie` in
`view.js`). The full circle is the current parent's national share (all U.S.
adults at the root); each numeric child is a slice drawn to that national scale.
When published children sum to less than the parent (`coverage: selected`), a
hatched remainder is labelled "not itemized" and is never inferred as another
group; when independently rounded children exceed the parent, the circle is
their sum and the caption says so. Thresholds, unavailable and suppressed rows
get no slice and are named in the notes after the estimate key. Every numeric
slice has a full-name and exact national-value callout beside the circle,
including small slices. HTML callouts wrap at the current viewport width;
leader lines route outside the ring and follow label layout on resize.
The selected group and circle denominator stay above the chart. Supporting
rounding, hatch, threshold and precision explanations follow the complete key
and remain associated with the SVG through `aria-describedby`. Selecting a slice by pointer, touch
or keyboard (one tab stop; arrow keys, Home/End, Enter/Space) zooms that slice
to a full ring, then sweeps its published children in clockwise from the top.
The centre link, Back, Reset and breadcrumbs zoom out: the departing slice
shrinks back into its arc as its siblings return, and the list slides in from
the direction of travel. One motion runs at a time; a new selection, Back or
Reset snaps any running animation to its final state before navigating. A leaf
draws no further pie and says "No finer breakdown is published." Each level
shows a compact visible source credit with direct links and the Pew notice;
coverage, the selected record's notes, locator, precision, fielding,
denominator, disclaimer and methods sit behind an Info disclosure. Caveats
needed to read the chart (hatched not-itemized arcs, unsliced thresholds,
scaled circles) stay visible. The legend list below the pie keeps every label,
exact value and source disclosure; reduced motion removes all pie and list
animation.

Attendance and demographic charts keep a bounded, independently scrollable
viewport. Real two-pointer pinches zoom the chart from 100% to 400% around the
gesture midpoint, while one-pointer drags pan it. Labels, values, bars and axes
enlarge together; the scale and denominators do not change. Thresholds never
acquire a fabricated bar or slice.

Zoom out/in and Fit chart buttons, plus `+`, `-`, `0` and arrow keys when the
chart region is focused, provide non-gesture alternatives. Ctrl/Cmd+wheel zooms
only over the chart; browser page zoom remains available outside it. Source
disclosures retain native keyboard/click behavior. Gestures suppress accidental
drill-ins, including pointer cancellation and two-to-one-finger transitions.
During a visit, each comparison remembers its zoom, scroll position and open
chart source notes across detail navigation, browser history and List switches.
List removes chart zoom/pan behavior without changing estimates or sources.
Reloads start at a fitted chart; zoom is presentation state, not a URL/data filter.

Attendance extends state with `{view: "attendance", group: null, format:
"chart" | "list"}`. Its canonical URL is `?view=attendance` (optionally
`&format=list`), without an affiliation group. A supplied group is removed with
the same visible correction notice. Back and Reset are hidden: attendance has no
ancestor tree. Switching back to an affiliation lens restores the last in-memory
affiliation focus using the existing identical-scope/fallback rules. Reloading
an attendance URL starts without an affiliation focus; switching then opens the
selected lens's national root. History replays attendance and affiliation states;
List remains the current display preference on selector changes.

The intentional `attendance` payload includes twelve source-ordered independent
population rows, exact published NET strings and numeric values, row/column/table
locators, measure, question/instrument locator, fixed scale and caveats. It does
not insert rows into `records` or `lenses`. The semantic table is the chart's text
equivalent, not a duplicate set of controls; CSS bars use a fixed 0-100% scale,
and List hides them. Static `#static-attendance` provides the same rows and source
context without JavaScript. Each row uses adults in its named religious group;
the overall row uses all U.S. adults. No affiliation ratios, denomination
inference, virtual measure or sums of rounded frequency cells are used.

Demographic views remain independent and add only their
explicit public projection. No timeline or home-card changes belong
to this integration. The route tests exercise both affiliation
lenses/paths and attendance together as v1 acceptance, including source context,
public boundary, focus, view switching, history and no-JavaScript access.

Automated browser tests cover 320px portrait, 667x375 landscape, desktop,
keyboard-only interaction, no-JavaScript nested content, and a 640px CSS layout
viewport at DPR 2 equivalent to a 1280px desktop at 200% page zoom. This emulation
is a layout check, not a manual browser-zoom test. DOM/keyboard checks are not
real screen-reader testing; that manual assistive-technology check remains a
release limitation until actually performed.

### Demographic expansion and source gate

The confirmed expansion answers **affiliations within each demographic**, not
demographic makeup of a religion. `?view=demographics&dimension=age&population=age-18-29`
selects one population; `&format=list` preserves the same values and sources.
The four dimensions are age, self-described gender, race/ethnicity and education.
There are no combined/intersectional filters, national ancestors, attendance
answers or denomination cross-tabs. Switching back restores an in-memory
affiliation focus; a fresh demographic deep link has none. Browser history
replays dimension, population and format. Invalid/duplicate/incompatible
parameters are corrected visibly. Static `#static-demographics-{populationId}`
details carry the same tables, denominators and citations without JavaScript.

The selected excerpt is just **Christian, Other religions, Religiously
unaffiliated** for twelve populations. Each cell is directly published, not a
sum or residual. Nonresponse stays in the denominator and its published note
remains visible, without a fabricated bar. Four age bins (18-29, 30-49, 50-64,
65+) use the 2023-24 interactive's top-level cards, specifically
`traditionHeading`/`traditionPercentage`, not sums of rounded child cells.
The other eight populations use chapter 1's composition tables, **not chapter
24's demographic makeup of religious groups**:

| Dimension | Population columns and precise source |
| --- | --- |
| Gender | Among men / Among women > 2023-24; report printed p. 98 / PDF p. 99, table 01-018 (attachment 198916). |
| Race/ethnicity | Among White / Black / Asian / Hispanic adults > 2023-24; printed p. 95 / PDF p. 96, table 01-015 (198913). |
| Education | Among college graduates / Among adults with less than a college degree > 2023-24; printed p. 97 / PDF p. 98, table 01-017 (198915). |

White, Black and Asian columns are non-Hispanic single-race populations; Asian
estimates represent English speakers only. Hispanics may be of any race.
GENDER is self-description, not sex at birth (web/phone questionnaire p. 82;
Appendix A, printed p. 348 / PDF p. 349). The source's two gender columns are
not an exhaustive classification; no estimate for “In some other way” is
invented. Education preserves the report's two bins, rather than claiming
unpublished detailed levels. The age bins reflect approximate survey-time age,
not current age or the report's overlapping birth-cohort age labels.

`demographics.json` pins report/instrument hashes and checked interactive
snapshot hashes. Dynamic HTML hashes may change on a later visit; reconcile
the selected wave, top-level cells and notes rather than assuming a later
HTML snapshot is identical. The main and demographic ledgers resolve every
cell and preserve exact source-row/column/path locators. No downloaded report,
image, instrument, full database or snapshot is committed or published.

**Independent demographic reconciliation passed November 22, 2026**, covering
revision `606dff5b766d74d5c8af8e75898296c5e4142e9b`: all 36 cells, twelve
nonresponse notes, four age margins of error, denominators, definitions and
renewed limited-excerpt reuse. No numeric corrections. The reviewer corrected
the age instrument item to **YOBMOD, questionnaire p. 74** (not BIRTHYR), and
clarified **EDUC_ACS, p. 74**. These locator/review-only follow-ups were approved
without a second reconciliation. The recorded review does not imply Pew's
review or endorsement of Main Branch.

For future expanded selections, existing national affiliation/attendance review
is not sufficient. Keep the PR draft even with passing CI: the repository's
trusted-PR workflow can merge non-draft PRs. Send the draft revision and complete
demographic ledger to the coordinator; record the reviewed commit/scope and
corrections before making it ready. Renewed Terms review limits this expansion
to the original 36-cell broad comparison and preserves credit/notices/no
endorsement; no written permission or principal-part republication is claimed.
