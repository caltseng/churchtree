# Contacts work-item register

Scope: [product specification](contacts-store-spec.md) and
[initial technical approach](contacts-technical-spec.md). Stable IDs below are
the dispatch units; dependencies are explicit, not inferred from list order.
This is a checked-in backlog, not a request to execute every item in this PR.

**Delivered** means implemented and synthetic-tested in this branch.
**Ready** means bounded work can start without reading private accounts.
**Blocked** means a listed selection/decision/prerequisite is needed, not that
someone should request secrets. No source endpoint is currently connected by this
change. Source skills are delivered instructions plus metadata-handoff collection,
not five implemented live connectors.

## Smallest end-to-end slices

**Runnable now:** CONTACTS-001 → CONTACTS-002 → CONTACTS-003 → CONTACTS-004.
Run `npm run contacts:collect -- --demo --output .private\contacts\demo-001`
in a fresh folder. Five synthetic source handoffs become one persisted manifest
and normalized record store. Replaying its request deduplicates; missing real
endpoints must instead appear as unavailable. No account authorization is needed
for this synthetic slice.

**First real-data slice (not delivered):** obtain CONTACTS-010 decisions, complete
the Google/email access gates (011, 013), implement their selected adapters (012,
014), then run an explicitly authorized metadata-only collection. Record text,
Messenger and WhatsApp as unavailable until their own gates pass. This does not
wait for the graph and does not declare every source connected.

**First summary slice:** collection + CONTACTS-022 → 023 → 024, using synthetic
direct/group/coverage fixtures first. CONTACTS-025 adds the map; 026 adds baseline
signals only after covered historical data exists. Neither is part of the initial
collector implementation.

## Delivered in this PR

| ID / title | Bounded deliverable | Prerequisites | Objectively checkable acceptance |
| --- | --- | --- | --- |
| CONTACTS-001 / Collection contract and technical design | Request, interval, handoff, identity/event and capability contracts in the companion technical spec and validator. | None | 7d/30d/custom bounds and time zone resolve; private/synthetic data classes are distinct; unknown/body/credential fields are rejected; source families and setup states are explicit. |
| CONTACTS-002 / Atomic local ingestion | `scripts/contacts/collect.cjs`: normalized snapshot, source reports, record provenance, per-connector cursors, lock and atomic page commits. | CONTACTS-001 | Replay and overlapping reviewed namespaces retain one source event; failed pages do not advance checkpoints; resume works; errors/unknown history survive beside successful sources; website output paths are rejected. |
| CONTACTS-003 / Composable collection skills | `contacts-collect` plus five focused source skills under `.github/skills/`. Each source can be requested independently through the same importer. | CONTACTS-001, CONTACTS-002 | Instructions identify actual acquisition gates, preserve roles/group evidence and metadata-only boundaries, show the invocation, and report unavailable tools without fictional success. Native parsers/live adapters are explicitly not claimed. |
| CONTACTS-004 / Synthetic runnable slice and checks | Demo generator, `contacts:collect` / `test:contacts` scripts, focused Node tests integrated into existing `npm test`. | CONTACTS-002, CONTACTS-003 | Demo imports all five synthetic families without credentials/network; CLI returns 0/2/1 for collected/partial/fatal; tests exercise DST, replay, resume, failures, group roles, conflicts and output safety. |

Product spec and index updates are also delivered; no source-access gate, native
parser, canonical identity review, numerical reducer, visualization or private
application is marked delivered.

## Access gates and per-source acquisition

Each gate is a distinct investigation/selection task. Read public provider
documentation and inspect available tool schemas without accessing accounts.
Record callable capabilities, snapshot/export alternatives, unsupported formats,
account/device/authorization requirements and history limits. A viable design
with mocks is not proof of authorized live access. Only separately approved
account/device setup can lift a real-data execution block.

