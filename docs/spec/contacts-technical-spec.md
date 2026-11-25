# Contacts collection: initial technical approach

> Archived: heartbeat now owns the collector and skills. The implementation and
> npm commands described below have been removed from Churchtree; retain this
> document as historical design context, not runnable instructions.

Status: proposed architecture with a runnable metadata-handoff slice. No accounts
are connected by this change, and no live endpoint adapter or native archive parser
is implemented. See the [product specification](contacts-store-spec.md) and
[work items](contacts-work-items.md).

Confirmed execution boundary: **one user, local tool, local store in a private
location**. Prove the flow in Churchtree before polished design. No hosted
website/dashboard, cloud backend, multi-tenancy, deployment, or product account
system is in scope. Authorized source-account reads remain part of eventual
collection; local-only describes this tool's execution/storage/presentation.

## 1. Repository fit and first vertical slice

Churchtree currently builds a public, static website using Node.js 20+ CommonJS
scripts, with file-backed inputs, explicit publication allowlists, and skills in
`.github/skills/<name>/SKILL.md`. There is no contacts backend, OAuth service, or
private application store. Reuse Node's standard library and the existing skill
format; do not put contacts into the historical `data/sets/` pipeline or add a
public website route. The JSON snapshot below is the selected initial local
persistence approach, not a reason to provision a server or database service.

The smallest delivered slice is:

1. Invoke `contacts-collect` with explicitly authorized sources and an interval.
2. Delegate acquisition instructions to the five focused source skills.
3. Use a separately authorized, already available tool to produce the metadata
   handoff below, or explicitly record that source as unavailable. Discovery is
   not authorization to connect an account or install a bridge.
4. Run `scripts/contacts/collect.cjs` to validate and durably import handoff pages.
5. Inspect `collection.json`: one machine-readable snapshot containing both its
   manifest and normalized, namespaced records. Any missing source remains visible.

Steps 3-4 are intentionally separate: the implemented adapter is a **local
metadata-handoff reader**, not a fetcher for five remote APIs. It reads real
contract-conforming input when separately authorized; it also runs without accounts
using synthetic fixtures. Arbitrary vendor exports are not contract-conforming by
default. A source skill describes acquisition/normalization and the setup gate; it
does not manufacture endpoint access. Collection is separate from future identity
review, deterministic aggregation, and rendering.

## 2. Invocation and capability state

Run the account-free demonstration in a **fresh** output folder:

```powershell
npm run contacts:collect -- --demo --output .private\contacts\demo-001
```

This writes five labeled synthetic handoffs, `request.synthetic.json`, and
`collection.json`. It never uses the network, credentials, devices, browser sessions,
or real contacts. Rerun its generated request to exercise idempotency:

```powershell
npm run contacts:collect -- --request .private\contacts\demo-001\request.synthetic.json
npm run test:contacts
```

For separately authorized collection, prepare a request in a private folder and
run the same `--request` command. Inputs/output resolve relative to the request
file. Every desired source must have an entry, even if it is unavailable.

| Source skill | Implemented, callable now | Setup/access gate and limitations |
| --- | --- | --- |
| `contacts-google-identities` | Validate/import identity metadata handoffs | A verified authorized Google contacts tool is required for acquisition. No OAuth client or People API adapter ships here. Snapshot completeness is not historical contact completeness. |
| `contacts-email-activity` | Validate/import email metadata handoffs | A verified authorized email tool must expose stable message/thread IDs, timestamps, roles and pagination. No Gmail HTTP adapter ships here. Bulk classifications remain explicit. |
| `contacts-text-activity` | Validate/import SMS/MMS/RCS/iMessage metadata handoffs | Device and export/reader selection remain open. No native XML, Apple database, backup or RCS parser is implemented. |
| `contacts-messenger-activity` | Validate/import personal Messenger metadata handoffs | No verified personal-inbox API is configured here. A reported successful Muse browser query is UI-assisted acquisition evidence only, not a callable API, metadata contract, or history guarantee. Do not inherit that private session. |
| `contacts-whatsapp-activity` | Validate/import WhatsApp metadata handoffs | No verified personal-inbox connector is configured here. Native exports need a separately validated converter. Business inbox access is not evidence of access to existing personal groups. |

