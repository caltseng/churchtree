# Detail Panel Schema (v0)

The side panel displays richer details for a selected node or edge, including
sources. Node and edge panels use different layouts.

## Node panel
Sections:
- Summary (rich text)
- Key figures (names)
- Key dates/milestones (year + label)
- Identity (region, origin, tradition family, orientation, status)
- Distinctives (bullets)
- Scale (size estimate + year)
- Relationships (parents, splits/merges, descendants)
- Sources (grouped by claim with links)

Required data fields:
- summary
- key_figures
- key_dates
- distinctives
- size_estimate
- citations

## Edge panel
Sections:
- Title + type
- Parties (from/to)
- Date/period
- Causes/drivers (bullets)
- Narrative (1–3 paragraphs)
- Key figures (names)
- Evidence (sources linked to claims)
- Related events

Required data fields:
- reasons
- causes
- narrative
- key_figures
- key_dates
- citations

## Source linking
Claims should be tied to citation ids. Citations reference sources that include
URLs for clickable links.
