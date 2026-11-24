---
name: country-church-history
description: Research the history of Christianity in a specified country or historical region, producing passage-verified synthesis, chronology, entities, relationships, provenance, uncertainties, and a research-to-timeline handoff without publishing a dataset or interface.
---

# Country church history

Use for a country-specific historical foundation, or to audit one before a
timeline is implemented. A country is a research boundary, not a church body.
Do not assume its Christian histories form one institutional tree.

For an existing packet or public selection, use the complementary
[country-church-history-audit](../country-church-history-audit/SKILL.md) sequence:
retain independently researched historical answers before repository comparison,
repair the underlying research, and re-audit exact research/public mappings.

## Inputs and authorization

Establish `country_or_region`, `historical_geography`, `period`, `as_of_date`,
`traditions`, `exclusions`, and `delivery_scope`. State reasonable assumptions
when the assignment leaves them open. Distinguish the research/retrieval date
from the latest period actually supported by sources.

Read `AGENTS.md`, `docs/spec/historical-coverage-standard.md`,
`docs/spec/data-audit-checklist.md`, `docs/architecture/data-model.md`, and
`docs/second-historical-timeline.md`. Follow any narrower directory instructions.
Use existing research conventions: dated natural-language evidence notes,
stable record IDs, sources and claim-specific citations, followed by reviewed
conversion. Do not equate complete fields with complete history.

Unless separately authorized, stage under
`docs/research/<country-slug>/`, outside `data/sets/` auto-discovery and outside
the public folders/files in `site.config.json`. Do not add a route, home card,
production data, generated source bundle, or copied asset. Link the handoff to
this skill and the applicable repository standards.

## Research method

1. **Define historical units and borders.** Separate churches, missions,
   movements, councils, states, people, texts, places, and display lanes.
   Record changing sovereignty and historical place names without projecting
   present national borders or ethnic identities backward. Explain the treatment
   of dependencies, disputed territories, colonial enclaves, diaspora, and
   cross-border activity. Explain whether "first" means first surviving evidence,
   first reported arrival, first congregation, or legal organization.
2. **Inventory traditions and indigenous agency before choosing a storyline.**
   Examine relevant Eastern and Oriental Orthodox, Church of the East, Catholic,
   Protestant, independent and other self-identified Christian histories; mark
   non-applicable traditions explicitly rather than inventing representation.
   Include women, lay networks, translation/printing, local clergy, revival,
   education and social action where consequential. Do not present one mission,
   European denomination, capital city, or state-approved body as the whole.
3. **Discover and follow evidence.** Start with reputable historical scholarship,
   university/library catalogs, archives, museums and institutional collections.
   Search local-language scholarship/material and established name variants.
   Follow scholarly references to primary documents or editions. Institutional
   and confessional histories establish their own stated positions, not neutral
   explanations of opponents. State language/translation and access limits.
4. **Read the cited passage.** Record author, title, publisher, publication date,
   stable URL/DOI/catalog reference, exact page/section/paragraph and access date.
   Record what was actually inspected: full passage, edited translation, abstract,
   catalog metadata, or search extract. A catalog, search snippet or inaccessible
   book cannot substantiate an unseen passage. Retry a lawful public edition if
   useful; otherwise retain a research gap. Never fabricate a page or citation.
5. **Verify claim by claim.** Write an original paraphrase and assign a citation
   ID to each date, identity, institutional transition or causal assertion.
   Compare independent scholarship or the other party for contested claims.
   Trace dependence: copies of one inscription, a translation and its original,
   syndication, or two pages in one report are not independent corroboration.
   Preserve source errors and explain corrections using stronger evidence.
6. **Keep time honest.** Store supported year/month/day as text, ranges as ranges,
   and unknown bounds as unknown. Distinguish event date, retrospective testimony,
   commemoration, calendar conversion, founding, recognition and operational
   beginning. Preserve competing dates and date bases. Do not fill January 1,
   a mid-range year, or a terminal date just to satisfy the current renderer.
