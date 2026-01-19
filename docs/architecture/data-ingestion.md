# Data Ingestion Workflow

Reusable steps for gathering source material, extracting structured data, and
converting it into the local JSON data model.

## Overview
Goal: collect historical lineage information from external sources, capture
natural-language notes with citations, and then produce validated local JSON
files that match `docs/architecture/data-model.md`.

## Inputs
- Target denominations or movements to research.
- Source material (books, articles, official denominational sites, etc.).

## Steps
1. Identify candidate sources.
   - Prefer primary or official sources when available.
2. Extract claims from sources into notes.
   - Split events, dates, parent/child relationships, and reasons.
   - Store notes in `data/sets/presbyterian-us/notes/[denomination-slug].md` with sources/citations.
3. Normalize the data.
   - Convert names to stable slugs for `id`.
   - Normalize dates to integers; use null if unknown.
   - Keep split reasons short and factual.
4. Map notes to the data model.
   - Add nodes to `data/nodes.json`.
   - Add edges to `data/edges.json`.
   - Add events to `data/events.json` when a specific incident triggered a split.
   - Add sources to `data/sources.json` and citations to `data/citations.json`.
5. Validate consistency.
   - Every edge must reference existing node ids.
   - Every citation must reference an existing source id.
   - Ensure required fields are present.
6. Review and refine.
   - Check for duplicates or near-duplicates.
   - Reconcile conflicting dates or descriptions.
7. Commit updates with clear messages.

## Output
Updated local JSON files:
- `data/nodes.json`
- `data/edges.json`
- `data/sources.json`
- `data/citations.json`
- `data/tags.json` (optional)

## Notes
- Keep everything local for Phase 0 and Phase 1.
- If a claim is uncertain, set date to null and add a note.
- Natural-language notes in `data/sets/presbyterian-us/notes/` are the source
  of truth during data collection.
