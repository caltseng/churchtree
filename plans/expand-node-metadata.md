# Plan: Expand Node Metadata for Future Filtering

## Goal
Add richer, consistent metadata fields to denomination/movement nodes to support
filtering, clustering, and UI facets.

## Scope
Applies to all nodes across datasets (US + Europe). Focus on low-effort, high-
value fields that are consistently sourceable.

## Proposed fields (v1)
- tradition_family: broad family (e.g., Reformed, Baptist, Methodist)
- ecclesial_orientation: mainline | evangelical | other | unknown
- geographic_origin: country/region of origin (distinct from current region)
- current_status: active | merged | dissolved | unknown

## Implementation steps
1. Update data model documentation to list new fields and definitions.
2. Update notes template to collect new fields with citations.
3. Backfill the three new fields for existing nodes where sources exist.
4. Add "unknowns" entries for missing fields by node.
5. Update JSON conversion guidance to include new fields.
6. Run JSON conversion for existing datasets and rebuild `data/data.js`.

## Validation checklist
- Field values are normalized (controlled vocab where possible).
- Every new field has a citation when asserted.
- Unknowns captured explicitly in notes/unknowns.md.
- No breaking changes to existing graph rendering.

## Deliverables
- Updated data model doc + notes template.
- Backfilled node metadata for current datasets.
- Unknowns inventory for missing metadata.

## Checklist
- [ ] Update data model and notes template for new fields.
- [ ] Backfill fields for existing nodes where sourced.
- [ ] Record missing fields in unknowns.
- [ ] Update JSON conversion guidance.
- [ ] Rebuild `data/data.js` and run QA.
