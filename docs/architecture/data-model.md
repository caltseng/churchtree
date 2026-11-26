# Data Model

## China reading chapters and size observations

The China page has an opt-in Era navigator; other country routes retain their
existing timeline. `china-history/reading.cjs` partitions the unchanged canonical
45-record roster into seven editorial reading groups. Chapter labels are not
proportional timespans, institutional lifespans or claims of continuity. Unplaced
gaps retain null dates. `view=era&era=rupture#cultural-revolution` selects a
chapter/episode; `view=timeline` and `view=text` retain the existing views.
Legacy date/orientation/search/lane queries continue to select the timeline unless
an explicit view overrides them. Record fragments remain stable in every view.

`china-history/observations.cjs` is a distinct, non-event observation contract:
reference period, magnitude as published (not a computed common-scale value),
tradition, population, age universe, geography, measure, method, attribution,
uncertainty type/note, confidence, claim-level source locators, source publication
dates and access/review date. Flow, self-identification, belief and population
estimates are different measures. Missing periods are explicitly unknown; no
interpolation, sums, midpoint or national growth curve is generated.

The report's N12 Catholic source spread is stored as two observations,
`N12-hssc` and `N12-asia-harvest`, linked by `spread_group`, never as a confidence
interval. Confidence describes attribution versus demographic coverage, not a
numeric probability. The build validates the contract and emits escaped HTML
snapshots; source inputs and research crosswalks are not copied to the site.
The selected chapter scopes the size track, but lane/search/date filters do not;
that distinction remains visible. Method and confidence use native disclosures.
Desktop details stay alongside the episode list; narrow screens use in-flow
details and a focus-return button rather than a modal.

The 2026-11-26 claim review re-read the translated Montecorvino letter (baptism,
purchased-boys and date paragraphs), Pew's Christianity chapter and CGSS/CFPS
methods, the 1997 official mirror section I, and the 2018 State Council
republication section III. Sources verify attributed claims, not exhaustive
populations. In particular HSSC/Asia Harvest remain secondary attributions through
Pew; their underlying rosters were not independently inspected. Only original
paraphrases, facts and credited links are reproduced, not charts or translated
extracts. This is not a new independent historical audit, a repair of research-only
omissions, or a claim of full contemporary coverage.

This project represents church history as a graph that is rendered as a tree
when possible. The data model needs to support:
- Multiple parents (mergers or shared origins).
- Multiple splits from one parent.
- Approximate dates and uncertain relationships.
- Citations tied to specific claims.

Editorial collection and review must follow
[Historical coverage and completeness](../spec/historical-coverage-standard.md).
The core schema is a storage contract, not a certificate of complete history.

## Core entities

### Node (denomination or movement)
Represents a church body or movement at a point in time.

Required fields:
- id: stable slug (e.g., "pcusa", "pca")
- name: display name
- kind: "denomination" | "movement"
- start_year: finite integer for current published dated nodes. The release validator
  currently rejects null node start years; document uncertain origins/date bases and
  resolve that modeling before import rather than inventing a year. Origin context
  can be displayed outside the proportional scale.

Optional fields:
- end_year: integer (if dissolved or merged)
- short_label: short display name
- summary: brief description
- key_figures: structured people { name, role, summary, url, citations };
  legacy name strings are accepted for compatibility
- key_dates: list of milestone objects { year, label, citations }
- region: string (e.g., "US", "Global")
- geographic_origin: string (country/region of origin)
- tradition_family: broad family (e.g., "Reformed", "Baptist")
- ecclesial_orientation: "mainline" | "evangelical" | "other" | "unknown"
- current_status: "active" | "merged" | "dissolved" | "unknown"
- notes: freeform text
- distinctives: list of short theological distinctives
- size_estimate: short text (e.g., "approx 1.0M members, 2024")
- citations: list of citation ids (for summary, key dates, distinctives, size)
- tags: list of tag ids
- formation_narrative: why/how the unit formed, with historical context and
  attributed explanations rather than a founding date alone
- ending_narrative: later trajectory and why/how it ended, merged, renamed,
  reorganized, or continued; do not invent corporate endings for movements
- core_beliefs: explanatory strings that distinguish actual teaching/practice
- key_documents: { title, year, significance, url, citations }; significance
  must identify adopted/proposed/inherited/influential/illustrative status
- further_reading: { title, url, snippet, citations }; snippets are explanatory
  editorial descriptions unless explicitly marked as source quotations
- successor_ids: existing node IDs for supported continuation/end transitions;
  not every split-off from an active parent
- profile_scope: historical unit, period, diversity, uncertainty and research limits
- profile_citations: field-name-to-citation-ID arrays for the supported profile
  claims; these do not verify unrelated inherited fields automatically