All five are **import-capable**, not live-connected. Native export conversion and
live acquisition remain distinct work items. Beeper and direct API credentials
are not installed or assumed. Muse may supply structured acquisition evidence
after a separate authorized workflow; the model and visualization remain here.

## 3. Request contract

Example with one available synthetic input and one explicitly unavailable source:

```json
{
  "schemaVersion": 1,
  "dataClass": "synthetic",
  "period": {
    "preset": "7d",
    "timeZone": "America/Los_Angeles",
    "asOf": "2026-11-24T20:00:00Z"
  },
  "output": ".",
  "resume": false,
  "maxPages": 10,
  "sources": [
    {
      "source": "email",
      "account": "fixture-account",
      "connector": "synthetic-handoff",
      "mode": "metadata-import",
      "input": "email.synthetic.json"
    },
    {
      "source": "messenger",
      "account": "fixture-messenger",
      "connector": "none",
      "mode": "unavailable",
      "status": "requires_setup",
      "reason": "No verified authorized personal-inbox tool."
    }
  ]
}
```

`dataClass` is `synthetic` or `private`; mixing classes in a store is rejected.
Source families are `google-contacts`, `email`, `text-messages`, `messenger`, and
`whatsapp`. Account values are reviewed, stable upstream account references, never
tokens, passwords, or connector-specific aliases. Connector names identify the
acquisition route and are separate from source identity.

`mode` is `metadata-import` or `unavailable`. Unavailable states are
`requires_setup` or `unsupported`, with a clear reason. Runtime import errors use
`failed`; successful but incomplete imports use `partial`. `collected` means the
supplied metadata snapshot covers the requested interval according to its declared
coverage, not that a remote account is connected or independently audited.
For activity, a source-wide complete interval must be covered by every included
thread; differing or unverified thread histories require partial/unknown source
coverage. Per-thread coverage/revision enrichment is CONTACTS-021, not an excuse
to mark incomplete threads complete in this initial handoff.

`maxPages` is an optional positive per-source page budget. `resume:true` starts at
the last committed cursor for the same source/account/connector and exact resolved
period. A changed interval or as-of instant requires `resume:false`; existing
records remain and replay deduplicates them. An already finished source replays
from the beginning rather than claiming that an old snapshot is freshly fetched.
The handoff must contain the saved cursor; otherwise collection reports an error.

### Period semantics

`7d` and `30d` include the current calendar day in the selected IANA time zone
and the preceding 6 or 29 days, respectively. Their exclusive end is the required
as-of instant; label the current day partial. Resolve local dates through
`Intl.DateTimeFormat`, not a fixed `N * 24 hours` subtraction across DST.

`custom` instead requires `start` and `end` ISO timestamps with explicit offsets,
plus `timeZone` and `asOf`. All intervals are start-inclusive/end-exclusive and
must be nonempty with `end <= asOf`. The resolved UTC bounds, selected zone,
preset, and as-of instant are persisted. A nonexistent start calendar day is
rejected rather than silently shifted. Collection retains original event instants;
downstream aggregation, not ingestion, applies interval filters.

## 4. Adapter/handoff contract

An acquisition adapter supplies a JSON envelope:

```json
{
  "schemaVersion": 1,
  "dataClass": "synthetic",
  "source": "email",
  "account": "fixture-account",
  "connector": "synthetic-handoff",
  "coverage": {
    "start": "2026-11-01T00:00:00Z",
    "end": "2026-11-24T20:00:00Z",
    "completeness": "complete",
    "basis": "Synthetic fixture only."
  },
  "errors": [],
  "pages": [
    {
      "cursor": null,
      "nextCursor": null,
      "retrievedAt": "2026-11-24T20:00:00Z",
      "identities": [
        {"id": "self", "idKind": "local", "isSelf": true},
        {"id": "peer", "idKind": "local", "isSelf": false}
      ],
      "threads": [
        {"id": "thread-1", "idKind": "local", "kind": "direct"}
      ],
      "memberships": [
        {"threadId": "thread-1", "identityId": "self"},
        {"threadId": "thread-1", "identityId": "peer"}
      ],
      "events": [
        {
          "id": "event-1",
          "idKind": "local",
          "eventType": "message",
          "threadId": "thread-1",
          "senderId": "peer",
          "timestamp": "2026-11-23T12:00:00Z",
          "channel": "email",
          "recipients": [{"identityId": "self", "role": "to"}],
          "classification": "interpersonal"
        }
      ]
    }
  ]
}
```

