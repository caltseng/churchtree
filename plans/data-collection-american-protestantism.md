# Data Collection Plan: American Protestantism (Umbrella)

## Purpose
Provide a single, exhaustive roadmap for collecting American Protestant lineage
data, linking to focused sub-plans by tradition family.

## Scope (umbrella)
American Protestant families to cover:
- Presbyterian/Reformed
- Baptist
- Methodist/Wesleyan
- Lutheran
- Anglican/Episcopal
- Pentecostal/Charismatic
- Holiness/Restorationist
- Adventist

## Sub-plans (linked)
- Presbyterian/Reformed: `plans/data-collection-presbyterian-us.md`
- Baptist: `plans/data-collection-baptist-us.md`
- European roots (pre-US Presbyterian): `plans/data-collection-presbyterian-european-roots.md`
- Methodist/Wesleyan: `plans/data-collection-methodist-wesleyan-us.md`
- Lutheran: `plans/data-collection-lutheran-us.md`
- Anglican/Episcopal: `plans/data-collection-anglican-episcopal-us.md`
- Pentecostal/Charismatic: `plans/data-collection-pentecostal-charismatic-us.md`
- Holiness/Restorationist: `plans/data-collection-holiness-restorationist-us.md`
- Adventist: `plans/data-collection-adventist-us.md`

## Workflow (shared)
1. Notes-first extraction with citations.
2. Convert notes to JSON.
3. Backfill size estimates, distinctives, and metadata fields.
4. Run QA checklist before merge:
   - `docs/spec/data-audit-checklist.md`
   - `plans/qa-periodic-check.md`

## Open additions
Create sub-plans for additional families as they enter scope.

## Checklist
- [ ] Confirm scope list is complete for current phase.
- [ ] Ensure each sub-plan has owners, sources, and first batch targets.
- [ ] Run notes-first extraction for each sub-plan.
- [ ] Convert notes to JSON and rebuild `data/data.js`.
- [ ] Run QA: `docs/spec/data-audit-checklist.md` and `plans/qa-periodic-check.md`.
