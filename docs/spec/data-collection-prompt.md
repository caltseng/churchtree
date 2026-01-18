# Data Collection - Extract Facts

Use this prompt with ChatGPT (or another LLM) to extract lineage facts and save
them as a notes file in `data/notes/`.

## Output location
Save results to:
- `data/notes/[denomination-slug].md`

Each note should include:
- Date collected
- Facts (nodes, edges, events)
- Sources
- Citations
- Notes summary

## Prompt Template
```
You are helping me build a church-history family tree. For the denomination(s)
listed below, extract lineage facts with sources. Return output ready to save
in a notes file under data/notes/.

Denominations:
- [DENOMINATION NAMES]

Output in this format:
Date collected: YYYY-MM-DD

Facts:
- Node: [Name] | Start year | End year (if any) | Region | Notes
- Edge: [Parent] -> [Child] | Type (split/merge/origin/continuation) | Year
  | Reasons for split/merge (short list) | Description (1-2 sentences)
- Event: [Name] | Year | Description | Related edge(s)

Sources:
- [Source id]: [Title] ([Kind]) [Author/Publisher/Year if known] [URL]

Citations:
- [Citation id]: [Source id] | Locator (page/section/URL fragment) | Accessed date

Notes Summary:
- [Short bullet summary]

Rules:
- Provide specific reasons for splits/mergers when possible.
- Keep reasons concise and factual; avoid editorial tone.
- If a date is unknown, say "unknown" and explain briefly.
- Only use sources you can name; do not invent sources.
```

## Practical alternatives to LLM-only extraction
- Wikipedia API + infobox parsing (fast for dates, splits, mergers).
- Wikidata queries (SPARQL) for structured dates and parent/child relations.
- Denominational official websites or archives for primary sources.
- Books or denominational histories for detailed split reasons.
