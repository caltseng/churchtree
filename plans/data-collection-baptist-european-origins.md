# Data Collection Plan: European Origins of Baptists

## Purpose
Collect and normalize European antecedents that feed the American Baptist
lineage (English Separatists and early Baptist churches).

## Owners
- Codex (current run)

## First batch targets
- Core English Separatist lineage

## Scope (initial list)
Core lineage cluster:
- English Separatists (movement context)
- John Smyth/Thomas Helwys and early Baptist congregations
- Early Baptist church in Amsterdam (1609)

Optional early additions:
- General vs. Particular Baptists (as movement branches)
- Dutch Mennonite influence (if directly connected)

## Sources strategy
Primary sources:
- Baptist history archives or official Baptist heritage sites.

Secondary sources:
- Encyclopedia entries for dates and early congregations.

Source rules:
- At least one source per major claim (date, origin).
- Capture precise locators (section titles, page numbers, URL fragments).

## Workflow (notes-first)
1. Create notes file per denomination/movement:
   - `data/sets/baptist-europe/notes/[slug].md`
   - Use `data/sets/baptist-europe/notes/template.md` (create if missing).
2. Extract facts using `docs/spec/data-collection-prompt.md`.
3. Record sources/citations in the notes file.
4. Convert notes to JSON with `docs/spec/data-collection-json-conversion.md`.

## Validation checklist
- Edges reference valid node ids.
- Split/merge/continuation types are accurate.
- Notes capture distinctives where sourced.

## Checklist
- [ ] Create notes files for core English Baptist lineage.
- [ ] Extract facts with citations into notes.
- [ ] Convert notes to JSON and validate ids.
- [ ] Add edges linking to US Baptist movement where sourced.
- [ ] Rebuild `data/data.js` and run QA.
