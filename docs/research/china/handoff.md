# Research-to-timeline handoff

**Research stage only.** This packet does not authorize or implement a China
visualization, route, home card or production data import. Keep it under
`docs/research/china/`, outside `data/sets/` and all public directories.
The reusable method is
[country-church-history](../../../.github/skills/country-church-history/SKILL.md).

## What is ready and what is not

The [synthesis](synthesis.md), [54-row chronology](chronology.md),
[entity/relationship register](entities.md), [passage index](sources.md) and
[coverage review](coverage.md) provide a linked research foundation. H04/H06
are explicit gaps and several other
rows are provisional. Entity containers, unresolved dates and rejected
relationships **must not be bulk-imported**.

The audit includes real findings but only writer self-review. It is not
independent historical approval. Resolve claim-specific priority-A problems
before importing affected records; visibly retain residual uncertainties.
The last verified event is October 2024, not a certified 2026 current state.
More local-language scholarship, Chinese Catholic perspectives, medieval
epigraphy and non-mission sources are especially important.

## Reuse the denomination experience without forcing its ontology

The existing [second timeline guide](../../second-historical-timeline.md)
describes shared exploration, proportional versus compact lineage,
vertical/horizontal layouts, search, filters, profiles and source disclosures.
Reuse that interaction vocabulary, profile evidence links, accessible controls,
and viewport/filter/zoom preservation. Do not fork another custom renderer
merely because the subject is a country.

The [current model](../../architecture/data-model.md), however, is primarily
for denominations/movements and dated lineage. It is not already a complete
country-history model:

| Research requirement | Existing mismatch | Later implementation decision/gate |
| --- | --- | --- |
| 635 narrated in 781; 1924 institution reported in 1947 | One integer year does not encode event versus testimony or inspected edition | Preserve event date, attestation/publication date and evidence basis separately; show their distinction in profile/chronology. |
| Years, months, days, approximate periods and competing date bases | Finite integer `start_year` required for published nodes; no interval precision contract | Do not invent plot years or round disputed dates silently. Events may have null years, but node null starts fail current validation; design uncertain/undated origin handling before import. |
| Gap between episodes, not an ending | A drawn line or filled lifespan suggests continuity | Use discontinuous episodes/gaps without asserting an extinction date; distinguish last attestation from end. |
| Persons, texts, councils, missions, jurisdictions, associations and denominations | Node `kind` is denomination/movement; event model is also limited | Choose supported historical units before schemas. People can be sourced profile figures; texts can be key documents; contextual events need not become lineage nodes. E12/E13/E40 cannot be imported as corporations. |
| Cooperation, ordination, jurisdiction, contact, translation and context | Edge enum is origin/split/merge/continuation/influence | Do not force a treaty or training relation into `origin`/`split`. Separate contextual evidence relations or leave in narrative until a reviewed contract exists. |
| Catholic civil status and communion; Orthodox jurisdiction at different times | Simple tree/type labels flatten multiple dimensions | Time-bound the classifications and attribute authority. Do not draw a permanent two-Catholic-church split or accept disputed jurisdiction as neutral. |
| 1927 church union and later regional continuations | Multi-parent graph possible, but partner identities not researched | Obtain all immediate partners, intermediates, dissenters and effective accession evidence before adding merger edges. |
| Changing borders, imperial networks and distinct jurisdictions | Region is a string, not historical geography | Distinguish event place, jurisdictional claim, state setting and chosen scope. Do not apply a modern map polygon to all eras. |
| Source family, translated passage, archival finding aid and unread lead | Source/citation fields can cite, but do not inherently encode inspection depth/dependence | Preserve source IDs, citation locators, accessed date, verified extent, perspective and dependency notes. Never mark search-only records as passage-approved. |
| Incompatible demographic series | A free-text size estimate cannot enforce denominator/method comparability | Keep D01-D06 as attributed comparisons; a later chart needs measure/universe/year/geography/method fields and visible caveats. No spliced growth line. |
| Evidence/interpretive uncertainty and acknowledged missing research | Filled profiles can look comprehensive | Carry review disposition and gap links into accessible Info/profile detail; keep critical uncertainty visible near the event. |

Suggested future presentation is **parallel historical lanes/episodes**, with
true institutional relationships only where demonstrated. This is an
implementation suggestion, not a committed design. A national all-roots trunk
would contradict the reviewed evidence. A display group can organize search or
navigation but must not masquerade as an institution.

## Claim-to-record conversion checklist

1. Pick a bounded unit and read its entity, chronology, relationship, source and
   coverage entries together. Recheck aliases against existing raw set IDs,
   bundle, display groups, filters and search before claiming it is absent.
2. Resolve applicable A gaps and define formation/date kind, later development,
   beliefs/document status, divisions, merger partners/intermediates and
   continuation/end. Leave genuinely unproved successors unlinked.
3. Give actual production records stable descriptive slugs and distinct
   citation/source IDs; preserve H/E/R/C/S crosswalks in research notes. Do not
   treat this packet's cross-file IDs as an approved production namespace.
4. Verify each claim against its precise passage again at conversion. P/S/Q
   classify source access, not an automatic release approval. A primary
   participant's assertion can still require attribution or independent checking.
5. Add only supported event-year precision, geography and relationships.
   Keep gaps, estimates and disputed dates explicit; no current populations
   inferred from church promotional totals.
6. Link profile claims and visible source credits to the right locators.
   Apply copyright/asset gates independently of historical accuracy; the
   current [reuse ledger](sources.md#dependence-and-reuse-ledger) approves no
   image, scan, portrait or bulk translated text.
7. Respect contemporary-community privacy: do not convert public historical
   research into granular maps/rosters of present vulnerable communities.
8. Only after separate implementation authorization: add the production set,
   route/card as needed, build the release, check bundle/source resolution,
   run relevant model/data/site/browser checks in the prescribed environment,
   and inspect both timeline orientations, mobile/desktop and keyboard profiles.

## This stage's isolation boundary

The only intended repository changes are this research packet, the reusable
skill, and a contributor-facing README link. `site.config.json`, `data/`,
public assets, explorer implementation, generators and generated pages remain
unchanged. The site build should contain none of this research text or the
skill, and no new China set. PR checks can prove that staging boundary, not the
truth or completeness of a historical interpretation.
