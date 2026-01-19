# ChurchTree

Personal project to document and visualize major branches in church history
with an interactive website, with emphasis on American Protestant movements.

## Goals
- Create a clear, navigable timeline of major branches and movements.
- Provide concise, sourced summaries with links for deeper study.
- Build an interactive site that makes relationships easy to explore.

## Scope (initial)
- Focus on broad historical branches and key American Protestant streams.
- Capture dates, people, movements, and connections at a high level.
- Produce a written spec and architecture documents before coding.

## Non-goals (for now)
- Exhaustive global coverage of every tradition.
- Detailed doctrinal debate or apologetics.
- A full academic reference work.

## Planned artifacts
- Product spec: vision, user stories, content model, UX flows.
- Architecture docs: data model, system design, stack choices.
- Implementation plan: milestones, backlog, and release targets.

## Project principles
- Clarity over exhaustiveness.
- Sources and citations for factual claims.
- Neutral tone; descriptive rather than argumentative.

## Status
In early build-out. The data model and Phase 0 visualization are in place,
with an initial Presbyterian US dataset and notes-first workflow.

High-level progress:
- Spec + architecture docs drafted.
- Notes-first data pipeline established.
- US Presbyterian dataset seeded with citations, distinctives, and size estimates.
- European Presbyterian roots notes and JSON added, with lineage edges into early US Presbyterianism.
- D3 graph rendering from combined static datasets, with zoom, hover, and edge labeling.

## Quick start (local)
- Build data for the web view:
  `powershell -ExecutionPolicy Bypass -File scripts/build-data-js.ps1`
- Open `index.html` in a browser to view the graph.
