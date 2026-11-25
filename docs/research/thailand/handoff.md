# Research-to-timeline handoff

This assignment separately authorizes public selection, unlike the default
research-only [skill](../../../.github/skills/country-church-history/SKILL.md).
Use the [coverage standard](../../spec/historical-coverage-standard.md),
[audit checklist](../../spec/data-audit-checklist.md) and
[data model](../../architecture/data-model.md). Writer review is not the
independent scholarly approval. The separate independent-sequence
[audit](audit.md) now records its pre-packet answers, repairs and limits.

## Boundary and selection

The packet has **50** H rows and **41** claim-locator C rows. The canonical
`thailand-history/data.cjs` selects **45** events: H01-H06, H08-H40, H44-H49.
Its `held` ledger explicitly accounts for:

| Research row | Disposition, not public/UI-hidden |
| --- | --- |
| H07 | Post 1782 return has no checked exact event date; a reign boundary is not arrival. H06 supplies preceding rupture, not a fabricated end. |
| H41 | Early Thai Bible dates conflict within one institution; original imprints needed. |
| H42 | About 1920 suspension remains approximate; H19 includes incomplete-OT caveat. No new point date imposed. |
| H43 | 2018 EFT age 15+ count is researched comparison, not a national/current demographic milestone. |
| H50 | June 1972 offensive-image incident/sentences in LDS institutional account; no court/news corroboration read, no image or definitive judicial finding published. |

Every event carries its H crosswalk, date kind/basis, later testimony,
critical caveat, aliases, review disposition and separate date/summary
citation arrays. Public IDs are semantic slugs, not mutable list positions.
The page's date span starts 1567 and ends 2023, while the actual national
affiliation snapshot is December 2021. Retrieval 2026 must not imply current
coverage. Paired events use bounded intervals explicitly described as
sequences/comparisons, not continuous operations.
The Adventist 1918-1919 interval uses year bounds because the organization
month is unknown; December 1918 arrival precision remains in prose/basis.
This accommodates the shared model's equal-precision bound requirement
without inventing a 1919 month.

Audit additions append, not renumber: H45/`girls-lead-village-worship`,
H46/`pa-wan-theological-training`, H47/`cheng-local-leadership-letter`,
H48/`lds-short-mission-visit`, H49/`thai-lds-text-publication`.
H47 plots **letter testimony**, not an inferred erection, appointment or
consecration day. H15/`northern-toleration-edict` retains its translated date
and now exposes Morishima's competing interpretation in C37. H48's four-month
stay does not create an exact departure date or bridge to the 1960s.
Society/Language are thematic lanes for the separately identified LDS
visit/scripture, not assimilation into Protestant ancestry or a seventh
renderer mode. All original stable public IDs remain.

## Model, build and UX contract

The route uses Cambodia's shared `scripts/build-country-history.cjs` and country
registry/selector, not a second country-selection pattern. It reuses the China
controller/CSS and established shared timeline model/layouts.
China's public slugs and independent denomination dataset remain unchanged.
Display lanes group historical subject matter, **not ancestry**; country
chronology must never enter denomination auto-discovery.
Compact lane names avoid mobile heading overlap; the scope disclosure explains
that Protestant includes independent/charismatic episodes and Society groups
people, service and state. The shorter labels do not change historical units.

There are no structural relations: the research separately records context,
teaching, union, jurisdiction, influence and rejected edges. Especially do not
bulk-import R05/R07/R09 as merger/split edges while partner/accession evidence
is missing. School/text/event/measurement units are not denominations.

Generated HTML supplies the whole selected list without JavaScript/D3.
Each event retains a visible source credit/link and critical caveat; native
details and selected profiles expose exact locator, perspective, access and
date basis. Research H/C IDs, held rows, original PDFs, data/template/build/
validation/tests and docs stay outside the public file allowlist.
No copied asset is needed.

## Conversion review and acceptance

Check exact 50-row selected/held accounting, unique semantic IDs, real calendar
bounds, all cited sources/locators, no invented point dates or lineage, and
one-to-one generated/public selection. Test claims' evidence and mechanical
schema separately. Preserve differing reference populations and names.

Run repository build/check/tests in the provisioned checks environment, then
desktop, narrow mobile portrait and short landscape in vertical/horizontal
modes, with keyboard selection, details/focus return, deep links, filters,
resize/range retention, fallback text and public privacy. Commit generator
inputs and tracked output together. Record actual results in the PR; do not
equate automation with historical review.

Remaining priority A claims are qualified or held, not smuggled into structural
edges. Priority B gaps in [coverage](coverage.md) remain real, especially
local-language testimony, southern/Isan history, independent churches,
ordinary worship beyond the added examples and comparable demographics.
The audit independently researched before comparison, then added evidence;
it did not certify comprehensive coverage or inspect every foundation source
afresh. Source-specific read extents remain binding.