| ID / title / state | Bounded scope and deliverable | Explicit prerequisites | Acceptance |
| --- | --- | --- | --- |
| CONTACTS-010 / Private data boundary / Blocked: owner decisions | Record account scope, metadata permissions, processing/storage location, ACL/encryption, retention/deletion and backup policy before real data is stored. No credential acquisition. | CONTACTS-001 | Written approved boundary distinguishes metadata from note/content workflows, prevents publication, names deletion/access controls, and identifies who authorizes each real source run. Synthetic work can proceed without this. |
| CONTACTS-011 / Google identity access gate / Ready | Select an existing authorized tool or proposed People API adapter; document read-only fields, source IDs, pagination, deletion/sync-token behavior and setup requirements. | CONTACTS-001, CONTACTS-003 | Capability record names exact available versus proposed route; documents snapshot limits and approval gaps; includes synthetic page shape; does not claim connected access from API documentation. |
| CONTACTS-012 / Google identity acquisition adapter / Blocked: selected route | Implement only the route selected by 011, with private configuration references and identity-only handoffs. | CONTACTS-002, CONTACTS-011; CONTACTS-010 additionally for real runs | Mocked pages exercise pagination, token expiry/resync, duplicate contacts and deletions without erasing curated records; no contact generates activity; unavailable auth produces an explicit report, not an empty success. |
| CONTACTS-013 / Email access gate / Ready | Select the initial email tool/provider route and document message/thread IDs, metadata-only fields, read-only permissions, recipient-role availability, pagination/history and bulk classifications. | CONTACTS-001, CONTACTS-003 | Written capability map and synthetic payload distinguish tool search limits from account history; no body read is required for frequency collection; unsupported fields/permissions have explicit outcomes. |
| CONTACTS-014 / Email acquisition adapter / Blocked: selected route | Implement one selected email route, producing metadata handoffs and a source-native cursor adapter separate from handoff cursors. | CONTACTS-002, CONTACTS-013; CONTACTS-010 additionally for real runs | Synthetic direct/To/CC/broadcast/bulk cases preserve one source message per event; pagination, auth failure and expired cursors are tested; partial history is not labeled complete. |
| CONTACTS-015 / Text device and format gate / Ready | Select initial SMS/MMS/RCS/iMessage device/reader/export route and supported version; record platform/time-zone/identifier/group/coverage limitations. | CONTACTS-001, CONTACTS-003 | One supported initial format is specified with lawful acquisition/setup steps and synthetic field examples; missing cloud/RCS history or group IDs remains explicit; no device/backup is inspected without authorization. |
| CONTACTS-016 / First text metadata converter / Blocked: format selection | Implement only the format chosen by 015; later formats are separate follow-on tasks rather than implied support. | CONTACTS-002, CONTACTS-015; CONTACTS-010 additionally for real runs | Synthetic four-person group, direct SMS, time-zone ambiguity, missing stable IDs and reimport fixtures preserve original roles and timestamps; ambiguous formats fail visibly; no message-body storage. |
| CONTACTS-017 / Personal Messenger access gate / Ready | Evaluate already available structured tools versus authorized export conversion; treat Muse UI acquisition, business APIs and personal-inbox access separately. | CONTACTS-001, CONTACTS-003 | Records which personal-account metadata can actually be acquired, which needs setup, export layout/version and encrypted-history limits; browser-query success alone cannot close a structured-access requirement. |
| CONTACTS-018 / First Messenger acquisition route / Blocked: selected personal route | Implement one viable route from 017, either a verified adapter or a versioned metadata-only export converter; never a fictional personal API. | CONTACTS-002, CONTACTS-017; CONTACTS-010 additionally for real runs | Synthetic direct and four-member group fixtures preserve one sender/event; local IDs are labeled and stable; truncated/encrypted export history and unsupported layouts yield partial/unsupported results; no private browser-session reuse. |
| CONTACTS-019 / Personal WhatsApp access gate / Ready | Select a supported authorized personal route or a specific export format/version, documenting group, linked-device, timestamp and history constraints. | CONTACTS-001, CONTACTS-003 | Does not equate business APIs with access to personal groups; records actual tools versus proposed setup; defines how IDs and time zones will be preserved or why a format is unsupported. |
| CONTACTS-020 / First WhatsApp acquisition route / Blocked: selected personal route | Implement only the route selected by 019, with explicit snapshot/live capability status. | CONTACTS-002, CONTACTS-019; CONTACTS-010 additionally for real runs | Synthetic overlapping exports, group messages, ambiguous local times, missing IDs and history limits are tested; imports are idempotent under the documented local/provider ID strategy; no device pairing or sending is automated. |

## Shared model, summaries and product views