The Church History explorer gives individual `active` records a bold border and
an "active today" accessible label. Display groups are not historical bodies and
do not receive this treatment. An unmarked record is not necessarily extinct:
`unknown` or missing status makes no assertion, and a missing `end_year` does not
establish that a body still exists. Other explorers do not inherit this treatment.

### Edge (relationship)
Represents a lineage relationship between two nodes.

Required fields:
- id: stable slug
- name: short readable label describing the reason
- from_id: parent node id
- to_id: child node id
- type: "split" | "merge" | "origin" | "continuation" | "influence"
- year: integer or null if unknown

Optional fields:
- reasons: short list of contention points
- description: longer text
- causes: short list of drivers (separate from reasons; used in detail panel)
- narrative: 1-3 paragraph description of the split/merge/origin
- key_figures: structured people { name, role, summary, url, citations }; legacy
  name strings remain compatible
- key_dates: list of milestone objects { year, label, citations }
- confidence: "high" | "medium" | "low"
- citations: list of citation ids

Relationship dates have explicit meanings in their labels/narratives. Influence
is not institutional parentage and can predate a target's constitution. Do not
force fellowship, cooperation, or theological influence into a split. Every
merger needs all immediate partners or an explicit missing-research declaration.

### Event
Marks a significant historical event that triggered or influenced a divide.

Required fields:
- id: stable slug
- name: display name
- year: integer or null if unknown

Optional fields:
- description: brief summary
- key_figures: structured people { name, role, summary, url, citations }; legacy
  name strings remain compatible
- related_edge_ids: list of edge ids
- related_node_ids: list of node ids
- citations: list of citation ids

### Citation
Links a claim in the data to a source.

Required fields:
- id: stable slug
- source_id: source id
- locator: string (page, section, URL fragment)

Optional fields:
- note: why the source is relevant
- accessed: date string (YYYY-MM-DD)

### Source
Represents a book, article, or website.

Required fields:
- id: stable slug
- title: display title
- kind: "book" | "article" | "website" | "paper"

Optional fields:
- author
- publisher
- year
- url

### Tag
Used for filtering and grouping.

Required fields:
- id: stable slug
- name: display name

## Current data storage
Static JSON files stored locally in the repo.

Canonical source files:
- data/sets/[set-id]/nodes.json
- data/sets/[set-id]/edges.json
- data/sets/[set-id]/events.json
- data/sets/[set-id]/sources.json and citations.json (optional local evidence)
- data/common/sources.json, citations.json, tags.json (shared metadata)

Research notes and audit findings must separately record expected historical
coverage, missing episodes/partners/intermediates, tradition balance, and whether
an apparent omission is a missing record or a present record hidden by the UI.
Proposed node identities stay proposals until reviewed/imported; display groups
never count as new historical bodies.

## Example (minimal)
```json
{
  "nodes": [
    { "id": "pcus", "name": "Presbyterian Church in the United States", "kind": "denomination", "start_year": 1861 },
    { "id": "pcusa", "name": "PC(USA)", "kind": "denomination", "start_year": 1983 },
    { "id": "pca", "name": "Presbyterian Church in America", "kind": "denomination", "start_year": 1973 }
  ],
  "edges": [
    {
      "id": "pcus-pca-1973",
      "from_id": "pcus",
      "to_id": "pca",
      "type": "split",
      "year": 1973,
      "reasons": ["doctrinal disputes", "church governance"],
      "citations": ["cite-1"]
    }
  ],
  "events": [
    {
      "id": "pcusa-split-1973",
      "name": "PCUS division leading to PCA",
      "year": 1973,
      "description": "Key points of contention that led to the PCA's formation.",
      "related_edge_ids": ["pcus-pca-1973"],
      "citations": ["cite-1"]
    }
  ],
  "sources": [
    { "id": "src-1", "title": "Example Source", "kind": "website", "url": "https://example.com" }
  ],
  "citations": [
    { "id": "cite-1", "source_id": "src-1", "locator": "section-2" }
  ],
  "tags": [
    { "id": "presbyterian", "name": "Presbyterian" }
  ]
}
```

## Notes
- The graph can be rendered as a tree by selecting a root and traversing edges.
- Multiple parents can be represented with multiple edges into a node.
- For uncertain dates, use null and add a note in the edge or node.

## Visualization heuristics (current)
- Nodes are positioned by 25-year buckets on the y-axis (earlier on top).
- Within each bucket, nodes are ordered by their earliest parent year/name (when available) to reduce edge crossings.
- A light force layout (x/y + collision + link distance) is used to spread nodes while preserving bucket alignment.
