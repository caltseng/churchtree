# Main Branch product specification

## Purpose

Help curious readers explore Christian history through connected institutional
histories and primary sources. Use clear explanations, traceable evidence and neutral
attribution. This is an evolving collection, not a claim to exhaustive global history.

## Current experience

Home is a tile-based picker of available tools. Church History and the Westminster
Confession reader are independent routes with shared identity and semantic theme
tokens. Adding a tool should extend the inventory without displacing existing routes.

Church History opens on the vertical timeline across all branches. The Compact
lineage overview shows connected major traditions. A drill-in opens a detailed
scoped timeline in the last orientation. A Vertical/Horizontal toggle changes the
proportional time axis while retaining date context. Compact lineage provides an
alternative readable chronology. Splits diverge into lanes and mergers converge;
zoomed-out temporal clusters have meaningful titles and do not invent new bodies.

Users can search across branches, select nodes/edges, trace ancestors and navigate
to supported successors. Profiles explain why a body formed and how it continued or
ended; they include milestones before key people, beliefs, documents and sources.
Lifespan labels distinguish present-day bodies, recorded endings and uncertainty.
Origins can stay visible outside the time scale. Desktop uses a resizable split;
mobile uses touch controls and a reading sheet, with no page-width overflow.

The Westminster reader prioritizes its complete, identified historical text, stable
chapter/section links and accessible navigation. Editorial study material must be
optional, attributed and distinct from the primary text. Edition differences and
modern subscription policies must not be conflated. The deeper chapter layer is
being researched in its separate plan; its completion requires content and UI review.

## Content/model

Use the normalized node/edge/event/source/citation model in
[architecture/data-model.md](../architecture/data-model.md), not parent_id/split_reason
fields embedded in an oversimplified tree. Mergers and multiple influences require a
graph. Notes and canonical set JSON precede bundling. Expected historical coverage
and missing-node assessment are defined in [historical coverage](historical-coverage-standard.md).

The current scope emphasizes US Protestant traditions and European roots. Existing
Pentecostal records do not establish complete Pentecostal coverage. Missing merger
parents, intermediate organizations and major traditions must be prioritized and
researched rather than hidden behind apparently direct edges. Broader early/global
history is a separately bounded expansion, not an invented universal root date.

## Quality and delivery

The built artifact is checked and browser-tested before publication. Main requires
PRs and passing CI; trusted PRs can auto-merge while that policy is enabled. Historical
accuracy, licensing and source strength require editorial review beyond automation.
Use [user scenarios](../user-scenarios.md) for observable acceptance and
[deployment](../deployment.md) for current infrastructure.

## Planned, not yet a completed product

- Topic-centered histories of beliefs/disagreements, such as communion, with
  positions, documents and milestones across traditions.
- Expansion of canonical nodes according to the audited gap priorities.
- A complete scholarly chapter-study layer for the confession; initial research or
  a generated scaffold must not be counted as completed coverage.

The earlier Phase 0/Mermaid and single-Presbyterian prototype phasing is historical.
The current site is static multi-page HTML/CSS/JavaScript with D3 for the explorer;
there is no authentication, remote data service or doctrinal-apologetics product.