7. **Separate relationships from chronology.** Require evidence for each
   institutional origin, continuation, split or merger, including all immediate
   partners and intervening bodies. Record mission contact, personal affiliation,
   influence, cooperation, jurisdiction, suppression and political context
   separately. Never manufacture a lineage across disappearance or evidence gaps.
   Shared belief, a founder's prior membership, sequence, and the same place/name
   are not succession evidence.
8. **Handle estimates and disputes explicitly.** Preserve publisher, publication
   and reference dates, geography, age universe, denominator, definition,
   method, rounding and uncertainty. Compare only like measures. Do not average
   incompatible counts, extrapolate growth, or turn a source's self-reported
   membership into an independently verified demographic fact.
9. **Publish only original research prose and attributed links.** Record
   item-specific license, required credit and permission status for every
   proposed asset. Access is not permission; neither an old underlying work nor
   an open-access article necessarily licenses a modern scan or third-party
   photograph. Default to no copied images, scans, long quotations or
   translations. Research public historical/institutional material, not private
   personal data. Do not aggregate identifying information, meeting locations,
   rosters or contact details of vulnerable contemporary communities.

## Reusable output contract

Keep the packet small enough to maintain; Markdown tables or TSV are sufficient.
No new dependency, scraping system or demonstration second country is needed.

| Output | Required contents |
| --- | --- |
| Scope and original synthesis | Geographic/temporal boundaries, original era-based account, visible citation links, historical units, traditions, exclusions and as-of/coverage dates |
| Annotated chronology | Stable ID, supported date/bounds and precision, date kind/basis, testimony date, geography, actors/tradition, original claim, citation IDs, uncertainty and review status |
| Entities and aliases | Stable ID, unit/type, source-established names/scripts/spellings, scope, formation/development/ending or applicable gaps, citation IDs |
| Relationships | Separate stable ID, endpoint IDs, precise type/direction, date basis, supported wording, citation IDs and disposition; include rejected tempting edges |
| Source/citation index | Bibliographic metadata, stable links, precise passage locators, access date, inspected extent, perspective/dependence, claim support and reuse terms |
| Uncertainty/coverage log | Affected IDs, competing claims, missing nodes/relationships/episodes, overbroad identities, priority, disposition, needed evidence and next action |
| Review and handoff | What the writer actually checked, substantive per-unit findings, tradition balance, unresolved limitations, reuse decisions, renderer/schema gaps and implementation gates |

Use the repository's dispositions: covered within stated scope, missing research,
intentionally out of scope, not applicable, present but UI-hidden, and
unsupported/conflicted. Proposed records remain proposals; only label
present-but-hidden after checking raw records, bundle and UI. A historical
episode or document need not become a denomination node.

## Review and handoff gate

- Reopen the cited passages and test whether each claim and date follows.
  Correct overstatements, not just broken links. Record unverified leads apart
  from evidence admitted to the chronology.
- Audit each unit's origins/agency, formation mechanism, later development,
  beliefs/documents, incoming/outgoing divisions, merger partners/intermediates,
  continuation/end and evidence limits. Supply a specific question for each
  missing applicable category. No universal merger tree is implied.
- Record a separate missing-neighborhood and tradition-balance register.
  Prioritize ancestry-distorting gaps A, major in-scope omissions B, optional
  breadth C. Do not silently downgrade gaps to "not applicable."
- State who reviewed, when, exactly what was read and remaining limitations.
  Writer self-review is not independent scholarly review. Do not claim approval
  merely because mechanical checks pass.
- Explain reuse of the existing denomination timeline's model, layouts, search,
  profiles, provenance and accessible controls, while identifying incompatible
  units, discontinuities, uncertain dates, multiple geographies and non-lineage
  relationships before conversion.
- Run existing checks appropriate to changed files. For a research-only packet,
  check local documentation links and record/citation consistency; if validating
  the build, verify the packet is absent from `dist/` and production bundles.
  Use the task's prescribed environment. Do not introduce tooling just to audit
  a static packet.
- Deliver according to repository PR/review rules. Research readiness is not
  visualization readiness: separately authorize, validate and review any later
  import or interface.
