# Profile and relationship presentation

This describes the implemented explorer, not a new storage schema. Editorial
coverage requirements live in historical-coverage-standard.md; runtime compatibility
and field shapes live in ../architecture/data-model.md.

## Node profile

Current order:

1. Kind and supported lifespan, full name, summary, Trace ancestry action.
2. Identity (family, region, orientation, status).
3. Why it formed; what happened to it; supported successor links.
4. Core beliefs and distinctives.
5. **Milestones**, then **Key people** with roles, snippets and article links.
6. Key documents/confessions with significance; further reading previews.
7. Scale; relationships; evidence.

An active body without an end date shows start–present. A recorded end year takes
precedence. Unknown status/ending is not silently converted to an active body.
Sources/citations and profile-specific maps supply provenance; the UI also renders
nested person/document evidence. A source list does not establish support for every
sentence. Missing fields render explicit gaps rather than invented content.

Desktop keeps the profile in a resizable side pane. Under 1100px it moves into a
native modal reading sheet with a Back to graph action. The same profile element
returns to desktop on resize; mobile controls do not replace desktop interactions.

## Relationship profile

Type/date, title, parties, narrative, reasons/drivers, milestones, people and evidence.
Grouped lines list their underlying relationships instead of inventing a new direct
split. A collapsed origin path is labeled as lineage context and can list intermediates.
Mixed relationship types have a distinct dashed style. Relationship dates describe the
transition/influence, not necessarily the founding date of either endpoint.

## Data expectations

Rich node profiles should include summary, formation/ending narratives, beliefs,
people, milestones, documents, further reading and claim-linked evidence, plus
scope/uncertainty. Applicable successors use stable existing IDs. Required editorial
coverage and runtime-required fields differ; automated integrity checks alone are
not an audit of complete history or interpretation.
