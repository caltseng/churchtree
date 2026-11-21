# Build a second historical timeline

This guide proposes a small, sourced chronology for Main Branch. The new paths,
contract and route below are implementation targets for a future change.

## How Church History works today

| Stage | Current implementation |
| --- | --- |
| Research | [Per-set notes](../data/sets/presbyterian-us/notes/README.md) record identities, evidence and gaps. [Ingestion](architecture/data-ingestion.md) converts reviewed findings to canonical JSON. |
| Storage | Each folder in [data/sets](../data/sets) supplies nodes and edges, plus optional events, sources and citations. [Data model](architecture/data-model.md) documents church-specific fields, including dated bodies and institutional relationships. Shared evidence lives in [data/common](../data/common). |
| Release bundle | [build-site.cjs](../scripts/build-site.cjs) discovers and combines all sets and shared sources/citations, emitting `dist/data/data.js` as `window.CHURCHTREE_DATA`. The [PowerShell builder](../scripts/build-data-js.ps1) refreshes the tracked legacy source-preview bundle separately. |
| Checks | [validate-data.cjs](../scripts/validate-data.cjs) checks unique and present IDs within each collection, finite node start years, edge and successor endpoints, and source/citation references. It does not verify historical claims or enforce event link integrity. |
| Display | [Church History HTML](../church-history/index.html) loads D3 and the bundle. [explorer.js](../explorer.js) handles overview, selection, search and compact lineage. [graph-groups.js](../graph-groups.js) defines curated display groups. [timeline-model.js](../timeline-model.js) clusters dates and derives branch lanes for the [vertical](../timeline.js) and [horizontal](../horizontal-timeline.js) renderers. |
| Routing | [site.config.json](../site.config.json) declares landing cards and public folders. [build-home.cjs](../scripts/build-home.cjs) generates tracked home HTML. The release builder copies selected root assets and allowed files in approved folders into clean `dist/`. [Deployment](deployment.md) explains the publication workflow. |

A second folder under `data/sets/` would feed the Church History page. Give a
new topic its own dataset, loader and route. Reuse the visual foundations and
interaction patterns. The current lineage renderer assumes church bodies and a
year-based axis, so day-precision events need their own date and layout logic.

## Scope the first release

Use **Road to war in Europe, 1936–1939** at
`/road-to-war-in-europe/`. Start on March 7, 1936 and stop on September 3,
1939. Select 8–12 events across three lanes for territorial expansion,
agreements and commitments, and responses. Scope the narrative to European
developments. State the exclusions, including earlier diplomacy and events in
Asia, on the page and in the editorial notes. Start with the three sourced
records below, then research Austria in 1938, Czechoslovakia in March 1939,
the guarantees to Poland, the German–Soviet pact, and the British and French
declarations of war. Include the perspectives of affected states when reviewing
the roster and sources.

Each milestone occupies one display lane and may have many participants with
different roles. A lane is a visual category. A true branch implies supported
continuity from an identifiable entity to a successor, such as when an
institution divides. A merger needs one incoming link per documented predecessor.
Keep that structure separate from the example's parallel tracks. Show a few
typed cross-links where they aid navigation. `followed-by` asserts chronology.
`responds-to` and `implements` need evidence for the connection itself.
Attribute causal interpretations in the detail panel and represent material
disagreements. Date proximity alone cannot establish causation.

## Collect and review evidence

1. Define the scope, inventory candidates and keep a gap log. Record which
   actors and perspectives are missing, why a candidate belongs, and what is
   unresolved. Use the [coverage standard](spec/historical-coverage-standard.md)
   and [audit checklist](spec/data-audit-checklist.md) as editorial models.
2. Find institutional overviews and follow their references to archives, treaty
   texts and diplomatic records. Search variant names and date ranges. Compare
   independent sources and record authorship, vantage point and translation.
   Two transcriptions of the same treaty are one source. Its text can establish
   what was agreed, while implementation needs separate evidence.
