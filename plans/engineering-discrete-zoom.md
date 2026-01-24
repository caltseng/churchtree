# Engineering Plan: Discrete Zoom Levels

## Goal
Implement discrete zoom tiers (macro/mid/full) that control which nodes/edges/events
render, while preserving the ability to backfill and aggregate data over time.

## Scope
- Frontend: tier-based filtering and cluster substitution.
- Data model: tier metadata + optional cluster definitions.
- Data pipeline: notes → JSON conversion with tier fields and backfill support.

## Data model changes
Add fields (optional at first, required by Tier 1+ later):
- `zoom_tier`: "macro" | "mid" | "full" (nodes/edges/events)
- `cluster_id`: string (nodes)
- `cluster_label`: string (cluster nodes)
- `cluster_members`: array of node ids (cluster nodes only)

## Implementation steps
1. **Schema updates**
   - Update `docs/architecture/data-model.md` with tier/cluster fields.
   - Update data collection prompt and JSON conversion instructions.

2. **Define tiers**
   - Tier 1 (macro): Great Schism, Reformation, major families.
   - Tier 2 (mid): major national churches and key denominational branches.
   - Tier 3 (full): current complete dataset.

## Draft cluster chart (v0)
This is a first-pass cluster map to guide tiering. Clusters can be refined as
node coverage grows.

| Cluster id | Label | Tier | Scope | Membership rule (v0) | Time window (v0) |
| --- | --- | --- | --- | --- |
| cluster-orthodox | Eastern Orthodox | macro | Eastern tradition after 1054 | `tradition_family == "Orthodox"` | 1054–present |
| cluster-catholic | Catholic (Latin) | macro | Western Latin tradition | `tradition_family == "Catholic"` | 1054–present |
| cluster-anglican | Anglican | macro | English Reformation lineage | `tradition_family == "Anglican"` | 1534–present |
| cluster-lutheran | Lutheran | macro | Lutheran Reformation lineage | `tradition_family == "Lutheran"` | 1517–present |
| cluster-reformed | Reformed/Presbyterian | macro | Reformed + Presbyterian lineages | `tradition_family in ["Reformed","Presbyterian"]` | 1520–present |
| cluster-baptist | Baptist | macro | Baptist movements + US denominations | `tradition_family == "Baptist"` | 1609–present |
| cluster-methodist | Methodist/Wesleyan | macro | Methodist movements + US branches | `tradition_family == "Methodist"` | 1730–present |
| cluster-restorationist | Restorationist | macro | Restorationist lineages | `tradition_family == "Restorationist"` | 1800–present |
| cluster-pentecostal | Pentecostal | macro | Pentecostal movements + US branches | `tradition_family == "Pentecostal"` | 1901–present |
| cluster-holiness | Holiness | macro | Holiness movements | `tradition_family == "Holiness"` | 1830–present |
| cluster-adventist | Adventist | macro | Adventist movement + denominations | `tradition_family == "Adventist"` | 1830–present |
| cluster-revivalist | Revivalist | macro | Revivalist umbrella nodes | `tradition_family == "Revivalist"` | 1730–present |

Notes:
- Use macro clusters as single nodes at Tier 1.
- Tier 2 should show major denominational nodes per tradition (top 1-3 per set).
- Tier 3 shows the full dataset.
- Time proximity: nodes outside a cluster's time window should not be grouped
  into that cluster even if the tradition_family matches.

3. **Create cluster nodes**
   - Add explicit cluster nodes in JSON (e.g., `cluster-reformation`).
   - Define cluster membership rules:
     - Chronological scope: a time window (e.g., 1517–1648 for Reformation).
     - Thematic scope: shared tradition_family or historical event tag.
     - Minimum size: at least N member nodes (e.g., N=3) to justify a cluster.
   - Assign `cluster_id` to member nodes for Tier 1 grouping.
   - Add edges from cluster nodes to other cluster nodes as needed.

4. **Rendering logic**
   - Map zoom scale to tiers (e.g., <0.7 => macro, 0.7–1.2 => mid, >1.2 => full).
   - Filter nodes/edges/events by `zoom_tier`.
   - When macro: render clusters instead of member nodes.
   - When mid/full: render members (and optionally keep cluster outline).

5. **Backfill strategy**
   - Start with `zoom_tier: full` for all existing nodes (default).
   - Add `zoom_tier: mid` for major branches first.
   - Add `zoom_tier: macro` cluster nodes/events last.
   - Track missing tier metadata in notes/unknowns.md.

6. **Data aggregation (re-evaluation)**
   - Default: ship a single combined dataset and filter client-side.
   - If data size grows: precompute per-tier bundles (`data/data.tier1.js`, etc.)
     and lazy-load on tier change to avoid loading full detail at once.
   - Keep a debug switch to force tier and compare bundles.
   - Avoid premature sharding until data size justifies it.

7. **QA**
   - Verify no orphaned edges per tier.
   - Ensure cluster nodes have labels and tooltips.
   - Check transitions between tiers for sudden jumps or missing labels.

## Deliverables
- Updated data model docs and collection prompts.
- Tier metadata in JSON for existing datasets.
- Cluster nodes + edges for Tier 1.
- Frontend tier switching + debug toggle.

## Open questions
- Should Tier 1 clusters be time-bounded bars or single nodes?
- How to visualize multi-parent edges in Tier 1?

## Checklist
- [ ] Update schema docs for `zoom_tier` and clusters.
- [ ] Define macro/mid/full node sets and cluster rules.
- [ ] Implement tier filtering and cluster substitution in UI.
- [ ] Add debug tier switch and per-tier QA.
- [ ] Backfill tier metadata in data and rebuild bundle.
