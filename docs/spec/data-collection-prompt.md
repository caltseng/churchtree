# Data Collection - Extract Facts

Use this prompt with ChatGPT (or another LLM) to extract lineage facts and save
them as a notes file in `data/sets/[set-id]/notes/`. Follow
[Historical coverage and completeness](historical-coverage-standard.md); extracting
a founding year and attaching citations is not a complete historical account.

## Output location
Save results to:
- `data/sets/[set-id]/notes/[denomination-slug].md`

Each note should include:
- Date collected
- Facts (nodes, edges, events)
- Sources
- Citations
- Notes summary
- Expected historical coverage and period/geography assessed
- Missing episodes, ancestors, merger partners, intermediates, and successors
- Evidence-backed proposed additions and explicit research dispositions

## Prompt Template
```
You are helping me build a church-history family tree. For the denomination(s)
listed below, research a substantive history with lineage facts and sources.
Follow docs/spec/historical-coverage-standard.md. Return output ready to save
in a notes file under data/sets/[set-id]/notes/.

Denominations:
- [DENOMINATION NAMES]

Output in this format:
Date collected: YYYY-MM-DD

Facts:
- Node: [Name] | Start year | End year (if any) | Region | Geographic origin | Tradition family | Ecclesial orientation | Current status | Summary | Key figures | Key dates | Theological distinctives | Size estimate
- Edge: [Parent] -> [Child] | Type (split/merge/origin/continuation) | Year
  | Reasons for split/merge (short list) | Causes/drivers (short list) | Narrative (1-3 paragraphs) | Key figures
- Event: [Name] | Year | Description | Key figures | Related edge(s)

Sources:
- [Source id]: [Title] ([Kind]) [Author/Publisher/Year if known] [URL]

Citations:
- [Citation id]: [Source id] | Locator (page/section/URL fragment) | Accessed date

Notes Summary:
- [Short bullet summary]

Historical Coverage Review (one substantive assessment per node):
- Historical unit; covered period/geography; expected story
- Immediate predecessors and founders/participants with roles
- Why it formed: issues, aims, social context, organizational mechanism
- Development after founding: major periods, mission, leadership and doctrinal change
- Beliefs and consequential documents; adoption/status and historical changes
- Major incoming/outgoing disputes and splits; parties and competing accounts
- Complete immediate merger parentage and intermediate institutional phases
- Continuation/end: why/how, successors, continuing minorities
- Actual missing episodes and evidence needed; do not report filled fields as completeness

Missing-Node / Missing-Edge Register:
- Proposed identity/slug, date basis and uncertainty, why needed, likely links/types,
  sources, affected present records, priority and disposition
- Distinguish missing node, missing edge, missing episode, overbroad identity,
  and present-but-UI-hidden records; check raw IDs/aliases and bundle first
- Priority A: existing-path distortions; B: major in-scope branches and balance;
  C: optional expansion beyond the declared scope

Rules:
- Provide specific reasons for splits/mergers when possible.
- Keep reasons concise and factual; avoid editorial tone.
- If a date is unknown, say "unknown" and explain briefly.
- Only use sources you can name; do not invent sources.
- Key figures should explain who the person was and their role, with a biography
  or authoritative article link and citations; do not invent a sole founder.
- Key dates should be short bullets (YYYY: label) and must be cited.
- Distinguish founding, constitution, incorporation, name changes, effective
  merger, census recognition and approximate period markers. Unknown stays unknown.
- Do not infer institutional parentage from a founder's earlier affiliation.
- Label documents adopted/proposed/inherited/influential/superseded/illustrative.
- Mark each applicable category covered, missing research, intentionally out of
  scope, not applicable, UI-hidden, or unsupported/conflicted; explain the choice.
- Report all immediate merger partners and major outgoing branches. Do not make
  a continuing parent appear to end because some congregations departed.
- Use primary/official records and independent or other-party history for
  disputed motives. Do not repeat a church's claim of exclusive faithfulness as fact.
```

## Practical alternatives to LLM-only extraction
- Wikipedia/Wikidata can locate candidate names, aliases, and leads; infoboxes
  are not sufficient evidence for institutional identity, causation, or completeness.
- Denominational official websites or archives for primary sources.
- Books or denominational histories for detailed split reasons.
