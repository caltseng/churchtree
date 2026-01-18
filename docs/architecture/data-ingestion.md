# Data Ingestion Workflow

Reusable steps for gathering source material, extracting structured data, and
converting it into the local JSON data model.

## Overview
Goal: collect historical lineage information from external sources and produce
validated local JSON files that match `docs/architecture/data-model.md`.

## Inputs
- Target denominations or movements to research.
- Source material (books, articles, official denominational sites, etc.).

## Steps
1. Identify candidate sources.
   - Prefer primary or official sources when available.
   - Record source metadata in `data/sources.json` as you go.
2. Extract claims from sources.
   - Split events, dates, parent/child relationships, and reasons.
   - Capture the exact phrasing or summary in a working note.
3. Normalize the data.
   - Convert names to stable slugs for `id`.
   - Normalize dates to integers; use null if unknown.
   - Keep split reasons short and factual.
4. Map to the data model.
   - Add nodes to `data/nodes.json`.
   - Add edges to `data/edges.json`.
   - Add events to `data/events.json` when a specific incident triggered a split.
   - Add citations to `data/citations.json` with locators.
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
