# Implementation and usability review

Reviewed 2026-11-13. Covers the desktop graph, compact lineage, vertical and
horizontal timelines, detail panels, local build, validation, and browser checks.
Mobile and the independent historical audit remain outside this implementation review.

## Findings fixed

- **Opening view hid relevant content.** Horizontal time initially extended beyond
  the viewport before users had zoomed. It now fits the entire selected date range;
  zooming increases the scrollable width while preserving the date under the anchor.
- **Search could select an invisible record.** Both timeline renderers now expose
  `reveal(id)`. Search and cluster-member navigation bring that date into view and
  highlight the containing node/cluster. Same-date records retain their true dates.
- **Date controls contradicted the scene.** The fields now follow the visible range
  unless the user is editing them. Invalid or empty ranges produce an inline error.
- **Time context disappeared on vertical scrolling in the horizontal view.** The
  axis now follows the vertical viewport; tradition labels stay fixed horizontally.
- **Duplicated clustering and relationship grouping.** Both orientations now share
  the pure `timeline-model.js`, separating date-based grouping from SVG rendering.
  Tests ensure all entries are retained, traditions are separated, cluster centers
  have safe gaps, and grouped connections preserve the original relationships.
- **Misleading grouped connection colors.** Mixed types now use a distinct dashed
  gray line and legend, rather than adopting the first relationship's color.
- **Accumulated implementation debris.** Removed unreachable timeline code in the
  compact renderer and unused helpers. Expanded JavaScript block formatting and
  consolidated duplicate CSS declarations and obsolete card styles.
- **Fragile lifecycle and accessibility.** Renderers release wheel/zoom handlers;
  pointer cancellation releases divider dragging; the divider exposes its width
  to assistive technology; graph regions and nodes are keyboard reachable.
- **Build could silently omit future datasets.** The build discovers dataset folders
  rather than maintaining a hard-coded list. Rebuilt the enriched profile bundle.

## Verification

`node scripts/test-timeline-model.cjs` passes temporal and relationship invariants.
`node scripts/test-explorer.cjs` passes desktop browser journeys with no runtime
errors: all 13 compact branches at both detail levels, overlap checks, profile links,
search and ancestry, vertical zoom disclosure/collapse, horizontal scroll/zoom/reset,
view switching, sticky dates, search reveal, invalid range handling, and pane resizing.
Screenshots were inspected at 1440×1000 and 1280×800; a separate interactive launch
uses the actual window size instead of the tests' emulated viewport.

`node scripts/validate-data.cjs` passes for 63 nodes, 70 edges, 37 events, 197 sources,
and 403 citations, including profile-specific citation maps. Syntax checks pass.
These checks establish referential integrity, not historical accuracy.

## Remaining limitations and next decisions

1. Dense cross-tradition graphs still use heuristic edge routing. Tests check node
   overlap, not every potential edge/label intersection. Before substantially
   increasing the dataset, test realistic dense scopes and compare a layout engine
   if the routing cannot remain understandable.
2. Display groups and broad overview rows are curated UI metadata. Newly added
   traditions need editorial grouping review; generic fallback titles do not supply
   researched historical explanations.
3. The large compact renderer and profile renderer still share `explorer.js`.
   Extracting the profile view and compact layout is the next useful code separation;
   a framework migration is not required to do that.
4. D3 is loaded from its public CDN. The page handles a missing dependency, but
   offline operation would require a locally bundled, licensed copy.
5. The enriched profiles now render, but source strength, completeness, causal
   explanations, disputed claims, and missing-node recommendations remain the
   independent data audit's responsibility.

Do not equate passing UI checks or resolved citations with publication-ready history.
