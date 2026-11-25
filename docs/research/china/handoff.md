# Research-to-timeline handoff

**Research remediation; existing public selection unchanged.** Current main
already implements `/china-history/`; the earlier handoff's future-only claim
was stale. The expanded packet stays under `docs/research/china/`, outside
`data/sets/` and public allowlists. This work neither redesigns the renderer
nor automatically imports the additional research.
Use [country-church-history](../../../.github/skills/country-church-history/SKILL.md)
and its [audit companion](../../../.github/skills/country-church-history-audit/SKILL.md).

## What is ready and what is not

The [synthesis](synthesis.md), [79-row chronology](chronology.md),
[entity/relationship register](entities.md), [passage index](sources.md) and
[coverage review](coverage.md) provide a linked research foundation. H04/H06
are still explicit gaps and several other
rows are provisional. Entity containers, unresolved dates and rejected
relationships **must not be bulk-imported**.

The audit includes real findings but only writer self-review. It is not
independent historical approval. Resolve claim-specific priority-A problems
before importing affected records; visibly retain residual uncertainties.
The last verified event is October 2024, not a certified 2026 current state.
The [applied audit](audit.md) retains independent answers, precise sources,
before/after findings and residual questions. Its 25 added chronology rows
cover more than the six supplied names: Yuan households/formation, beatas,
mission/relief methods, hymnody, local translators, women educators, revival,
dissent and theology. More local-language scholarship, Chinese Catholic
perspectives, medieval epigraphy and non-mission sources remain important.

## Current public crosswalk and remaining selection

The canonical [editorial input](../../../china-history/data.cjs) contains
**45 selected records from H01-H54**, including gap records H04/H06.
Its `held` object disposes of nine original rows:
H07, H11, H19, H28, H37, H40, H43, H50 and H52. These are not all the same
reason: H11 is supporting context outside the roster; H19 has source/date
qualification; H50 is a measurement comparison, not a dated milestone.
The exact remaining reasons are in that object, not inferred from absence.

The [shared builder](../../../scripts/build-country-history.cjs) emits
[public-data.js](../../../china-history/public-data.js) and
[HTML articles](../../../china-history/index.html) with the same stable public
slugs but strips research crosswalk fields and held records.
The [shared controller](../../../country-history/controller.js) searches title,
summary, caveat and aliases, and filters lane/date; it does not search the
research packet or add historical figures from citation metadata.
Thus missing records cannot be fixed by changing aliases or filters alone.

| Research/public boundary | Exact current representation | Next selection work, not an automatic import |
| --- | --- | --- |
| New H55-H56, Yuan communities/worship | H04 -> `tang-yuan-gap`; H05 -> `montecorvino-report`; no Sawma/Marignolli record | Review C40-C41 and distinct E43-E46; preserve retrospective period dates, coexistence and unbridged gaps. Quanzhou remains unverified. |
| H57, beatas; H58/H71, local/shared hymnody | No public counterparts; H10 `xu-ricci-euclid` and H54 `chinese-union-version` are different projects | Select bounded forms of ordinary worship/agency, not a single new denomination. Withhold hymn counts/assets; preserve multiple contribution dates. |
| H59-H63/H69-H70/H72/H75-H77, five mission/revival/dissent figures | No Taylor, Moon, Richard, Sung or Wang record or search alias; H18 `morrison-guangzhou`, H24 `yu-prayer-school`, H39 `national-tspm` do not cover them | Review C44-C50/C59, Chinese coworkers/local agency, different mission strategies and dissent. Do not equate independent itineration with corporate split or influence with house-church ancestry. |
| H64-H67, Miao language networks | No public counterpart; H54 CUV is not minority-language coverage | Review local initiation, missionary power, translation stages, original-language checking and privacy; no present meeting details or generalization to every Miao/Hmong variety. |
| H68/H73-H74, Wu/Ginling | H37 remains explicitly held, not UI-hidden | Read C57 alongside C37; distinguish archive narrative from diaries, exile from Nanjing relief, educational combination from church merger. No rescue tally. |
| H78-H79/E59-E60, Ding/theology/training | H46 `china-christian-council` and H47 `document-nineteen` have institutional/policy context only | Review C52-C54 beside dissent/C49; retain institutional perspective and speech/decision/testimony dates. Full seminary genealogy remains unresearched. |
| E69-E71/R40-R41, Orthodox identities | H41 `orthodox-autonomy-dates`; H28/H43 held | Existing uncertain 1956/1957 date is not false precision to "fix." New translation adds named bishops and unheld election, not independent jurisdictional approval. Seek competing accounts/direct acts. |
| D07-D09, retention/gender/geography | H50 held; no public population chart | Require explicit measures, conditional denominators, dates, methods and geography before any chart. A venue snapshot and survey transitions cannot become a growth curve. |

