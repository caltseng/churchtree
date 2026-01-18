# Data Model

This project represents church history as a graph that is rendered as a tree
when possible. The data model needs to support:
- Multiple parents (mergers or shared origins).
- Multiple splits from one parent.
- Approximate dates and uncertain relationships.
- Citations tied to specific claims.

## Core entities

### Node (denomination or movement)
Represents a church body or movement at a point in time.

Required fields:
- id: stable slug (e.g., "pcusa", "pca")
- name: display name
- kind: "denomination" | "movement"
- start_year: integer or null if unknown

Optional fields:
- end_year: integer (if dissolved or merged)
- short_label: short display name
- summary: brief description
- region: string (e.g., "US", "Global")
- notes: freeform text
- tags: list of tag ids

### Edge (relationship)
Represents a lineage relationship between two nodes.

Required fields:
- id: stable slug
- from_id: parent node id
- to_id: child node id
- type: "split" | "merge" | "origin" | "continuation"
- year: integer or null if unknown

Optional fields:
- reasons: short list of contention points
- description: longer text
- confidence: "high" | "medium" | "low"
- citations: list of citation ids

### Event
Marks a significant historical event that triggered or influenced a divide.

Required fields:
- id: stable slug
- name: display name
- year: integer or null if unknown

Optional fields:
- description: brief summary
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

## Data storage (phase 0+)
Static JSON files stored locally in the repo.

Suggested files:
- data/nodes.json
- data/edges.json
- data/events.json
- data/sources.json
- data/citations.json
- data/tags.json

## Example (minimal)
```json
{
  "nodes": [
    { "id": "pcusa", "name": "PC(USA)", "kind": "denomination", "start_year": 1983 },
    { "id": "pca", "name": "Presbyterian Church in America", "kind": "denomination", "start_year": 1973 }
  ],
  "edges": [
    {
      "id": "pcusa-pca-1973",
      "from_id": "pcusa",
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
      "name": "PC(USA) division leading to PCA",
      "year": 1973,
      "description": "Key points of contention that led to the PCA's formation.",
      "related_edge_ids": ["pcusa-pca-1973"],
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
