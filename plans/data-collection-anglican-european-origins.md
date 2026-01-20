# Data Collection Plan: European Origins of Anglicanism

## Purpose
Collect and normalize European/English antecedents that feed the American
Anglican/Episcopal lineage.

## Owners
- Codex (current run)

## First batch targets
- Core English Reformation lineage

## Scope (initial list)
Core lineage cluster:
- Church of England (established church)
- English Reformation (movement context)
- Elizabethan Settlement (if needed as event context)

Optional early additions:
- Oxford Movement (if directly tied to American Anglican distinctives)
- Scottish Episcopal Church (if needed for ACNA/TEC context)

## Sources strategy
Primary sources:
- Church of England history pages or official archives.

Secondary sources:
- Encyclopedia entries for dates and institutional continuity.

Source rules:
- At least one source per major claim (date, origin, continuation).
- Capture precise locators (section titles, page numbers, URL fragments).

## Workflow (notes-first)
1. Create notes file per denomination/movement:
   - `data/sets/anglican-europe/notes/[slug].md`
   - Use `data/sets/anglican-europe/notes/template.md` (create if missing).
2. Extract facts using `docs/spec/data-collection-prompt.md`.
3. Record sources/citations in the notes file.
4. Convert notes to JSON with `docs/spec/data-collection-json-conversion.md`.

## Validation checklist
- Edges reference valid node ids.
- Split/merge/continuation types are accurate.
- Notes capture distinctives where sourced.

## Checklist
- [x] Create notes files for core English lineage.
- [x] Extract facts with citations into notes.
- [x] Convert notes to JSON and validate ids.
- [x] Add edges linking to TEC/ACNA where sourced.
- [x] Rebuild `data/data.js` and run QA.

