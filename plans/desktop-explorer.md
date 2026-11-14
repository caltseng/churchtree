# Desktop explorer implementation

## Product decision
Desktop first; mobile is out of scope. Start with major tradition branches,
then reveal movements and denominations through three semantic zoom levels.
Use chronology only within a tradition or a selected lineage. Overview cards
represent data groupings, not claims that traditions are independent roots.

## Work
1. Repair the bundle to include shared sources/citations; reject duplicate IDs
   and dangling references with an automated validator.
2. Replace the all-history canvas with an overview and scoped timeline.
3. Add semantic zoom buttons, branch selection, denomination search, ancestor
   focus, and selectable node/relationship details with evidence links.
4. Verify the desktop journey with Playwright: overview → Presbyterian → PCA
   → ancestry → source, plus zoom disclosure and data validation.

## Rendering decision
Retain D3 for now. Its scales and SVG joins support exact chronology and custom
disclosure. Cytoscape offers graph algorithms and layout extensions, including
Dagre, but adopting it would still require our custom timeline and aggregation
semantics. Revisit if dense scoped graphs cannot remain readable or performance
degrades with measured growth. Keep graph selection separate from rendering.
References: https://d3js.org/d3-zoom and https://js.cytoscape.org/.

## Acceptance
- Overview shows major branches; zoom in reveals movements then denominations.
- Scope changes reset the date range; dates stay accurate within each scope.
- Hidden relationships are not presented as direct historical links.
- Search reaches any node, including nodes outside the active branch.
- Details expose available citations and explicitly identify missing evidence.
- All source/citation IDs resolve and all graph endpoints exist.
- No desktop browser errors; controls remain usable at 1280×800 and 1440×1000.

## Follow-up
Historical claim review and balanced sourcing remain editorial work. Completeness
of the source pipeline does not establish accuracy of every historical claim.
Mobile, large-scale graph engines, and exhaustive historical expansion are deferred.

## Implementation and usability review
Implemented the connected branch overview, explicit historical display groups,
compact chronological lineage, scoped proportional timeline, screen-space temporal
clustering, mouse wheel zoom/pan, node/relationship selection, search, ancestry,
origin context outside the date scale, evidence, rich profile fields, successor
navigation and an adjustable desktop split. Shared evidence is now bundled.

The two zoom modes intentionally differ: compact zoom expands historical groups;
proportional timeline zoom clusters records by their screen-space date distance.
Same-date records can remain a selectable cluster rather than implying false dates.

Usability revisions removed excess header space, shortened unobstructed edges,
added arrowheads and connection hover emphasis, prevented node overlaps, cleared
stale detail context on branch changes, and recompute layout after pane resizing.

Playwright checks cover all 13 branches at both compact detail levels, search → PCA
→ ancestry → origin context, source links, proportional wheel disclosure/collapse,
1280×800 and 1440×1000 layouts, and keyboard divider resizing. The Baptist timeline
expands from four clusters to seven with wheel zoom and returns to four on zoom out.
No runtime errors occurred in these checks.

Remaining content work is tracked in the separate data-audit chat. The initial validator flagged six unresolved citation IDs. After data enrichment
and rebuilding, all graph endpoints and citation references now resolve.
Historical correctness and full profile depth are not established by browser tests.

Added an optional horizontal proportional timeline with native side scrolling, fixed tradition labels, anchored button/Ctrl-wheel zoom, semantic titles and date-only subtitles. Regression checks cover horizontal scrolling, disclosure, reset, switching back to vertical zoom, and overlap checks for the all-branch view. Missing-node coverage analysis is assigned to the data-audit chat.

Drill-ins from All branches now open level 3 in the last-used timeline orientation. Compact lineage and scoped timelines assign lanes from reachable successor branches: splits diverge and merger paths converge. Timeline clustering stays within those branch lanes so neighboring independent histories no longer collapse into one column. Verified default drill-in, preserved orientation, distinct Presbyterian branch positions, and origin-only scopes in Playwright.
