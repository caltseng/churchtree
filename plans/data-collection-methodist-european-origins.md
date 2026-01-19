# Data Collection Plan: European Origins of Methodism

## Purpose
Collect and normalize European (English) antecedents that feed the American
Methodist/Wesleyan lineage.

## Owners
- Codex (current run)

## First batch targets
- Core Wesleyan revival lineage

## Scope (initial list)
Core lineage cluster:
- John Wesley and the Methodist movement in England
- Church of England context (as origin/continuation)

Optional early additions:
- Moravian influence (if directly tied to Wesleyan origins)
- Methodist societies and early conferences (as movement nodes)

## Sources strategy
Primary sources:
- Methodist history archives or official Methodist heritage sites.

Secondary sources:
- Encyclopedia entries for dates and institutional origins.

Source rules:
- At least one source per major claim (date, origin, continuation).
- Capture precise locators (section titles, page numbers, URL fragments).

## Workflow (notes-first)
1. Create notes file per denomination/movement:
   - `data/sets/methodist-europe/notes/[slug].md`
   - Use `data/sets/methodist-europe/notes/template.md` (create if missing).
2. Extract facts using `docs/spec/data-collection-prompt.md`.
3. Record sources/citations in the notes file.
4. Convert notes to JSON with `docs/spec/data-collection-json-conversion.md`.

## Validation checklist
- Edges reference valid node ids.
- Split/merge/continuation types are accurate.
- Notes capture distinctives where sourced.

## Checklist
- [ ] Create notes files for core Wesleyan lineage.
- [ ] Extract facts with citations into notes.
- [ ] Convert notes to JSON and validate ids.
- [ ] Add edges linking to MEC/UMC where sourced.
- [ ] Rebuild `data/data.js` and run QA.
