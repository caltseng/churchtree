# Periodic QA / Audit Checklist

Run this checklist before major merges or data refreshes.

## Data integrity
- Run the data audit checklist: `docs/spec/data-audit-checklist.md`.
- Confirm every edge references valid node ids.
- Confirm every citation references a valid source.
- Validate `zoom_tier` is present for nodes/edges/events (default `full`).

## Zoom-tier QA (from discrete-zoom plan)
- Verify no orphaned edges per tier.
- Ensure cluster nodes have labels and tooltips.
- Check transitions between tiers for sudden jumps or missing labels.

## Visual QA
- Confirm year gridlines align with nodes and tooltips.
- Verify edge labels remain readable at all zoom levels.
- Check hover tooltips for nodes and edges render correctly.

## Build
- Re-run the bundle build: `powershell -ExecutionPolicy Bypass -File scripts/build-data-js.ps1`.

## Checklist
- [ ] Run `docs/spec/data-audit-checklist.md`.
- [ ] Validate zoom tier integrity and cluster labels.
- [ ] Review visual alignment and hover behavior.
- [ ] Rebuild `data/data.js`.
