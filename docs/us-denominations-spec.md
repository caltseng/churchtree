# U.S. denominations explorer

This is the canonical route UI specification, including the live controller's
interaction contract. The [route data contract](../us-denominations/README.md)
owns offline commands, input/API contracts, source reconciliation and
reuse/publication boundaries. Changes here describe existing behavior, not a
new feature or data selection.

## Release scope

Build a standalone Main Branch page at `/us-denominations/` and link to it from the home page’s exploration cards. Answer “How common are different U.S. religious affiliations, and what denominations can I see within them?” Default to **Families and denominations**, offer **Protestant traditions** as an alternate grouping, and include **Religious service attendance** as a separate practice view. The reference period is 2023–24, the detailed Religious Landscape Study (RLS) wave. Pew’s [October 2026 national update](https://www.pewresearch.org/religion/2026/10/28/religion-remains-stable-in-the-us-with-mixed-signals-for-young-adults/) provides more recent broad context. Pew explains the limits of annual polling for [denominational detail](https://www.pewresearch.org/religion/2025/02/26/decline-of-christianity-in-the-us-has-slowed-may-have-leveled-off/).

Use a route-local data model and interaction controller. This work is independent of the 50-body coverage audit, and the visualization measures contemporary affiliation independently of historical lineage. The implementation diff should leave timeline files, content, models, state, entry point and controls untouched. Use the shared Main Branch lockup with a home link and accessible text. Keep the bark, leaf and straw logo colors in the existing shared brand styles.

## Affiliation data and hierarchy

Use published weighted estimates from Pew Research Center’s 2023–24 RLS, fielded July 17, 2023 through March 4, 2024, among 36,908 adults in the 50 states and D.C. The population measure is adult self-identification. Each affiliation row needs a national estimate or published threshold, a source locator, and its denominator. Include the study period and “Share of U.S. adults” beside the visualization. Pew’s [dataset description](https://www.pewresearch.org/dataset/2023-24-religious-landscape-study-rls-dataset/) says the public-use file omits detailed religious identity variables. The first release can use published aggregates without restricted access.

| Level | Source and implementation decision |
| --- | --- |
| U.S. adults → broad affiliations | Use the national interactive database’s 2023–24 view for Christian, other religious affiliations and unaffiliated context, checking broad estimates against chapter 1. Include the source’s nonresponse row where published. Preserve its placement alongside the broad groups. |
| Christian → Christian affiliations → Protestant families | Nest Protestant, Catholic and other published Christian groupings under Christian. Use chapter 1’s “A closer look at Protestant denominational families” table (printed p. 86) for Protestant family totals, including nonspecific Protestant. Use the publisher’s grouping for Orthodox Christians, Latter-day Saints, Jehovah’s Witnesses and other Christian categories. Expose deeper levels only where there are verified published estimates. |
| Protestant → Protestant traditions | In the alternate grouping, show evangelical Protestant, mainline Protestant and historically Black Protestant (approximately 23%, 11% and 5% of all U.S. adults in the national interactive). Allow drill-down into each tradition’s reported family intersections, then their published detail. A Baptist row within Mainline is the mainline Baptist subset. The full Baptist family belongs in the families lens. |
| Families or family intersections → denominations and response categories | Begin with chapter 1’s “Largest Protestant denominations in the United States” table (printed p. 87), and consult the national interactive for additional explicit rows, thresholds and parentage. Prefer the decimal national value where the report and interactive refer to the same group, wave and denominator. Preserve whole-percent precision for additional interactive rows. Record any unresolved classification or precision mismatch and omit the affected row until reconciled. |

Sources: [2023–24 national interactive database](https://www.pewresearch.org/religious-landscape-study/region/united-states/), [chapter 1](https://www.pewresearch.org/religion/2025/02/26/religious-landscape-study-religious-identity/), [report tables, printed pp. 25, 30 and 85–87](https://www.pewresearch.org/wp-content/uploads/sites/20/2025/02/PR_2025.02.26_religious-landscape-study_report.pdf), and [Appendix B classification](https://www.pewresearch.org/religion/2025/02/26/appendix-b-classification-of-protestant-denominations/).

- **Baptist** (12.0% of U.S. adults) opens a published selection that includes Southern Baptist Convention (4.4%), American Baptist Churches USA (1.0%), National Baptist Convention, USA (1.0%), National Baptist Convention of America (0.4%), and Progressive National Baptist Convention (<0.3%). The national interactive also identifies Independent Baptist by tradition, including a 3% evangelical row. Include separately labeled tradition-specific estimates when useful. An all-family Independent Baptist estimate requires a published, compatible aggregate.
- **Presbyterian** (1.7%) opens a published selection including Presbyterian Church (USA) (0.8%) and Presbyterian Church in America (0.5%). The interactive gives additional reported categories under the evangelical and mainline Presbyterian nodes. Appendix B identifies additional survey responses such as Orthodox Presbyterian and Cumberland Presbyterian. Appendix B alone supplies classification and names. A name requires a published value to enter the numeric view.
- Attach Appendix B to the methodology note. Pew uses denomination and, for some nonspecific answers, race and/or born-again identification to classify respondents. Pew reports that 36% of Protestants were assigned using the latter approach. “Mainline” is a survey classification within Protestantism. Some Pew categories are families, networks or general identities. Label each row accordingly and use the publisher’s self-identification taxonomy throughout.

### Percentages and partial detail

- Keep the primary value national at every zoom depth. At the Protestant focus, optionally show the published subgroup figure when the report supplies it (SBC is 4.4% of U.S. adults and 11% of Protestants). Inside Baptist or Presbyterian, a secondary labeled estimate such as “about 37% of Baptists” is permissible for SBC using 4.4 ÷ 12.0 × 100. For derived values use only same-wave numeric rows with verified subset relationships and compatible source definitions, round to whole percent, and disclose use of rounded inputs. Suppress the ratio for threshold, suppressed, missing or unsuitable low-precision inputs. Display national and subgroup percentages in explicitly labeled fields.
- Affiliation chart mode uses the drill-down pie specified below, not the original horizontal-bar proposal. Attendance and demographics retain fixed-scale bars.
- For partial detail, label the child view **Published detail** and explain that it covers selected reported affiliations. Preserve a published “Other” or unspecified category only with the source’s scope and estimate. No synthetic residual estimate from subtracting displayed children from the parent; the pie's hatched not-itemized arc is a coverage indicator, not a group or estimate. No sum of two separately rounded or censored cells to manufacture a cross-tradition category. Totals and children may differ because of rounding or available detail.
- Distinguish a numeric estimate, a published upper threshold (e.g. “<0.3%”), and an unavailable / suppressed estimate. Plot numeric values only. Keep bounded and unavailable rows readable with their exact qualifier and without a fabricated slice or bar. A leaf opens sourced details but has no further pie or invented next level.

## Interaction and layout

### Affiliation navigation and state

The page opens with **U.S. denominations**, the survey period and denominator,
a labeled view selector, and the national overview in **Families and
denominations**. `controller.js` enhances the static page without requests.
Affiliation state is
`{view: "families" | "traditions", group: recordId, format: "chart" | "list"}`.
URLs use `?view=families&group=baptist` with optional `&format=list`; native links
also carry static fragments in nested fallback content.

Selecting a slice or its linked name opens the group and its published children,
with the parent's estimate retained above the chart. Example paths are
**U.S. adults → Christian → Protestant → Baptist** and
**U.S. adults → Christian → Protestant → Presbyterian**; the alternate lens uses
**Protestant → Mainline Protestant → Presbyterian (mainline)**.

Invalid IDs resolve to the national root; a known incompatible Protestant
descendant resolves to Protestant. Lens switching preserves an identical shared
record/scope, including denominations, otherwise falls back to Protestant.
Duplicate and unknown URL parameters are corrected with a visible status message.
Breadcrumbs come from the selected hierarchy and mark the current group.
**Back** goes up one parent; **Reset** keeps the affiliation lens and returns to
its national root. Browser Back/Forward replays state. Drill-in focuses the
selected heading; going up restores the departing child link when available.

### Affiliation pie, disclosures and motion

Affiliation chart mode is a drill-down pie (`pieModel`/`renderPie` in `view.js`).
The full circle is the current parent's national share (all U.S. adults at the
root); each numeric child is a slice drawn to that national scale. When published
children sum to less than the parent, a hatched remainder is labelled
**not itemized** and is never inferred as another group. When independently
rounded children exceed the parent, the circle is their sum and the caption
says so. Thresholds, unavailable and suppressed rows get no slice and are named
in the notes after the estimate key.

Every numeric slice has a full-name and exact national-value callout beside the
circle, including small slices. HTML callouts wrap at the current viewport
width; leader lines route outside the ring and follow label layout on resize.
The selected group and circle denominator stay above the chart. Supporting
rounding, hatch, threshold and precision explanations follow the complete key
and remain associated with the SVG through `aria-describedby`.

Selecting a slice by pointer, touch or keyboard (one tab stop; arrow keys,
Home/End, Enter/Space) zooms that slice to a full ring, then sweeps its published
children in clockwise from the top. The centre link, Back, Reset and breadcrumbs
zoom out: the departing slice shrinks back into its arc as its siblings return,
and the list slides in from the direction of travel. One motion runs at a time;
a new selection, Back or Reset snaps any running animation to its final state
before navigating. A leaf draws no further pie and says
**No finer breakdown is published.**

Each level shows a compact visible source credit with direct links and the Pew
notice. Coverage, the selected record's notes, locator, precision, fielding,
denominator, disclaimer and methods sit behind an **Info** disclosure. Caveats
needed to read the chart (hatched not-itemized arcs, unsliced thresholds, scaled
circles) stay visible. The legend list below the pie keeps every label, exact
value and source disclosure. **List** hides the pie without changing navigation,
values or sources. Reduced motion removes all pie and list animation. Pie zoom
is hierarchical navigation, not the comparison viewport's geometric zoom.

### Attendance state and comparison

Attendance state is
`{view: "attendance", group: null, format: "chart" | "list"}`.
Its canonical URL is `?view=attendance` (optionally `&format=list`), without an
affiliation group. A supplied group is removed with a visible correction notice.
Back and Reset are hidden: attendance has no ancestor tree.

Switching back to an affiliation lens restores the last in-memory affiliation
focus using the identical-scope/fallback rules. Reloading an attendance URL
starts without an affiliation focus; switching then opens the selected lens's
national root. History replays attendance and affiliation states; List remains
the current display preference on selector changes.

The chart uses twelve source-ordered independent population rows and exact
published NET strings. Its semantic table is the text equivalent, not a duplicate
set of controls; CSS bars use a fixed 0-100% scale, and List hides them. Static
`#static-attendance` provides the same rows and source context without JavaScript.
Each row uses adults in its named religious group; the overall row uses all U.S.
adults. No affiliation ratios, denomination inference, virtual measure or sums
of rounded frequency cells are used.

### Affiliations within demographics

This independent view answers affiliations **within** a selected demographic
population, not demographic makeup of a religion. Native dimension/population
selects choose one population at a time in age, self-described gender,
race/ethnicity or education. No combined/intersectional filters, national
ancestors, attendance answers or denomination cross-tabs are provided.
The [data contract](../us-denominations/README.md#demographic-selection-and-review)
records the twelve populations, 36 directly published cells, definitions and
independent source gate.

The URL
`?view=demographics&dimension=age&population=age-18-29`
uses the source ID `age-18-29`; `&format=list` preserves the same values and
sources. State includes `view`, `group: null`, `dimension`, `population` and
`format`. Invalid dimensions fall back to age; invalid or incompatible
populations fall back to the selected dimension's first population.
Invalid/duplicate/incompatible parameters are corrected visibly.
Browser history replays dimension, population and format. Switching back restores
an in-memory affiliation focus; a fresh demographic deep link has none.

Use semantic tables and a fixed 0-100% scale within the selected population.
Show the subgroup denominator next to every comparison and retain it in chart,
list, static fallback and deep links. Nonresponse stays in the denominator;
retain its published note without a fabricated bar. Static
`#static-demographics-{populationId}` details carry the same tables, denominators
and citations without JavaScript.

### Comparison viewport zoom and pan

Attendance and demographic charts keep a bounded, independently scrollable
viewport. Real two-pointer pinches zoom the chart from 100% to 400% around the
gesture midpoint, while one-pointer drags pan it. Labels, values, bars and axes
enlarge together; the scale and denominators do not change. Thresholds never
acquire a fabricated bar or slice.

Zoom out/in and **Fit chart** buttons, plus `+` (also `=`), `-`, `0` and arrow
keys when the chart region itself is focused, provide non-gesture alternatives.
Ctrl/Cmd+wheel zooms only over the chart; browser page zoom remains available
outside it. Source disclosures retain native keyboard/click behavior.
Gestures suppress accidental drill-ins, including pointer cancellation and
two-to-one-finger transitions.

During a visit, each comparison remembers its zoom, scroll position and open
chart source notes across detail navigation, browser history and List switches.
Affiliation navigation also restores open source notes and Info.
List removes chart zoom/pan behavior without changing estimates or sources.
Reloads start at a fitted chart; zoom is presentation state, not a URL/data filter.

### Accessibility, fallback and responsive acceptance

Use semantic text and native links/buttons in a consistent tab order, visible
focus and a heading describing the selected group. Generate static overview,
nested affiliation lists, attendance and demographic tables for no-JavaScript
access. Every occurrence retains its exact value and source row/path through
shared locators and caveats. The hidden interactive container starts empty.
Controls are progressive enhancements.

Keep names, percentages, navigation and sources usable at 320 CSS px and 200%
zoom. Wrap names, use at least 44 px targets for drill-down and primary navigation,
and allow page scroll in short landscape. Avoid hover-only instructions/tooltips.
Color supports identification alongside labels and accessible contrast.
Scale changes remain legible with animation off.

Route tests exercise both affiliation lenses/paths, attendance and demographics,
source context, the public boundary, focus, view switching, history and
no-JavaScript access. Automated browser tests cover 320px portrait, 667x375
landscape, desktop, keyboard-only interaction and a 640px CSS layout viewport
at DPR 2 equivalent to a 1280px desktop at 200% page zoom. This emulation is a
layout check, not a manual browser-zoom test. DOM/keyboard checks are not real
screen-reader testing; that manual assistive-technology check remains a release
limitation until actually performed.

## Practice, beliefs and institutional doctrine

**Implemented — Religious service attendance.** Use Pew RLS chapter 8, “Attending religious services in person,” to compare the published share reporting in-person attendance at least once or twice a month. The [attendance interaction contract](#attendance-state-and-comparison) defines its fixed-scale bar/table view. Label the denominator “Adults in each religious group.” Validation anchors include 33% for all U.S. adults, 60% for evangelical Protestants, 46% for historically Black Protestants and 34% for mainline Protestants. Transcribe only source-supported groups. Keep in-person attendance distinct from virtual participation, without assigning the parent’s answers to a denomination. [Pew chapter 8, in-person attendance](https://www.pewresearch.org/religion/2025/02/26/religious-attendance-and-congregational-involvement/#attending-religious-services-in-person).

**Follow-up — Christian nationalism (PRRI scale).** The February 17, 2026 report’s Figure 6 publishes breakdowns by PRRI affiliation among respondents to the 2025 American Values Atlas (22,111 adults, Feb. 28–Dec. 8, 2025). It uses a five-item scale about Christianity, American identity and U.S. government. An independent comparison can reproduce the five categories in the figure’s order: Adherent, Sympathizer, Skipped/Don’t Know, Skeptic and Rejecter. Show a table with the exact published values. If providing stacked bars, document any normalization of display widths for rounding; the values remain unchanged. All-U.S. anchor in that order: 11%, 21%, 4%, 37%, 27%. Preserve group names and qualifiers, e.g. White mainline/non-evangelical Protestant and Black Protestant. PRRI’s group definitions differ from Pew’s; the view needs its own selector and row bases and cannot infer Baptist or Presbyterian responses. Describe the scale and link its items and scoring. The September 2026 PRRI resistance report uses the same 2025 Atlas. PRRI’s 2026 American Values Survey Figure 19 religious affiliation comparison is a different measure, including a subgroup comparison restricted to people familiar with the term. For a standalone scale view use Figure 6, record PRRI’s applicable reuse permission for redisplaying the table or data, and keep a link-only reference until that reuse is confirmed. [2025 Atlas report, Figure 6 and methodology](https://prri.org/wp-content/uploads/2026/02/PRRI-Feb-2026-CN-in-50-states.pdf), [September 2026 resistance study](https://prri.org/research/resistance-to-christian-nationalism-in-all-50-states-2/), [2026 American Values Survey](https://prri.org/research/darkening-mood-and-shifting-political-loyalties-ahead-of-midterm-elections-findings-from-the-2026-american-values-survey/).

**Defer baptism percentages.** The 2023–24 RLS topline has no baptism measure, and this review found no recent nationally representative, comparable baptism belief or practice cross-tabs at the requested denominational granularity. The Southern Baptist Annual Church Profile counts baptisms reported through its own network. A future qualitative doctrine comparison can cite body-specific documents with separate fields for eligible recipients and mode. For example, the SBC confession teaches immersion of believers, and the Catholic Catechism describes infant baptism as an established practice. Label such a view **Official teachings** and cite each body’s document, paragraph and edition. Leave a missing doctrine entry unknown. An institutional rule or count of rites cannot establish how many self-identified adherents agree with a teaching or have been baptized. [RLS questionnaire topline](https://www.pewresearch.org/wp-content/uploads/sites/20/2025/02/PR_2025.02.26_religious-landscape-study_topline.pdf), [SBC Annual Church Profile example](https://lifewayresearch.com/wp-content/uploads/2021/05/ACP_Summary_2020.pdf), [SBC Baptist Faith and Message, art. VII](https://bfm.sbc.net/bfm2000/), [Catholic Catechism §1252, USCCB](https://www.usccb.org/sites/default/files/flipbooks/catechism/321/).

## Optional deeper institutional counts

The 2020 U.S. Religion Census (USRC) provides a separate metric for later exploration. On ASARB’s interactive tables page download the June 23, 2023 update of **Group Detail Data by Nation, State, County, and Metro**. Use the national group detail only, check the posted errata and the publisher’s Appendix A definitions (including variations by body), and verify identifiers and cells against the published national table. The collection covers participating religious bodies, with 372 covered for congregations and 217 for adherents. Adherents can include children and other regular participants and may be estimated. Missing counts are distinct from zero. The national data list individual bodies, including the Orthodox Presbyterian Church (ID 335, 336 congregations, adherents unreported in Table 1), that may appear in the survey taxonomy without a comparable decimal national survey estimate.

Keep it in an independent **2020 congregations and adherents** view if approved. Show institution counts directly, or explicitly label a share of a documented reporting universe (e.g. “share of reported congregations among included participating bodies”). If using congregations as the metric, keep adherent counts out of its hierarchy. Maintain a reviewed affiliation crosswalk with distinct records for unmatched, ambiguous and overlapping organizations. ASARB’s FAQ allows download and use in studies, reports and analyses, and reserves reposting or distributing the data itself. Obtain written confirmation for the selected public interactive republication, including public Git files and browser-delivered JSON, before adding national rows to the repository or site. Until then link to the publisher’s workbook. [Download and errata](https://www.usreligioncensus.org/interactive-tables), [national workbook](https://www.usreligioncensus.org/sites/default/files/2023-06/2020_USRC_Group_Detail.xlsx), [2020 report and coverage](https://usreligioncensus.org/sites/default/files/2023-10/2020_US_Religion_Census.pdf), [group definitions](https://www.usreligioncensus.org/sites/default/files/2023-03/Appendix_A--Definitions%2C_Procedures%2C_and_Comments.pdf), [ASARB reuse FAQ](https://www.usreligioncensus.org/node/43).

## Citation and attribution acceptance

Every chart, drill-down and corresponding list or table must keep compact visible source credit/direct links and the Pew notice. Keep the measure and named population or denominator next to the comparison; supporting publication/fielding dates, locators, methods and disclaimers remain accessible through Info and source disclosures rather than repeated in each row. Keep the credit in the view when a visitor zooms or opens a deep link. Show applicable thresholds and partial coverage beside the affected estimates and link to the relevant methods, survey coding and questionnaire. For practice and beliefs, give the question or scoring method and response definition in the methodology, with a direct locator to the instrument. Use accessible text and keyboard-focusable links so the same context is available in screen readers, the List view and the static fallback.

Each displayed figure must resolve to its source row, or to a panel source when all rows share the same source and a row/column mapping is documented. Where a panel mixes report and interactive rows, make each row’s source reachable from that panel. For calculated values, preserve both source inputs and the formula, precision and display rounding. The review checklist covers a source trace from each release view, review of denominator and threshold labels in deep links, and verification of required notices and reuse decisions in the generated output.

## Implementation and acceptance

1. **Record the source excerpt.** Create a small, manually curated route-local input with stable record IDs, source names and locators (page/table/row/column or interactive path), source and display labels, survey wave, metric, geography, denominator ID, estimate status/value/precision, and checked date. Model the two affiliation trees as references to those records. Reuse identical estimates and keep separately scoped family intersections distinct. Mark whether a group has selected detail. Check files into Git only for the selected published aggregates with a recorded reuse decision. Pew’s site terms allow attributed excerpts subject to applicable notices, no implied endorsement, and restrictions on mirroring, cataloguing or republishing principal parts. Curate an original visualization from selected estimates, retain attribution, and link readers to the full Pew tables. If a planned excerpt approaches a principal part, trim the selection or seek permission. If later using a Pew survey dataset, follow its dataset terms, including required disclaimer and excerpt limits. [Pew Terms of Use, §§2, 3 and 13](https://www.pewresearch.org/about/terms-and-conditions/).
2. **Make extraction reproducible.** Open the dated report, transcribe the 2023–24 columns on pp. 85–87, and compare family totals and named anchors against pp. 25 and 30. Open the national interactive, explicitly choose 2023–24, and record each additional row’s entire hierarchy and published string. Check denomination routes against Appendix B. For attendance transcribe the in-person monthly measure from chapter 8. Have a second reviewer reconcile the selected values and every qualifier against the pinned locators. Record source revisions and mapping decisions alongside the inputs. No network request is needed when building or opening the page.
3. **Maintain the route.** `build.cjs`, `view.js` and `controller.js` implement the route; site configuration and the existing home builder provide public registration and discovery. Commit source builders/templates and route-local assets, not ignored generated pages or bundles. Keep internal inputs/tooling outside the public projection. Include source and methodology links adjacent to the relevant view or within its methodology.
4. **Validate inputs and output.** Test unique IDs, acyclic valid parents, one occurrence of each row per supported branch, no aggregate/child overlap among siblings, valid source locators and estimates, stable sort order, and compatible year/metric/denominator for every affiliation edge and derived value. Reject implausible figures (including a child larger than its parent outside possible rounding). Assert that a censored/missing row yields no numeric slice, bar or ratio, a partial panel introduces no inferred residual estimate, and national and conditional labels use the correct denominator. Check the pie's coverage hatch and rounded-overflow caption separately. Assert the named Baptist and Presbyterian check values, the three nationally based tradition rows and the attendance anchors above.
5. **Verify the experience.** On desktop and mobile, open Baptist, zoom out, then open Presbyterian. Check the tradition lens’s Mainline route, Reset, reload of a deep link, browser Back/Forward, invalid URLs and the chart/list equivalence. Repeat the drill-down by keyboard only, with a screen reader and with JavaScript disabled. Check 320 px portrait, 667×375 landscape, desktop widths and 200% zoom for clipping, focus, touch targets and label wrapping. Verify attendance never inherits affiliation zoom. Inspect generated HTML and the home card, run `npm run build`, `npm run check`, and the route tests, and verify the implementation carries no timeline diff.

The implemented route includes both affiliation groupings, the named Baptist and Presbyterian paths, home discovery, sourced attendance and demographic comparisons. Preserve these acceptance paths when maintaining it. The deferred measures can proceed as independent follow-ups when their stated source and reuse requirements are met.
