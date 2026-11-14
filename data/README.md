# Data Files

Primary data lives in each `data/sets/[set-id]/` directory as `nodes.json`,
`edges.json`, and `events.json`, with research notes and optional local evidence.
The current dataset has 13 sets; it is broader than the original Presbyterian seed.

Shared metadata lives in:
- `data/common/sources.json`
- `data/common/citations.json`
- `data/common/tags.json`

Collection and audits must follow
[Historical coverage and completeness](../docs/spec/historical-coverage-standard.md).
Explain expected history, major later periods, complete merger parentage, and
missing branches/intermediates. Distinguish absent records from UI-hidden records;
field/citation validation alone does not establish completeness.

Build `data/data.js` for the web app with:
```
powershell -ExecutionPolicy Bypass -File scripts/build-data-js.ps1
```
