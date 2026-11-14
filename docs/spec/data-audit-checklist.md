# Data Audit Checklist

Use this checklist to verify data accuracy, consistency, and citation quality.
The governing editorial requirements are in
[Historical coverage and completeness](historical-coverage-standard.md).
Passing this checklist's structural items does not establish historical completeness.

## Substantive history review — every node
- Define the historical unit and the period/geography actually covered.
- Explain immediate predecessors, founders/participants, aims, and the mechanism
  of formation; distinguish roots from institutional parents.
- Explain major periods after founding, consequential changes in practice,
  leadership and mission, and both incoming and outgoing divisions.
- Identify influential/adopted documents and changes in their status. Do not
  project current doctrine onto founding participants.
- Name every immediate merger partner and necessary intermediate institution.
  Explain what happened to dissenting minorities and continuing bodies.
- Explain continuation/end and identify supported successors. A departing branch
  does not replace a parent that continues.
- Compare a primary/institutional history with independent or other-party
  evidence for disputed causes. Attribute confessional judgments.
- Write a per-node finding about the expected historical account and actual gaps;
  a field-count table is not this review.

## Missing records and tradition balance
- Check raw IDs/aliases, set files, generated bundle, display groups, filters,
  clustering, and search before calling a denomination missing.
- Separate missing nodes, missing edges, missing episodes in present profiles,
  overbroad/misidentified units, and UI-hidden records.
- Prioritize missing ancestors/merger partners/intermediates, then major omitted
  in-scope branches, then optional global expansion.
- Record each proposed addition's identity, date basis/uncertainty, rationale,
  expected links/types, sources, affected records, and review disposition.
- Review Black church histories, women/lay agency, minority theological streams,
  and social/political conditions rather than covering only dominant institutions.
- Distinguish missing research, intentionally out of scope, not applicable,
  present-but-hidden, and unsupported/conflicted claims with explicit reasons.

## Source quality
- Prefer primary or official denominational sources when available.
- Confirm at least one reliable source per key claim (date, parent, split).
- Ensure every citation has a clear locator (page, section, or URL fragment).
- Record access date for web sources.

## Node accuracy
- Names match official or commonly accepted usage.
- Start/end years are correct or explicitly marked as unknown.
- Each date says whether it is a revival, organization, incorporation, naming,
  adoption, effective union, census recognition, or approximate period marker.
- Short labels are unambiguous.
- Notes clearly flag any uncertainty.
- Theological distinctives are cited when present.
- Size estimates are cited when present.

## Edge accuracy
- Parent/child direction is correct.
- Split/merge/origin/continuation/influence type is appropriate. Fellowship
  suspension or indirect influence is not automatically a denominational split.
- Year matches cited sources.
- Split reasons are factual and concise.
- Description clearly states the role of each side (e.g., which group is
  conservative or liberal), when applicable.

## Event accuracy
- Event name is specific and time-bound.
- Event year aligns with cited sources.
- Event links to the correct edges and nodes.

## Consistency checks
- Every edge references existing node ids.
- Every citation references an existing source id.
- No duplicate ids across nodes, edges, events, sources, or citations.
- Slug formatting is consistent and stable.

## Change control
- New data includes citations before merge.
- Substantive review and remaining coverage gaps are documented separately from
  structural checks. Do not describe a field-populated profile as complete history.
- Conflicts between sources are documented in notes.
- Major changes are summarized in commit messages.
- Periodic QA checklist: `plans/qa-periodic-check.md`.
