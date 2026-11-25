# Research-to-timeline handoff

This assignment separately authorizes public selection, unlike the default
research-only [skill](../../../.github/skills/country-church-history/SKILL.md).
Use the [coverage standard](../../spec/historical-coverage-standard.md),
[audit checklist](../../spec/data-audit-checklist.md) and
[data model](../../architecture/data-model.md). Writer review is not the
later independent-sequence country-history audit.

## Boundary and selection

The packet has **44** H rows and **34** claim-locator C rows. The canonical
`thailand-history/data.cjs` selects **40** events: H01-H06, H08-H40, H44.
Its `held` ledger explicitly accounts for:

| Research row | Disposition, not public/UI-hidden |
| --- | --- |
| H07 | Post 1782 return has no checked exact event date; a reign boundary is not arrival. H06 supplies preceding rupture, not a fabricated end. |
| H41 | Early Thai Bible dates conflict within one institution; original imprints needed. |
| H42 | About 1920 suspension remains approximate; H19 includes incomplete-OT caveat. No new point date imposed. |
| H43 | 2018 EFT age 15+ count is researched comparison, not a national/current demographic milestone. |

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

## Model, build and UX contract

Reuse Cambodia's shared `scripts/build-country-history.cjs` and country
registry/selector when merged; do not make a second country-selection pattern.
Reuse China controller/CSS and the established shared timeline model/layouts.
China's public slugs and independent denomination dataset remain unchanged.
Display lanes group historical subject matter, **not ancestry**; country
chronology must never enter denomination auto-discovery.

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

Check exact 44-row selected/held accounting, unique semantic IDs, real calendar
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
ordinary worship and comparable demographics. Later audit must independently
research its answers before comparing this packet or expanding selection.
