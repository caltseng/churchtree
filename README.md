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
Starting from scratch. Next step: write the detailed specification.

## Quick start (local)
- Build data for the web view:
  `powershell -ExecutionPolicy Bypass -File scripts/build-data-js.ps1`
- Open `index.html` in a browser to view the graph.