Use the demo generator for complete executable examples across all five families.
Input objects use allowlisted fields; unknown fields fail rather than being
silently dropped. The helper is deliberately not a general email/message archive
parser. Do not pass full vendor payloads, bodies, snippets, attachments, subjects,
credentials, access cookies, or raw browser transcripts.

| Record | Fields and invariants |
| --- | --- |
| Identity | `id`, `idKind: provider/local`, explicit `isSelf`; optional `displayName` and `addresses: [{type: email/phone, value}]`. Self identity must be established, not inferred from a name. |
| Thread | `id`, `idKind`, `kind: direct/group/broadcast/unknown`; optional `title`. A two-person direct thread must include exactly one self identity and one other identity before direct events are accepted. |
| Membership | `threadId`, `identityId`; both records must already exist or be in this page. Membership alone creates no activity. This initial membership record has no historical validity interval; it must not be used to reconstruct historical group rosters. |
| Observation | `id`, `idKind`, `eventType: message/reaction/membership/edit/deletion`, thread, sender (nullable for non-message events), timestamp, channel, recipients and classification. Messages require a known sender; references must resolve. No event can occur after its retrieval timestamp. |
| Recipient | Identity plus `to/cc/bcc/recipient` role; preserve email roles and never turn a multi-recipient event into one direct message per recipient. |
| Classification | `interpersonal/bulk/automated/unclassified`; collection retains all classes. Later summaries explicitly exclude bulk/automated and disclose unclassified records; no classifier is implemented yet. |
| Coverage | `start/end` (nullable when unknown), `completeness: complete/partial/unknown`, and a human-readable basis. Contact coverage is an identity snapshot, not an activity interval; complete identity snapshots may have null bounds. |
| Error | Optional envelope `errors: [{code, retryable}]`; codes must not contain secret payloads. Upstream errors keep the final source status partial even if its cursor is exhausted. |

Channels are `email`, `sms`, `mms`, `rcs`, `imessage`, `messenger`, and `whatsapp`.
Google contacts must not contain threads, memberships, or observations.
Each page includes all four arrays, even when empty. An explicit empty terminal
page with complete coverage can establish an empty snapshot; a missing file cannot.

### Identity, overlap, and mutation

Stored keys are JSON-encoded tuples `[source, account, recordType, originalId]`;
membership keys include the thread/identity tuple. Provider IDs are never replaced
by display names. If only local IDs exist, label them `local`, preserve them across
reimports of the same acquisition, and retain unresolved matches. Native export
converters must define a stable local-ID strategy before use; matching text or
participant names is not a deduplication strategy.

Overlapping connectors for the same underlying source must use the same reviewed
source/account namespace and event IDs. The collector stores an event once and
retains both connector provenances. If their IDs differ, review/translation is
required **before import**; this implementation cannot automatically detect that
overlap and must not be used to claim reconciled cross-connector totals.
Separate messages on different channels remain separate, even with identical text.

Conflicting metadata for the same key fails the page without overwriting the old
record. A new edit/deletion event may be retained under its own ID/type, but target
reconciliation, changing profiles, and temporal membership updates need the
explicit revision design in CONTACTS-014. Do not count those event types as messages.

Every stored record has provenance containing connector, SHA-256 input digest,
page cursor and retrieval instant; its key supplies source/account/original ID.
Keep the authorized handoff privately if exact digest-to-file reproduction is needed.
Source-opening URLs and provider-native payload archives are intentionally deferred.

No automatic person merge or household inference runs during collection.
`identityMappingRevision:null` and all non-self `unresolvedIdentityKeys` are explicit.
The next identity-review stage will persist user-reviewed links to canonical people,
with reversible splits and separately curated households, without rewriting the
source evidence.

## 5. Storage, atomicity, and recovery

Use a private local JSON store for this single-user tool, not a database/server
dependency. Prove acquisition, normalization, summaries and local graph files
before choosing polished UI design; there is no hosted dashboard to deploy.
Default operational location is a chosen subdirectory of ignored
`.private/contacts/`; an explicitly selected folder outside this checkout is also
allowed. Outputs within any other checkout path, including `docs/`, `assets/`,
`data/`, and `dist/`, are rejected after resolving existing directory links.
Inputs and manifests remain private even when they contain metadata only.

