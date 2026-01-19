# Data Collection Plan: European Presbyterian Roots (Pre-PCUSA)

## Purpose
Collect and normalize the European antecedents that feed into American
Presbyterian lineage, tracing back to the origins of Presbyterian polity and
its founding context, using the notes-first workflow, then convert to JSON for
the ChurchTree data model.

## Scope (initial list)
Core roots:
- Reformed tradition in Switzerland (e.g., Zwingli/Zurich stream)
- Reformed tradition in Geneva (Calvin)
- Scottish Reformation / Church of Scotland
- Presbyterian polity emergence in Scotland
- Presbyterian migrations to the American colonies
 - Founding context of Presbyterian polity (first formal presbyteries/synods and key founding figures)

Key precursor bodies (as applicable, verify dates/structure):
- Reformed churches in Switzerland (as movement nodes)
- Reformed Church in Geneva (movement/denomination node)
- Church of Scotland (denomination node)
- Scottish Presbyterian dissenting movements (if directly connected)

Optional early additions:
- Dutch Reformed influence (where directly connected to early American Presbyterianism)
- English Puritan/Presbyterian influence (where directly connected)

## Sources strategy
Primary sources:
- Official church history archives (Church of Scotland, Reformed Church histories).

Secondary sources:
- Academic or encyclopedia entries for dates and polity development.
- Histories of Presbyterianism in America that trace European roots.

Source rules:
- At least one source per major claim (date, split/merge, parent).
- Capture precise locators (section titles, page numbers, URL fragments).

## Workflow (notes-first)
1. Create notes file per denomination/movement:
   - `data/sets/presbyterian-europe/notes/[slug].md`
   - Use `data/sets/presbyterian-europe/notes/template.md` (create if missing).
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
Phase A: Foundational Reformed origins
- Swiss Reformation (Zurich), Geneva/Calvin, Scottish Reformation

Phase B: Presbyterian polity development
- Church of Scotland and key polity milestones

Phase C: Transatlantic transmission
- Migration and institutional transmission to colonial America

## Deliverables
- Notes files for each root movement/denomination.
- Updated JSON datasets.
- Updated citations for split/merge reasons.

## Checklist
- [ ] Create notes files for each root movement.
- [ ] Extract facts with citations into notes.
- [ ] Convert notes to JSON and validate ids.
- [ ] Add lineage edges to US Presbyterian roots where sourced.
- [ ] Rebuild `data/data.js` and run QA.
