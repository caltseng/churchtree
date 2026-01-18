# Product Spec

## Vision
Build an interactive, zoomable "family tree" of church history that lets users
trace denominations back to early church roots. Focus on clarity and historical
lineage, including years, parent movements, and key points of division.

## Goals
- Visualize denominational lineage as a navigable tree that supports zoom in/out.
- Make it easy to trace any denomination back through its ancestors.
- Capture key splits: when they happened and why (contention points).
- Start with a scoped dataset and expand iteratively.
- Keep data local and static before any web service integration.

## Non-goals (initial)
- Exhaustive global coverage of every tradition.
- Detailed doctrinal debate or apologetics.
- Dynamic/remote data services.

## Target users
- Curious learners exploring church history.
- Students or educators who want a quick lineage overview.
- Pastors or researchers needing a high-level map of movements.

## Core experience
1. User sees a zoomed-out tree of major branches.
2. User zooms into a branch to see sub-branches and detail.
3. User selects a denomination to view metadata:
   - Year of origin
   - Parent denomination/movement
   - Key points of division or contention
   - Notes and citations (where available)
4. User traces lineage upward to early church roots.

## Data model (initial)
- Denomination
  - id (stable slug)
  - name
  - year (approx ok)
  - parent_id (or multiple parents if needed later)
  - split_reason (short text)
  - notes
  - sources (list of citations/links)

## Scope strategy
- Start with a minimal tree of major branches.
- Add American Protestant streams first.
- Expand with more nodes once the UX is stable.
 - Use natural-language notes with citations before converting to JSON.

## UX and interaction
- Zoom and pan on the tree.
- Click/tap to open detail panel.
- Breadcrumb or lineage path to show ancestors.
- Search by denomination name (optional in v1).

## Content guidelines
- Neutral, descriptive tone.
- Sources cited for claims where feasible.
- Keep split reasons concise and factual.

## Phases
Phase 0 (starter)
- Technical scope: static JSON data and simple Mermaid visualization.
- Historical scope: PCA and PC(USA) only, with a single branch.

Phase 1 (prototype)
- Technical scope: lightweight web page with static JSON, basic zoom/pan, and
  click-to-view details.
- Historical scope: expand to a minimal American Presbyterian lineage with
  a few key splits (e.g., PCA, PC(USA), OPC).

Phase 2 (v1)
- Technical scope: interactive tree UI, detail panel, search, and lineage path.
- Historical scope: broaden to key American Protestant families (Baptist,
  Methodist, Presbyterian/Reformed).

Phase 3 (expansion)
- Technical scope: improved layout, filters, and citation display.
- Historical scope: add early church roots and additional branches as needed.

Phase 4 (sources)
- Technical scope: clickable citations tied to data entries.
- Historical scope: backfill sources for existing nodes and expand as needed.

## Open questions
- How to represent multiple parentage or mergers?
- How to handle approximated dates and uncertain splits?
- Minimum viable dataset size for a useful first release?