3. Collect in a workbook or TSV tables. Keep the staging exports and notes in
   `data/timelines/road-to-war-in-europe/research/`, outside the public folders.
   Use join rows for repeatable fields and export dates as text to preserve
   precision.

   | Table | Columns |
   | --- | --- |
   | Events | ID, title, lane ID, earliest/latest date, precision, date kind, date basis, summary, review status |
   | Lanes and actors | ID, label, scope or identity note |
   | Participation | Event ID, actor ID, role |
   | Relationships | ID, type, from ID, to ID, wording, review status |
   | Claim evidence | Record ID, claim key, exact claim, citation ID, source ID, page/section/paragraph, supports or disputes, evidence note, access date |
   | Sources and assets | Source ID, author/creator, title, institution, publication date, stable URL, archival reference, license, credit, permission |
   | Gaps | Question, affected IDs, alternative claims/dates, priority, disposition |

4. Separate the dates of negotiation, signature, communication and entry into
   force. When sources disagree about the same action, preserve both with
   locators and explain the chosen display basis. Use an honest uncertainty
   window or an unplaced record when evidence cannot narrow it.
5. Ask a reviewer to read each cited passage, check the date basis and source
   independence, and confirm that links and scope are defensible. Record
   reviewer, date and outstanding gaps. Seek corroboration for disputed or
   consequential claims or flag the limit explicitly. Publish original summaries
   and source links first. For scans, photos, translations or excerpts, record
   the specific reuse terms and required credits. An accessible scan does not
   itself grant republication rights.

### Example records and claim locators

