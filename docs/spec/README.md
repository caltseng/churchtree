# Product specification

The current spec is [product-spec.md](product-spec.md). Supporting standards:

- [Historical coverage](historical-coverage-standard.md)
- [Data collection prompt](data-collection-prompt.md)
- [JSON conversion](data-collection-json-conversion.md)
- [Data audit checklist](data-audit-checklist.md)
- [Detail panel fields](detail-panel-schema.md)
- [User acceptance scenarios](../user-scenarios.md)

Current implementation and source-of-truth paths take precedence over old phased
plans. Distinguish implementation completeness from historical completeness.

## Separate proposed products

- [Relationship and contacts store](contacts-store-spec.md) (Draft v0.4):
  household-centered relationship context and a proposed set of composable skills
  for cross-source identity collection, activity collection, reconciliation,
  aggregation, and 7-day, 30-day, or custom-period summaries and visualizations,
  led by a user-centered hub-and-spoke map with frequency, recency, and explainable
  reconnection signals.
  The initial delivery is a single-user local tool/file store, not a hosted site.
  The visualization belongs in the contacts product, not Muse. This specification
  does not change the current Main Branch website scope or claim implemented
  endpoint access or authorization to collect private data.
  [Technical approach and runnable collection slice](contacts-technical-spec.md) ·
  [Concrete work items and dependencies](contacts-work-items.md) ·
  [Collection skill](../../.github/skills/contacts-collect/SKILL.md).
