# Data Collection Prompt

Use this prompt with ChatGPT (or another LLM) to gather structured data for a
specific denomination and map it into the local JSON data model.

## Prompt Template
```
You are helping me build a church-history family tree. For the denomination(s)
listed below, extract the minimum lineage facts needed for my data model.

Denominations:
- [DENOMINATION NAMES]

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
      "region": "",
      "notes": ""
    }
  ],
  "edges": [
    {
      "id": "",
      "from_id": "",
      "to_id": "",
      "type": "split|merge|origin|continuation",
      "year": null,
      "reasons": [],
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
- Use stable slugs for ids (lowercase, hyphenated).
- If a date is unknown, set it to null and explain briefly in notes.
- Keep split reasons concise and factual.
- Every edge must reference existing nodes.
- Every citation must reference an existing source.
- Do not invent sources; include URLs or bibliographic details when possible.
```

## Practical alternatives to LLM-only extraction
- Wikipedia API + infobox parsing (fast for dates, splits, mergers).
- Wikidata queries (SPARQL) for structured dates and parent/child relations.
- Denominational official websites or archives for primary sources.
- Books or denominational histories for detailed split reasons.

## Suggested approach
1. Pull infobox data (Wikipedia or Wikidata) for dates and parent/child links.
2. Use 1-2 secondary sources for split reasons and notes.
3. Map into JSON and add citations for each claim.
