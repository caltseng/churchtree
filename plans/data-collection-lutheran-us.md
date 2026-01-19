# Data Collection Plan: US Lutheran Denominations

## Purpose
Collect and normalize lineage data for US Lutheran denominations using the
notes-first workflow.

## Owners
- Codex (current run)

## First batch targets
- Core lineage cluster

## Initial sources (seed list)
- Wikipedia pages for each scoped denomination (dates, split/merge summaries).
- Official denominational history pages (when available).
- Encyclopedia entries for split/merge reasons.

## Scope (initial list)
Core lineage cluster:
- Evangelical Lutheran Church in America (ELCA)
- Lutheran Churchâ€“Missouri Synod (LCMS)
- Wisconsin Evangelical Lutheran Synod (WELS)
- American Lutheran Church (ALC)
- Lutheran Church in America (LCA)
- Association of Evangelical Lutheran Churches (AELC)

Optional early additions:
- Evangelical Lutheran Synod (ELS)
- Lutheran Brethren (LBC)
- North American Lutheran Church (NALC)

## Sources strategy
Primary sources:
- Official denominational history/archives.

Secondary sources:
- Wikipedia/encyclopedia entries for dates and lineage.

## Workflow (notes-first)
1. Create notes file per denomination in `data/sets/lutheran-us/notes/`.
2. Extract facts using `docs/spec/data-collection-prompt.md`.
3. Record sources/citations in notes.
4. Convert notes to JSON with `docs/spec/data-collection-json-conversion.md`.

## Validation checklist
- Edges reference valid node ids.
- Split/merge reasons are documented with citations.
- Notes capture theological distinctives and size estimates where available.

## Checklist
- [x] Create notes files for core denominations.
- [x] Extract facts with citations into notes.
- [x] Convert notes to JSON and validate ids.
- [x] Update unknowns and size estimates.
- [x] Rebuild `data/data.js` and run QA.

