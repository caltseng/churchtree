# Data Collection Plan: European Origins (American Protestant Families)

## Purpose
Provide a single roadmap for collecting European antecedents that feed the
American Protestant families in scope, linking to any focused sub-plans.

## Scope (umbrella)
European-origin clusters to cover:
- Anglican: Church of England and English Reformation roots.
- Lutheran: German/Scandinavian Lutheran origins and confessional streams.
- Methodist/Wesleyan: Wesleyan revival and Methodism in England.
- Baptist: English Separatists and early Baptist movement in England/Netherlands.
- Presbyterian/Reformed: Swiss/Genevan/Scottish roots (already scoped).
- Adventist/Holiness/Restorationist/Pentecostal: limited European precursors
  where directly connected (e.g., Pietism/Holiness influences), otherwise
  document as US-born movements.

## Sub-plans (linked)
- Presbyterian/Reformed: `plans/data-collection-presbyterian-european-roots.md`
- Anglican: `plans/data-collection-anglican-european-origins.md`
- Lutheran: `plans/data-collection-lutheran-european-origins.md`
- Methodist/Wesleyan: `plans/data-collection-methodist-european-origins.md`
- Baptist: `plans/data-collection-baptist-european-origins.md`

## Workflow (shared)
1. Notes-first extraction with citations.
2. Convert notes to JSON.
3. Backfill distinctives, origin regions, and metadata fields.
4. Run QA checklist before merge:
   - `docs/spec/data-audit-checklist.md`
   - `plans/qa-periodic-check.md`

## Open additions
Create sub-plans for specific European streams (e.g., Lutheran origins) as
they enter active scope.

## Checklist
- [x] Confirm European scope list is complete for current phase.
- [x] Create sub-plans for any family needing deeper European roots.
- [x] Run notes-first extraction for each European origin cluster.
- [x] Convert notes to JSON and rebuild `data/data.js`.
- [x] Run QA: `docs/spec/data-audit-checklist.md` and `plans/qa-periodic-check.md`.