| ID / title / state | Bounded scope and deliverable | Explicit prerequisites | Acceptance |
| --- | --- | --- | --- |
| CONTACTS-021 / Source revisions and overlap reconciliation / Ready | Design/implement explicit identity/thread/event revisions, per-thread coverage, edit/deletion targets and reviewed translation of overlapping connector IDs; retain source evidence and audit trail. | CONTACTS-002 | Synthetic changing profiles, edits, deletion tombstones, differing thread coverage, historical group membership and two connectors exposing different IDs are reconciled without double-counting or destructive source-record replacement; unresolved collisions stay visible. |
| CONTACTS-022 / Identity review skill / Ready | Add an independently usable skill and persisted reviewed mapping from namespaced identities to canonical people, with reversible splits and optional curated household links. | CONTACTS-001, CONTACTS-002 | Same-name unrelated people remain distinct; reviewed email/phone/provider matches combine; splitting preserves observations/notes; household membership is never inferred from surnames or chat membership; mapping revision is explicit. |
| CONTACTS-023 / Cross-source aggregation skill and reducer / Blocked: identity contract | Add pure deterministic per-person/thread/channel/day aggregation over snapshots and a focused skill to run it. Do not render UI. | CONTACTS-021, CONTACTS-022 | Synthetic fixtures prove half-open boundaries, DST date unions, one event per source ID, direct versus group-only activity, To/CC handling, bulk/unclassified disclosure, unknown versus zero and lower-bound totals. All totals reconcile to source events and coverage. |
| CONTACTS-024 / Period summary contract and presentation skill / Blocked: aggregates | Persist one shared 7d/30d/custom reporting dataset and a focused summary/presentation skill, with people table, per-channel counts and daily timeline data. | CONTACTS-023 | Fixed-fixture totals match across table/timeline/summary; period, time zone, as-of, mapping revision, exclusions, source freshness and coverage travel with every output; no narrative-generated numbers; known inactive people remain in the cohort. |
| CONTACTS-025 / User-centered graph / Blocked: report dataset and private host | Implement contacts-product hub-and-spoke UI with a supporting person-to-thread view, not a Muse screen or public Main Branch route. | CONTACTS-024, CONTACTS-031 | Synthetic fixtures show user at center, intentional labeled frequency bands, visible recency, group-only and unknown coverage categories, an outer inactive band, explainable selection details, keyboard access and usable mobile portrait/landscape. All views use the same filters and do not imply emotional closeness. |
| CONTACTS-026 / Reconnection opportunity and outlier signals / Blocked: covered history | Compute explainable deviations from each person's own baseline and due curated rhythms, separate from frequency ranking. | CONTACTS-024, CONTACTS-027 | Covered synthetic decline and due-rhythm cases surface with baseline/current/last-contact/reason; insufficient or mismatched coverage cannot become decline; no importance score, guilt ranking, auto-send or meaningful-date reset. Thresholds are explicit proposals/tuning values. |
| CONTACTS-027 / Curated relationship records and note capture / Ready | Define persisted canonical households, groups, unchanged original notes, explicit meaningful connections and curated rhythms, independent from observations. | CONTACTS-022 | One household can have one person; one note can involve several households; capture and encounter dates remain separate; observed mail/group activity never resets confirmed connection dates; source changes cannot overwrite curated notes. |
| CONTACTS-028 / Weekly reconnection review / Blocked: curated records and aggregates | Add a user-invoked explainable household recommendation workflow with follow-up completion/deferment, using saved records and source links where available. | CONTACTS-024, CONTACTS-027 | Recommendations show evidence, last confirmed connection or unknown, outstanding context and an actionable existing thread; deferral does not alter long-term rhythm; no automatic sending or schedule creation. |
| CONTACTS-029 / Prayer triage / Blocked: private note workflow | Add user-invoked editable prayer plans and explicit request/status updates grounded in original notes. | CONTACTS-027, CONTACTS-010 | Synthetic request/update examples preserve originals, ask for ambiguous status, and never infer answered/resolved from elapsed time; no sensitive context leaks into outreach outputs. |
| CONTACTS-030 / Life-update audience review / Blocked: canonical records | Add editable household-to-individual recipient selection with inclusion reasons and explicitly recorded wording preferences. | CONTACTS-027, CONTACTS-010 | Synthetic missing/ambiguous/duplicate addresses are visible; exclusions are editable; beliefs are not inferred; final output is a reviewed list/draft only, with no sending or donation records. |
| CONTACTS-031 / Private application hosting boundary / Ready: design only | Choose a private contacts runtime/interface/storage approach distinct from the existing static public site, plus an implementation plan and publication/access guards. | CONTACTS-001 | Decision documents auth/access, local versus hosted tradeoffs, privacy gates and the graph host; automated build checks prove contacts docs/tooling/private artifacts are absent from public output. Any real deployment additionally requires CONTACTS-010. |
| CONTACTS-032 / Source operations and retention / Blocked: real adapter contracts | Add explicit refresh/resync, stale-source reporting, retention/deletion and recovery UX for chosen acquisition routes. Scheduling requires separate authorization. | CONTACTS-010, CONTACTS-021, and each adapter among 012/014/016/018/020 that it operates | Synthetic interruption, expired cursor, source disconnection and deletion cases preserve curated notes, expose stale coverage, purge approved cached metadata and recover without duplicate events; no recurring job is silently created. |

## Dispatch boundary

After the prerequisite PR is merged, hand this register and its merged commit to
Phalanx Captain. Dispatch remaining IDs with the dependencies and blocked conditions
above; do not redispatch CONTACTS-001 through 004 as unimplemented connectors.
Access-gate investigations and synthetic implementation do not grant account access.
Captain should retain blocked items explicitly rather than treating missing
credentials/devices or nonexistent APIs as completed work.
