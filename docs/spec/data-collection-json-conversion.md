# Data Collection - Convert Notes to JSON

Use this prompt after the notes file is created to convert facts into the
project JSON model.

## Prompt Template
```
Convert the notes below into the JSON shape required by the project. Use stable
slugs for ids (lowercase, hyphenated). Ensure every edge, event, and reason has
citations. If a date is unknown, set it to null and add a brief note.

Notes:
[PASTE NOTES FILE CONTENTS]

Output strictly in this JSON shape:
{
  "nodes": [
    {
      "id": "",
      "name": "",
      "kind": "denomination",
      "start_year": null,
      "end_year": null,
      "short_label": "",
      "summary": "",
      "key_figures": [],
      "key_dates": [
        { "year": null, "label": "", "citations": [] }
      ],
      "region": "",
      "geographic_origin": "",
      "tradition_family": "",
      "ecclesial_orientation": "mainline|evangelical|other|unknown",
      "current_status": "active|merged|dissolved|unknown",
      "notes": "",
      "distinctives": [],
      "size_estimate": "",
      "citations": []
    }
  ],
  "edges": [
    {
      "id": "",
      "name": "",
      "from_id": "",
      "to_id": "",
      "type": "split|merge|origin|continuation",
      "year": null,
      "reasons": [],
      "causes": [],
      "narrative": "",
      "key_figures": [],
      "key_dates": [
        { "year": null, "label": "", "citations": [] }
      ],
      "description": "",
      "citations": []
    }
  ],
  "events": [
    {
      "id": "",
      "name": "",
      "year": null,
      "description": "",
      "key_figures": [],
      "related_edge_ids": [],
      "related_node_ids": [],
      "citations": []
    }
  ],
  "sources": [
    {
      "id": "",
      "title": "",
      "kind": "book|article|website|paper",
      "author": "",
      "publisher": "",
      "year": null,
      "url": ""
    }
  ],
  "citations": [
    {
      "id": "",
      "source_id": "",
      "locator": "",
      "accessed": "YYYY-MM-DD",
      "note": ""
    }
  ]
}

Rules:
- Every edge must reference existing nodes.
- Every citation must reference an existing source.
- Include split/merge reasons in edges and events when known.
- Map theological distinctives into the node `distinctives` array when sourced.
- Map denomination size estimates into `size_estimate` when sourced.
- Map denomination origin and family fields when sourced.
- Map key figures into `key_figures` on nodes/edges/events when sourced.
- Map key dates into `key_dates` with citations per milestone.
- Do not invent sources; include URLs or bibliographic details when possible.
```