H55-H79 are **new research not yet selected**, separate from the nine original
held dispositions. The existing public validator's complete roster is H01-H54;
it is not a completeness test for the expanded packet. A later selection must
explicitly reconcile that contract and relevant tests rather than silently
loosening validation. Public Info/selected caveats still describe some subjects
as needing research; distinguish their now-partly-researched packet state from
remaining omissions when that public copy is next revised.

## Preserve the implemented experience without forcing its ontology

The existing [second timeline guide](../../second-historical-timeline.md)
describes shared exploration, proportional versus compact lineage,
vertical/horizontal layouts, search, filters, profiles and source disclosures.
The China route already reuses its proportional vertical/horizontal renderers
with parallel lanes, sourced text, accessible disclosures and no lineage edges.
Preserve that interaction vocabulary, source access and viewport/filter/zoom
behavior. Research remediation does not call for a new renderer.

The global [denomination model](../../architecture/data-model.md) is not the
route's country-history editorial contract. Keep these distinctions when
selecting further research:

| Research requirement | Existing distinction | Later selection gate |
| --- | --- | --- |
| 635 narrated in 781; 1924 institution reported in 1947 | China events already distinguish `date`, `testimony` and citation locators | Retain event/testimony/edition distinctions for new episodes. |
| Years, months, days, approximate periods and competing bases | China uses precision-aware date strings/kinds and unknown bounds | Do not invent midpoint plot dates, January 1 or terminal years for H55/H56 or other approximate evidence. Validate against existing historical-date helpers. |
| Gap between episodes, not an ending | H04/H06 are unplaced gap records, not lifespans | Preserve gaps and distinguish last attestation from extinction. New Yuan evidence does not close either bridge. |
| Persons, texts, councils, missions, jurisdictions, associations and denominations | Selected China records are episodes, not denomination nodes | E12/E13/E40 and new analytical networks cannot become corporations by import. Select the supported event/project, not an imagined national parent. |
| Cooperation, ordination, jurisdiction, contact, translation and context | Public China relations are contextual and explicitly not lineage; renderer edges empty | Reuse that separation; leave unsupported or unencodable links in attributed narrative, never force a treaty/training relation into origin/split. |
| Catholic civil status and communion; Orthodox jurisdiction at different times | Simple tree/type labels flatten multiple dimensions | Time-bound the classifications and attribute authority. Do not draw a permanent two-Catholic-church split or accept disputed jurisdiction as neutral. |
| 1927 church union and later regional continuations | Multi-parent graph possible, but partner identities not researched | Obtain all immediate partners, intermediates, dissenters and effective accession evidence before adding merger edges. |
| Changing borders, imperial networks and distinct jurisdictions | Route scope/geography is explanatory prose; lanes are not territorial maps | Distinguish event place, jurisdictional claim, state setting and chosen scope. Do not apply a modern map polygon to all eras. |
| Source family, translated passage, archival finding aid and unread lead | Source/citation fields can cite, but do not inherently encode inspection depth/dependence | Preserve source IDs, citation locators, accessed date, verified extent, perspective and dependency notes. Never mark search-only records as passage-approved. |
| Incompatible demographic series | Existing China selection has no population chart | Keep D01-D09 as attributed comparisons; any later chart needs measure/universe/year/geography/method fields and visible caveats. No spliced growth line. |
| Evidence/interpretive uncertainty and acknowledged missing research | Filled profiles can look comprehensive | Carry review disposition and gap links into accessible Info/profile detail; keep critical uncertainty visible near the event. |

The implemented parallel lanes/episodes are display organization, not institutions.
A national all-roots trunk would contradict the reviewed evidence.

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
8. Only after separate public-selection authorization: update the existing
   China editorial contract/crosswalk and generated outputs, not a denomination
   set or duplicate route. Build the release, check source resolution,
   run relevant model/data/site/browser checks in the prescribed environment,
   and inspect both timeline orientations, mobile/desktop and keyboard profiles.

## This stage's isolation boundary

The only intended repository changes are this research packet, the reusable
skill, and a contributor-facing README link. `site.config.json`, `data/`,
public assets, explorer implementation, generators and generated pages remain
unchanged. The site build should contain none of this research text or the
skill, and no new China set. PR checks can prove that staging boundary, not the
truth or completeness of a historical interpretation.
