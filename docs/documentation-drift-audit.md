# Documentation drift audit

Reviewed 2026-11-14 against the current source tree and GitHub configuration.

| Drift found | Resolution / source of truth |
| --- | --- |
| README described only a desktop ChurchTree prototype. | Rewritten for Main Branch, its landing inventory, separate tools, mobile and current identity. |
| Root was assumed to be the explorer. | Home is generated from inventory metadata; explorer lives at `/church-history/`, reader at `/westminster/`. Tests and interactive launch use the new route. |
| Architecture indexes and overview were placeholders. | Replaced with actual modules, page/data/build flow and release boundaries. |
| Ingestion and three research plans referenced removed root-level data JSON. | Updated to per-set records and common/local evidence. |
| Product spec described embedded parent_id, a single Presbyterian slice and Mermaid phases. | Replaced with current graph model, scoped orientations, profiles, reader and clearly future work. |
| Desktop-only scope contradicted mobile follow-ups. | Current scope and breakpoint made explicit; original plans labeled as historical. |
| Panel schema placed people before milestones and omitted formation/end/documents/reading. | Matched to implemented order, fields, lifespan behavior and reading-sheet lifecycle. |
| Documentation allowed null node dates while current validator rejects them. | Explicitly documented current finite-date release constraint and prohibition on invented dates. Unknown-origin modeling remains a known limitation. |
| Source-preview data bundle and release data were treated as the same artifact. | README/architecture distinguish legacy `data/data.js` from regenerated `dist/data/data.js`. |
| Local-only checks and direct main pushes were described as the release path. | Added protected PR, required check, exact-artifact deployment and auto-merge policy. Live policy is distinct from its checked-in template. |
| Domain configured on GitHub could be mistaken for a live HTTPS site. | DNS/Pages/certificate checks separated; GoDaddy parking cutover remains explicitly pending. |
| Theme proposals and logo studies could be read as an adopted brand. | Main Branch Woodland solid identity is explicit; interface palettes remain proposals. |
| Test instructions were scattered and had no acceptance outcomes. | Added user-scenarios.md with steps, expected behavior, suite mapping and evidence limits. |
| WCF public-domain wording might be read as approval for any modern edition. | Linked specific source memo; primary text separated from new editorial study work. |

## Maintenance rules

- README is the entry point; current spec/architecture/deployment describe the
  implemented contract. Historical audits/plans retain their dates and limitations.
- Update generators/templates and tracked HTML together, then inspect output.
- New feature work needs a scenario, an appropriate test and docs identifying what
  is implemented versus proposed. New node work needs historical coverage review.
- Keep deployment state factual: branch push, PR checks, merge, Pages deployment,
  DNS routing and HTTPS are separate observations.
- Run the documentation-link check with CI. It validates local Markdown destinations,
  not external URL freshness, textual truth, or future-plan completion.

## Remaining limitations

The historical audit contains baseline sections superseded by its explicit follow-up;
those sections are preserved as an audit trail. Collection plans are not rewritten as
proof of complete scholarship. The deeper WCF chapter layer is an active separate
track. Browser/emulation coverage is documented, not represented as certification of
every physical device. Domain cutover status must be updated after actual verification.
