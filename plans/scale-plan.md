# Plan: Scaling ChurchTree for Many Denominations

## Goal
Scale the data model, tooling, and UI so the system can handle large numbers of
denominations without losing clarity or maintainability.

## 1) Data structure and storage
- Split data by tradition or geography:
  - `data/sets/presbyterian-us/`
  - `data/sets/baptist-us/`
  - `data/sets/methodist-us/`
- Keep a shared `data/common/` for sources, tags, and global nodes.
- Use stable IDs with namespaces (e.g., `presbyterian-us.pca`).
- Add `aliases` and `merged_into` fields for historical continuity.
- Use `size_estimate` and `distinctives` consistently across nodes.

## 2) Notes-first pipeline at scale
- Maintain notes per denomination:
  - `data/sets/[set-name]/notes/[denomination-slug].md`
- Add a batch index file per set:
  - `data/sets/[set-name]/notes/index.json` with status, source coverage, and last-updated.
- Require minimum citations per claim (date, split/merge, distinctives, size).

## 3) Automation and scripts
- Expand build scripts:
  - `scripts/build-data-js.ps1` to merge multiple sets into a single bundle.
  - Add `scripts/validate-data.ps1` for schema and referential integrity.
- Add a lint-like check:
  - Missing citations, missing required fields, duplicate IDs.
- Add a `scripts/report-gaps.ps1`:
  - Lists unknowns (size, distinctives, dates).

## 4) Versioning and releases
- Use semantic data versions in `data/metadata.json`.
- Require a data changelog per release:
  - `data/CHANGELOG.md`.
- Tag releases when adding major traditions.

## 5) UI and rendering scalability
- Use clustering or progressive disclosure:
  - Collapsed nodes at high zoom, expanded at low zoom.
- Add filters (tradition, era, region, confidence).
- Implement search-first navigation for large trees.
- Provide focus mode (single lineage path).

## 6) Performance and bundling
- Precompute layout for large graphs (server-side or build-time).
- Store layout metadata per node (`x`, `y`, `level`) in data bundles.
- Load only the active set (lazy-load by tradition/region).

## 7) Operations and QA
- Add a data review checklist to PRs.
- Require two-source confirmation for contentious claims.
- Track disputed nodes in `data/sets/[set-name]/notes/unknowns.md`.

## Milestones
1. Split data into sets + add validation script.
2. Add gap-reporting + bundle build for multiple sets.
3. UI filters + focus mode + progressive disclosure.
4. Precomputed layouts + lazy-loading.

## Checklist
- [ ] Split data into sets and add validation script.
- [ ] Add gap reporting and multi-set bundle build.
- [ ] Implement UI filters and focus mode.
- [ ] Add precomputed layouts and lazy-loading.
