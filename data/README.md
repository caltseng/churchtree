# Historical data

Canonical records live in `sets/<set>/nodes.json`, `edges.json` and optional
`events.json`, with per-node research under `sets/<set>/notes/`. Shared sources and
citations live in `common/`; set-local source/citation files are also supported.
`common/tags.json` is optional metadata and is not currently an explorer filter.

The release build discovers every set and writes generated `dist/data/data.js`.
Use `npm run build` (`scripts/build-site.cjs`), the only denomination bundle
generator, and run `node scripts/validate-data.cjs dist/data/data.js` on that
artifact. The compact bundle is generated, not edited by hand. The obsolete
source-preview `data/data.js` is ignored and no longer tracked; serve the built
`dist/` site instead. Build discovery is not permission to import unreviewed or malformed data.

The catalog contains 94 nodes across 20 sets. Church History shows 92 of them.
The Latter-day Saints and Jehovah’s Witnesses profiles remain in the public data
bundles. The U.S. denomination coverage audit documents the pre-expansion
baseline. Coverage remains incomplete. Read
`docs/spec/historical-coverage-standard.md`, the data-audit checklist and
`docs/data-quality-audit.md`. A citation's presence, a populated profile, and a
passing build establish different things. Missing nodes, unsupported causes,
ambiguous date bases and exceptions must remain visible in the research workflow.
