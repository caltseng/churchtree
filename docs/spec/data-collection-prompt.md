# Data Collection Prompt

Use this prompt with ChatGPT (or another LLM) to gather structured data for a
specific denomination and map it into the local JSON data model. This is the
source of truth for how data should be collected.

## Two-step workflow
1) Natural language extraction: collect facts with citations.
2) JSON conversion: map the extracted facts into the data model.

## Intermediate artifacts (recommended)
Store the Step 1 output as natural-language notes in the repo so the sources
and reasoning are preserved.

Suggested location:
- `data/notes/[denomination-slug].md`

Each note should include:
- Facts section (nodes, edges, events)
- Sources section
- Citations section
- Date collected

## Prompt Template (Step 1: Extract facts)
```
You are helping me build a church-history family tree. For the denomination(s)
listed below, extract lineage facts with sources.

Denominations:
- [DENOMINATION NAMES]

Output in this format:
Facts:
- Node: [Name] | Start year | End year (if any) | Region | Notes
- Edge: [Parent] -> [Child] | Type (split/merge/origin/continuation) | Year
  | Reasons for split/merge (short list) | Description (1-2 sentences)
- Event: [Name] | Year | Description | Related edge(s)

Sources:
- [Source id]: [Title] ([Kind]) [Author/Publisher/Year if known] [URL]

Citations:
- [Citation id]: [Source id] | Locator (page/section/URL fragment) | Accessed date

Rules:
- Provide specific reasons for splits/mergers when possible.
- Keep reasons concise and factual; avoid editorial tone.
- If a date is unknown, say "unknown" and explain briefly.
- Only use sources you can name; do not invent sources.
- After producing facts, output a short "Notes Summary" for humans.
```

## Prompt Template (Step 2: Convert to JSON)
```
Convert the facts below into the JSON shape required by the project. Use stable
slugs for ids (lowercase, hyphenated). Ensure every edge, event, and reason has
citations. If a date is unknown, set it to null and add a brief note.

Facts:
[PASTE STEP 1 OUTPUT]

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
- Every edge must reference existing nodes.
- Every citation must reference an existing source.
- Include split/merge reasons in edges and events when known.
- Do not invent sources; include URLs or bibliographic details when possible.
```

## Practical alternatives to LLM-only extraction
- Wikipedia API + infobox parsing (fast for dates, splits, mergers).
- Wikidata queries (SPARQL) for structured dates and parent/child relations.
- Denominational official websites or archives for primary sources.
- Books or denominational histories for detailed split reasons.

## Suggested approach
1. Pull infobox data (Wikipedia or Wikidata) for dates and parent/child links.
2. Use 1-2 secondary sources for split/merge reasons and notes.
3. Map into JSON and add citations for each claim.
