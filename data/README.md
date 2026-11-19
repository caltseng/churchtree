# Historical data

Canonical records live in `sets/<set>/nodes.json`, `edges.json` and optional
`events.json`, with per-node research under `sets/<set>/notes/`. Shared sources and
citations live in `common/`; set-local source/citation files are also supported.
`common/tags.json` is optional metadata and is not currently an explorer filter.

The release build discovers every set and writes generated `dist/data/data.js`.
Use `npm run build` and the validator on that artifact. `data/data.js` remains a
legacy source-preview bundle refreshed by `scripts/build-data-js.ps1`; don't edit
it by hand. Build discovery is not permission to import unreviewed or malformed data.

Current baseline: 63 nodes across 13 sets; coverage is incomplete. Read
`docs/spec/historical-coverage-standard.md`, the data-audit checklist and
`docs/data-quality-audit.md`. A citation's presence, a populated profile, and a
passing build establish different things. Missing nodes, unsupported causes,
ambiguous date bases and exceptions must remain visible in the research workflow.