| Event | Date basis and supporting evidence |
| --- | --- |
| Rhineland remilitarization | March 7, 1936, expansion lane. German troops entered the demilitarized Rhineland. [US Holocaust Memorial Museum, German Prewar Expansion, Rhineland discussion](https://encyclopedia.ushmm.org/content/en/article/german-prewar-expansion). |
| Munich conference | September 29–30, 1938, agreements lane. Use the conference span. The text is dated September 29, a US diplomatic telegram reports delivery to Czechoslovakia on September 30, and the museum's foreign-policy article dates the signing to September 30. Keep the different date claims in the detail without assigning an exact signing day to the conference entry. [Museum conference account](https://encyclopedia.ushmm.org/content/en/article/german-prewar-expansion) · [Agreement text](https://avalon.law.yale.edu/imt/munich1.asp) · [US telegram and editorial note](https://history.state.gov/historicaldocuments/frus1938v01/d682) · [Museum foreign-policy account](https://encyclopedia.ushmm.org/content/en/article/german-foreign-policy-1933-1945). |
| German invasion of Poland | September 1, 1939, expansion lane. Date the invasion separately from the declarations of war. [British War Blue Book, summary and references to documents 112–115](https://avalon.law.yale.edu/wwii/summary.asp) · [Museum history of the invasion](https://encyclopedia.ushmm.org/content/en/article/invasion-of-poland-fall-1939). |

## Normalize reviewed data

Use canonical JSON under `data/timelines/road-to-war-in-europe/` with the
collections below. Export only approved fields. Use stable lowercase slugs and
retain an alias for any changed public fragment. One lane covers many events.
Events and actors form a many-to-many relationship with a role on each
participation. Each directed relation has two distinct event endpoints. Events
can participate in many relations. Each historical claim needs one or more
citation IDs. Each citation names one source and identifies a specific passage.
A single citation may support several claims.

```json
{
  "lanes": [{ "id": "agreements", "label": "Agreements and commitments" }],
  "actors": [],
  "events": [{
    "id": "munich-conference",
    "title": "Munich conference",
    "lane_id": "agreements",
    "participants": [],
    "date": {
      "start": "1938-09-29",
      "end": "1938-09-30",
      "precision": "day",
      "kind": "duration",
      "basis": "Conference dates"
    },
    "summary": "The conference agreed to the German annexation of the Sudetenland.",
    "claim_citations": {
      "date": ["ushmm-munich-section"],
      "summary": ["ushmm-munich-section"]
    }
  }],
  "relations": [],
  "sources": [{
    "id": "ushmm-german-prewar-expansion",
    "title": "German Prewar Expansion",
    "publisher": "United States Holocaust Memorial Museum",
    "url": "https://encyclopedia.ushmm.org/content/en/article/german-prewar-expansion"
  }],
  "citations": [{
    "id": "ushmm-munich-section",
    "source_id": "ushmm-german-prewar-expansion",
    "locator": "The Munich Agreement and the Partition of Czechoslovakia"
  }]
}
```

Represent a relation with `id`, `type`, `from_id`, `to_id`, a short
`summary` and its `claim_citations`. Add participant objects with
`actor_id` and `role` and cite claims about participation individually. For
a point event, set equal date bounds and use `kind: "instant"`. Use
`YYYY-MM-DD`, `YYYY-MM` or `YYYY` at day, month or year precision.
The bounds of a duration are inclusive. An `uncertain-window` bounds where an
event might fall. For unknown dates use null bounds and set both kind and
precision to `unknown`. Keep unplaced records available in the list.

Convert date periods to UTC coordinates at the view boundary. Use the earliest
possible date and then ID for a deterministic sort in both views. Show a partial
date as a period and explain that sorting within an uncertain period is an
editorial convention. Validate calendar values, precision and bound consistency,
required fields, enums, IDs, participants, endpoints and claim references.
Reject self-links and duplicate typed links. Check directional chronology where
date bounds determine it. Overlapping windows require independent evidence for
any asserted order. If a future topic adds structural lineage, reject cycles
in those links. Check published entries against the reviewed roster.

## Implement and preview

1. Add the dedicated source page and a build step called by
   [build-site.cjs](../scripts/build-site.cjs). Validate the canonical dataset
   before generating public data and HTML. Allowlist public fields and review
   the finished artifact using the [publication boundary](public-site-boundary.md).
2. Generate a chronological HTML list and details with stable fragments such as
   `#munich-conference`. Enhance it with a vertical date axis and labeled lanes.
   Show durations as intervals and uncertainty with a distinct treatment and
   text. Preserve dates when label positions shift to avoid collisions. Group
   crowded labels with a count and a way to inspect members. Show selected
   cross-links and offer text links to their endpoints. Maintain the same
   selection and deep link across list, layout and viewport changes.
3. Provide keyboard navigation, visible focus, readable contrast in each theme,
   and access to every event and citation without dragging or distinguishing
   colors. Keep the list usable on mobile and without JS. Return focus to the
   trigger when closing any detail overlay. Use [brand.css](../brand.css), the
   canonical Woodland solid mark and an accessible link home. Follow the
   [design language](design-language.md).
4. Register the folder under `publicDirectories` and the relative route in
   `pages` in [site.config.json](../site.config.json). Inspect the generated
   home card and timeline. Commit generator changes and tracked outputs.

Run from the repository root. These commands also preview the current site.

```sh
npm ci
npm run build
npm run check
npm run serve
```

Open `http://127.0.0.1:4173/`, then follow the new home card once implemented.
The current explorer is at `http://127.0.0.1:4173/church-history/`.

## Verify and ship

- Add model tests for impossible dates, leap days, partial dates, overlapping
  windows, equal-date ordering and lane collisions. Add validator fixtures for
  duplicate IDs, invalid bounds, missing endpoints and citations, and unsafe
  public export.
- Add a [user scenario](user-scenarios.md) and browser test against `dist/`.
  Follow the home card, select Munich by keyboard, verify the date range and
  citations, reload the event fragment and navigate a cross-link. Check touch,
  focus, themes and narrow layouts. Check the list with JS disabled. Smoke-test
  Church History and Westminster. Inspect the public artifact for broken local
  references and unintended research files.
- Run the release suite with the new tests wired in. In PowerShell, after
  stopping the preview server, use the [repository browser setup](../README.md).

```powershell
npx playwright install chromium
$env:PLAYWRIGHT_CHANNEL = 'chromium'
$env:CHURCHTREE_TEST_ROOT = 'dist'
npm run ci
```

- Follow [AGENTS.md](../AGENTS.md) for the PR. Include local results, coverage
  gaps and editorial review status. Verify the PR head and required checks.
  After merge, check the Pages deployment and open the deployed route and a
  fragment. Follow the [deployment guide](deployment.md) for the distinction
  between a Pages artifact and availability on the custom domain.

## Adapt the model for a battles chronology

Choose a bounded period and use theaters, campaigns or civilian experiences
as display tracks. Campaign membership describes containment, while
participants and organizational continuities are independent relationships.
Plan for overlapping campaigns, date disagreements, disputed casualty figures
and differing definitions of who was counted. Keep sources and attribution
attached to those claims. At this scale use broad locations and emphasize
historical context, civilian consequences and aftermath.
