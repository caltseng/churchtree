# Data Audit Checklist

Use this checklist to verify data accuracy, consistency, and citation quality.

## Source quality
- Prefer primary or official denominational sources when available.
- Confirm at least one reliable source per key claim (date, parent, split).
- Ensure every citation has a clear locator (page, section, or URL fragment).
- Record access date for web sources.

## Node accuracy
- Names match official or commonly accepted usage.
- Start/end years are correct or explicitly marked as unknown.
- Short labels are unambiguous.
- Notes clearly flag any uncertainty.
- Theological distinctives are cited when present.

## Edge accuracy
- Parent/child direction is correct.
- Split/merge/origin/continuation type is appropriate.
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
- Conflicts between sources are documented in notes.
- Major changes are summarized in commit messages.
