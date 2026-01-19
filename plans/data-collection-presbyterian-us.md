# Data Collection Plan: US Presbyterian Denominations

## Purpose
Collect and normalize lineage data for US Presbyterian denominations using the
notes-first workflow, then convert to JSON for the ChurchTree data model.

## Owners
- Codex (current run)

## First batch targets
- Phase A (core lineage)

## Initial sources (seed list)
- Wikipedia pages for each scoped denomination (dates, split/merge summaries).
- Official denominational history pages (when available).
- Encyclopedias or denominational histories for split reasons.

## Scope (initial list)
Core lineage cluster:
- Presbyterian Church in the United States of America (PCUSA, 1789)
- Presbyterian Church in the United States (PCUS)
- United Presbyterian Church in the United States of America (UPCUSA)
- United Presbyterian Church of North America (UPCNA)
- Orthodox Presbyterian Church (OPC)
- Presbyterian Church in America (PCA)
- Evangelical Presbyterian Church (EPC)
- Associate Reformed Presbyterian Church (ARP)
- Reformed Presbyterian Church of North America (RPCNA)
- Reformed Presbyterian Church, Evangelical Synod (RPCES)

Optional early additions:
- Bible Presbyterian Church (BPC)
- Cumberland Presbyterian Church (CPC)
- ECO: A Covenant Order of Evangelical Presbyterians (ECO)

## Sources strategy
Primary sources:
- Denominational official sites and historical centers (when available).

Secondary sources:
- Wikipedia and Encyclopedia entries for dates and basic lineage.
- Books or denominational histories for split reasons and context.

Source rules:
- At least one source per major claim (date, split/merge, parent).
- Capture precise locators (section titles, page numbers, URL fragments).

## Workflow (notes-first)
1. Create notes file per denomination:
   - `data/sets/presbyterian-us/notes/[denomination-slug].md`
   - Use `data/sets/presbyterian-us/notes/template.md`
2. Extract facts using `docs/spec/data-collection-prompt.md`.
3. Record sources and citations in the notes file.
4. Review notes for gaps and contradictions.
5. Convert notes to JSON using `docs/spec/data-collection-json-conversion.md`.

## JSON update order
1. `data/sources.json`
2. `data/citations.json`
3. `data/nodes.json`
4. `data/edges.json`
5. `data/events.json`

## Validation checklist
- Every edge references valid node ids.
- Every citation references an existing source.
- Edge names describe the reason for split/merge.
- Dates are integers or null with notes.
- Distinctives recorded where sourced.

## Phases
Phase A: Core lineage
- PCUSA (1789), PCUS, UPCUSA, UPCNA, OPC, PCA

Phase B: Conservative Reformed branches
- RPCNA, RPCES, ARP

Phase C: Modern divergences
- EPC, ECO

Phase D: Historical branches
- CPC, BPC

## Deliverables
- Notes files for each denomination.
- Updated JSON datasets.
- Updated citations for split/merge reasons.

## Checklist
- [ ] Create notes files for all scoped denominations.
- [ ] Extract facts with citations into notes.
- [ ] Convert notes to JSON and validate ids.
- [ ] Update unknowns and size estimates.
- [ ] Rebuild `data/data.js` and run QA.
