# Data Collection Plan: US Pentecostal / Charismatic Denominations

## Purpose
Collect and normalize lineage data for US Pentecostal/Charismatic bodies using
the notes-first workflow.

## Scope (initial list)
Core lineage cluster:
- Assemblies of God (AG)
- Church of God (Cleveland, TN)
- Church of God in Christ (COGIC)
- Foursquare Church

Optional early additions:
- Pentecostal Holiness Church
- International Pentecostal Holiness Church
- Vineyard churches

## Sources strategy
Primary sources:
- Official denominational history/archives.

Secondary sources:
- Wikipedia/encyclopedia entries for dates and lineage.

## Workflow (notes-first)
1. Create notes file per denomination in `data/sets/pentecostal-us/notes/`.
2. Extract facts using `docs/spec/data-collection-prompt.md`.
3. Record sources/citations in notes.
4. Convert notes to JSON with `docs/spec/data-collection-json-conversion.md`.

## Validation checklist
- Edges reference valid node ids.
- Split/merge reasons are documented with citations.
- Notes capture theological distinctives and size estimates where available.

## Checklist
- [ ] Create notes files for core denominations.
- [ ] Extract facts with citations into notes.
- [ ] Convert notes to JSON and validate ids.
- [ ] Update unknowns and size estimates.
- [ ] Rebuild `data/data.js` and run QA.