The collector stores **normalized metadata only**. Native raw exports stay in
their separately authorized private location; do not copy them into the repo.
The synthetic demo inputs are generated at runtime, never acquired from accounts.
Do not force-add private outputs to git or share them in a PR.

`collection.json` contains `records`, per-connector `checkpoints`, `manifest`, and
prior manifests' period/source coverage in `history`, in one generation. Historical
coverage is retained for later comparable-period checks, not reused as current
freshness. An exclusive `collection.lock` prevents concurrent writers.
Each valid page is staged in memory, then written with its checkpoint to a new
same-directory file, flushed, and atomically renamed over the snapshot. A failed
page does not advance its checkpoint. Already committed pages survive later source
failures, and unrelated sources continue. I/O failures abort rather than returning
a success-shaped empty collection.

An interrupted snapshot retains `manifest.status: in_progress`, the processed
source's partial status, and pending entries for all remaining requested sources.
On recovery, first confirm the collector process is no longer running, then remove
only that store's exact stale `collection.lock` and run the matching request with
`resume:true`. Never delete the store to clear a lock. Atomic rename is a
single-host/local-filesystem assumption; network filesystems and full power-loss
durability are not certified. Stale temporary files are not input snapshots.

Node requests owner-only POSIX file/directory modes, but Windows ACLs, encryption,
retention/deletion, backup behavior, account access, and processing consent still
need explicit review before storing real sensitive information. Git ignore and
build exclusion are not an access-control system. This change does not authorize
a real data run.

## 6. Manifest and downstream handoff

The manifest records data class, collection time, exact period, each requested
source/account/connector, status, coverage/basis, retrieval time, pagination state,
next cursor, duplicate-record count, persisted-page count, upstream errors or
validation failure, unresolved identity keys, and implementation limitations.
The CLI prints the manifest and output path, not message content or full records;
the manifest can still contain private account/identity references.

Exit codes: **0** = every supplied snapshot collected for its declared scope,
**2** = persisted partial collection (including failed/unavailable sources),
**1** = invalid request, storage/locking failure, or unexpected fatal error.
Exit 2 is not success and should not be hidden with a shell success fallback.
No stale previous source status is reused as current evidence.

A terminal cursor proves only completion of supplied pages, not complete upstream
history. Declared coverage must contain the requested activity interval and must
not extend beyond retrieval to get `collected`; contact snapshots are separate.
No numerical person-level interaction summaries are computed yet. Downstream
consumers must treat unobserved values as unknown, source-limited counts as lower
bounds, and interrupted manifests as incomplete.

## 7. Next stages and acceptance

1. **Collection first:** run synthetic five-source imports, replay and resume
   safely; disclose missing tools/formats. Add each real acquisition route only
   after its separate access gate and privacy approval.
2. **Identity and aggregation:** review canonical people mappings; build a pure,
   deterministic reducer over message events and manifest coverage. Preserve
   To/CC roles, group-only participation, direct activity, channel breakdowns,
   active-day unions, exclusions and unresolved records. Reconcile all totals
   before generating narrative or charts.
3. **Summary and map:** produce shared 7/30/custom datasets as local CLI/file output,
   then a locally generated user-centered
   hub-and-spoke map with labeled frequency bands, visible recency, known people
   without recent observations, and a supporting person-to-thread view. The
   initial proposed radius metric is distinct direct-communication days, not
   emotional closeness. Household rollups deduplicate events. Keep generated
   HTML/SVG/JSON files private and local; no website route, server or hosting.
4. **Opportunities/outliers:** compare a person's own covered baseline or curated
   reconnection rhythm, not population rankings. Never turn absent history or a
   newly disconnected channel into an apparent decline.

`npm run test:contacts` covers synthetic all-source import, cross-connector
deduplication and provenance, replay, page-budget/resume, changed-interval rejection,
failed-page rollback and recovery, body rejection, explicit missing-source states,
empty-versus-unknown history, group/broadcast evidence, event conflicts, DST/custom
periods, lock/output safety and actual CLI exit semantics. No live endpoint
validation is implied. The [work-item register](contacts-work-items.md) makes the
remaining gates, dependencies and objectively checkable deliverables explicit.
