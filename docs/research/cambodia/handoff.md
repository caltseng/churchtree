# Cambodia research-to-timeline handoff

## Authorization and model

The assignment separately authorizes public implementation after research under
the [country-history skill](../../../.github/skills/country-church-history/SKILL.md).
The [historical coverage standard](../../spec/historical-coverage-standard.md),
[data model](../../architecture/data-model.md), [date/model guide](../../second-historical-timeline.md)
and [publication boundary](../../public-site-boundary.md) remain binding.
This packet remains outside `data/sets/` and `dist/`.

China's actual packet and `/china-history/` provide the schema/UX precedent:
dated original summaries, testimony distinct from events, visible credit,
native evidence disclosures, precise date bounds, display lanes and text
fallback. China's ancient/imperial chronology is not imposed on Cambodia.
The Cambodia episode roster covers 1555-1556 through **2025-06-28**, not an
unchanged national church lifespan. No compact-lineage option or institutional
graph edges are appropriate to this evidence.

## Conversion contract

`cambodia-history/data.cjs` is canonical editorial input. KH01-KH50 from
chronology.md must appear exactly once as a selected event's `research` value or
in `held`. Every source/claim citation has a precise source locator. C01-C38
map to public citation IDs `c01`-`c38`; S01-S18 to `s01`-`s18`.
The generated projection strips `research`, `held`, and the evidence roster.

42 selected rows: KH01-KH02, KH04-KH06, KH08-KH09, KH12-KH25,
KH27-KH43, KH45, KH47, KH49-KH50.
Eight held: KH03, KH07, KH10, KH11, KH26, KH44, KH46, KH48.
The held ledger gives reasons; neither UI filters nor full public completeness
are implied. Exact stable fragment slugs live alongside each KH crosswalk in
canonical data and are checked against generated HTML.

No midpoint for 1555-1556 visit, no January 1 fillers, no exact early-1970s
conversion date, no single Salas death year, no department foundation inferred
from the 1975-06-02 report. The broad 1970-1975 Bunong window explicitly says
"early 1970s" and its limits are a political bracket. 1975-1979 and 1979-1990
are period records, not church lifetimes. Last-event horizon is source-derived,
not the retrieval date. The 2025 appointment is not ordination or completed
succession.

Public links connect translation restart/publication and Methodist joint
mission/later denomination as **cooperation**, not biological trees or inferred
institutional descent. Every immediate Methodist agency is named. The research
relationship register preserves additional contexts and rejected edges rather
than forcing unsupported relation types into the renderer.

## UI and build boundary

The global landing card opens `/global-church/`, generated from the
`countryHistories` registry. Only available country routes are registered;
parallel Thailand work adds itself after rebasing onto the shared mechanism.
China's existing URL, fragments and editorial output remain valid.

`scripts/build-country-history.cjs` projects approved fields and generates the
same progressive article/evidence structure used by China. Cambodia references
the existing country controller and CSS in `china-history/`. The controller
accepts generic country data while retaining China's global variable. Shared
date, vertical/horizontal timeline, search, filters, theme/settings and accessible
details controls remain unchanged.

Only generated Cambodia `index.html` and `public-data.js` are allowlisted;
template, canonical input, builder, validator, tests and docs are not copied.
No research data enters the denomination bundle. Both generated output and
generator are committed. No new dependency or copied image/text asset is needed.

## Review and validation gates

Writer self-review dated 2026-11-24: inspected source passages/access extents,
claim/date distinctions, tradition scope, all 50 research dispositions,
relationship endpoints, demographic incompatibilities, and privacy/reuse.
This is not independent scholarly review or the later requested audit.
Substantive per-unit findings and unanswered questions are in coverage.md.

Automated checks enforce roster/evidence integrity, chronological precision,
public-field projection and research isolation. Browser journeys follow Home ->
The global church -> Cambodia, exercise both orientations at desktop, mobile
portrait and short landscape, keyboard selection, evidence disclosure, filters/
zoom preservation, fragment reload, no-JS and no-D3 fallbacks. China journeys
remain in the release suite. Validation uses the assigned checks environment;
actual results and material limitations belong in the PR, not inferred from
this statement of gates. Emulation is not physical-device accessibility testing.

The dependent audit should first independently answer substantive historical
questions, then compare this exact KH/C/public crosswalk. Prioritize minority
and other denominational histories, Khmer scholarship, Catholic laywomen,
primary jurisdiction/constitution documents, census methods and post-2023 law.
