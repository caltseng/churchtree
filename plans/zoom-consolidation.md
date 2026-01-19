# Plan: Zoom-Based Consolidation and Macro Views

## Goal
Implement zoom-sensitive granularity so zooming out shows macro events (e.g.,
Great Schism, Reformation), while zooming in reveals full node/edge detail.

## Design options
### Option A: Discrete zoom levels (recommended for v1)
- Define 3–4 fixed zoom tiers with explicit node/edge sets.
- Pros: predictable, easier to debug, consistent UX.
- Cons: more manual grouping work.

### Option B: Continuous, data-driven consolidation
- Collapse nodes dynamically based on screen-space distance or time proximity.
- Pros: adaptive to dataset growth.
- Cons: complex; can be unstable or surprising.

### Option C: Hybrid (tiers + light auto-collapse)
- Use discrete tiers, but within each tier apply light auto-collapse for dense
  pockets (e.g., collapse micro-splits under a threshold time window).
- Pros: keeps predictable tiers while reducing clutter spikes.
- Cons: more moving parts than pure discrete.

## Evaluation and recommendation
### Discrete tiers
- Best for Phase 2/3 scope: aligns with macro/mid/full user mental model.
- Clear for documentation and data curation; enables purposeful labels at each tier.
- Requires explicit curation but avoids “flicker” during zoom.

### Continuous consolidation
- Potentially best long-term once dataset is large.
- Harder to make historically meaningful clusters without extra metadata.
- Risk: hides important events if they fall inside dense intervals.

### Hybrid
- Good compromise once tiering is stable and dataset grows.
- Requires more engineering and careful UX tuning.

## Recommended approach (v1)
Start with discrete tiers (Option A) and revisit Hybrid only after tier labels
and cluster metadata are stable.

## Zoom tiers (draft)
### Tier 1: Macro (zoomed out)
- Show only highest-level clusters and epoch events.
- Example nodes: Great Schism (1054), Reformation (1517–1648), major families.
- Labels are cluster names, not individual denominations.

### Tier 2: Mid (intermediate)
- Expand major families into key branches (e.g., Lutheran, Reformed, Anglican).
- Include major national churches (Church of Scotland, Church of England).
- Hide minor splits and short-lived bodies.

### Tier 3: Full (zoomed in)
- Show all denominations, movements, events, and edges.
- All current data displayed, with edge labels and tooltips.

## Data modeling additions
- Add `cluster_id` and `cluster_label` to nodes (optional).
- Add `epoch` to events (e.g., "Reformation", "Great Schism").
- Add `visibility_tier` to nodes/edges/events (1/2/3).

## Implementation steps
1. Define macro clusters and epoch events in data notes.
2. Add `visibility_tier` to nodes/edges/events in JSON.
3. Update graph rendering to:
   - Determine tier by zoom scale.
   - Filter nodes/edges by tier.
   - Replace cluster members with a cluster node at Tier 1.
4. Add UI indicator for current zoom tier.
5. Validate transitions between tiers for legibility.

## Open questions
- How to represent multi-parent nodes in collapsed views.
- Whether to keep edge labels at Tier 1 or only show cluster labels.

## Checklist
- [ ] Define tier labels and zoom thresholds.
- [ ] Specify macro events and cluster labels.
- [ ] Add tier/cluster metadata to nodes and events.
- [ ] Implement tier switching in the renderer.
- [ ] QA transitions between tiers.
