# Data Collection Plan: US Baptist Denominations

## Purpose
Collect and normalize lineage data for US Baptist denominations using the
notes-first workflow, then convert to JSON for the ChurchTree data model.

## Scope (initial list)
Core lineage cluster:
- Baptist movement (colonial/early US origins)
- Triennial Convention (1814) / General Missionary Convention
- Southern Baptist Convention (SBC)
- American Baptist Churches USA (ABCUSA)
- National Baptist Convention, USA (NBCUSA)
- National Baptist Convention of America (NBCA)
- Progressive National Baptist Convention (PNBC)
- Conservative Baptist Association (CBA)

Optional early additions:
- General Association of Regular Baptist Churches (GARBC)
- Baptist General Conference (Converge)
- Cooperative Baptist Fellowship (CBF)
- Independent Baptist movement (as a movement node)

## Sources strategy
Primary sources:
- Denominational official histories and archives (when available).

Secondary sources:
- Wikipedia and encyclopedia entries for dates and basic lineage.
- Denominational histories for split reasons and context.

Source rules:
- At least one source per major claim (date, split/merge, parent).
- Capture precise locators (section titles, page numbers, URL fragments).

## Workflow (notes-first)
1. Create notes file per denomination:
   - `data/sets/baptist-us/notes/[denomination-slug].md`
   - Use `data/sets/baptist-us/notes/template.md` (create if missing).
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
- Edge names describe the reason for split/merge (including the stance of the leaving body).
- Dates are integers or null with notes.
- Distinctives recorded where sourced.
- Size estimates captured when available.

## Phases
Phase A: Foundational lineage
- Baptist movement, Triennial Convention, SBC, ABCUSA

Phase B: African-American Baptist lineage
- NBCUSA, NBCA, PNBC

Phase C: Conservative/independent networks
- CBA, GARBC, CBF, Converge, Independent Baptist (movement node)

## Deliverables
- Notes files for each denomination.
- Updated JSON datasets.
- Updated citations for split/merge reasons.
