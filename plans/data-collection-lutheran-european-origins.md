# Data Collection Plan: European Origins of Lutheranism

## Purpose
Collect and normalize European antecedents that feed the American Lutheran
lineage (Germany and Scandinavia).

## Owners
- Codex (current run)

## First batch targets
- Core Reformation lineage

## Scope (initial list)
Core lineage cluster:
- Lutheran Reformation (Martin Luther, 1517) as movement context
- German Lutheran territorial churches (as movement nodes)
- Scandinavian Lutheran state churches (Sweden, Norway, Denmark)

Optional early additions:
- Pietism movement (if directly connected to American Lutheran bodies)
- Prussian Union (if needed for LCMS origin context)

## Sources strategy
Primary sources:
- Official Lutheran church history pages (Germany, Sweden, Norway, Denmark).

Secondary sources:
- Encyclopedia entries for dates and organizational continuity.

Source rules:
- At least one source per major claim (date, origin, continuity).
- Capture precise locators (section titles, page numbers, URL fragments).

## Workflow (notes-first)
1. Create notes file per denomination/movement:
   - `data/sets/lutheran-europe/notes/[slug].md`
   - Use `data/sets/lutheran-europe/notes/template.md` (create if missing).
2. Extract facts using `docs/spec/data-collection-prompt.md`.
3. Record sources/citations in the notes file.
4. Convert notes to JSON with `docs/spec/data-collection-json-conversion.md`.

## Validation checklist
- Edges reference valid node ids.
- Split/merge/continuation types are accurate.
- Notes capture distinctives where sourced.

## Checklist
- [x] Create notes files for core Reformation/territorial church lineage.
- [x] Extract facts with citations into notes.
- [x] Convert notes to JSON and validate ids.
- [x] Add edges linking to ELCA/LCMS/WELS where sourced.
- [x] Rebuild `data/data.js` and run QA.

