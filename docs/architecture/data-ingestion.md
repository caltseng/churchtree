# Data ingestion workflow

Use [historical coverage standards](../spec/historical-coverage-standard.md) and
[data-model.md](data-model.md) together. A profile with populated fields is not
necessarily a sufficient history, and a citation ID is not itself evidence quality.

1. Define the node's identity, geography, scope and date basis. Distinguish an
   institution, movement, event, migration, polity and display group. Inventory
   immediate predecessors and merger partners before drawing a direct edge.
2. Research authoritative accounts and primary documents; record alternative
   interpretations and founders' self-descriptions with attribution.
3. Keep per-node notes under `data/sets/<set>/notes/<slug>.md`. Record sources,
   claims, disputes, missing episodes and missing intermediate bodies explicitly.
4. Convert to `data/sets/<set>/nodes.json`, `edges.json` and optional `events.json`.
   Shared evidence belongs in `data/common/sources.json` / `citations.json`; set-local
   evidence can use the corresponding files in that set. Both are bundled.
5. Include substantive formation/continuation, beliefs, people/roles, milestones,
   documents and reading previews with claim-level references. Add successor IDs
   only for supported institutional continuations; an active parent does not end
   whenever a group splits away. Don't silently merge distinct historical phases.
6. Review all edge/event endpoints, nested/profile citation maps, dates and source
   locators. Current dated-node validation expects a finite numeric start_year.
   If a proposed date is unknown or only an arbitrary visual anchor, document that
   limitation and resolve its modeling before import; never invent a year merely
   to satisfy a validator. Origin context can be displayed outside the time scale.
7. Run `npm run ci` against the rebuilt release. For a source-preview update, also
   run the legacy PowerShell builder; never edit generated bundle text manually.
8. Review the actual profile, branches and timeline at desktop/mobile sizes. Check
   for missing expected history and whether grouping hides records from discovery.
9. Commit source and tracked generated outputs on a topic branch, push its PR,
   inspect required CI and follow the protected deployment process.

Adding a new node requires corresponding sources and relationships, an explicitly
stated date interpretation, and review of neighboring profiles. Adding a new set
requires nodes/edges files; discovery is automatic. Raw notes and unresolved research
are not automatically a publication-ready dataset. Record intentional exclusions,
not-applicable categories and unresearched gaps separately.
