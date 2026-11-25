---
name: contacts-collect
description: Collect authorized contacts and communication metadata through focused source skills into a private, resumable cross-source snapshot with explicit coverage and unavailable-source reporting.
---

# Contacts collection

Read [the product specification](../../../docs/spec/contacts-store-spec.md),
[technical contracts and examples](../../../docs/spec/contacts-technical-spec.md),
and [work-item status](../../../docs/spec/contacts-work-items.md). Follow AGENTS.md.
This skill coordinates acquisition instructions and a runnable local metadata
importer; it does not provide API access, connect accounts, or render the map.

## Inputs and authorization

Establish requested source/account references, 7-day/30-day/custom period, IANA
time zone, explicit as-of instant, private output directory, and checkpoint/resume
choice. For a real run, confirm authorization for the selected accounts,
metadata fields, local storage/processing boundary, and retention. A request to
create this skill or run its demo is not permission to read communications.
Never acquire credentials, pair a device, reuse a private browser session, install
a bridge, schedule jobs, or send messages under this skill's implicit authority.

Do not put credentials, private records, request files, or account examples in
tracked files. Use `.private/contacts/<chosen-folder>` or an explicitly approved
location outside this checkout, never website folders or `data/sets/`.

## Compose the source skills

For each requested source, follow its focused workflow:

- [Google identities](../contacts-google-identities/SKILL.md)
- [Email activity](../contacts-email-activity/SKILL.md)
- [Text activity](../contacts-text-activity/SKILL.md)
- [Personal Messenger activity](../contacts-messenger-activity/SKILL.md)
- [Personal WhatsApp activity](../contacts-whatsapp-activity/SKILL.md)

Inspect the current tool catalog/capabilities before claiming a source is callable.
Use only already available, separately authorized access. Do not infer access from
a provider name, previous narrative answer, successful browser query, business API,
or this skill's presence. If no suitable tool or contract-conforming handoff exists,
include an explicit unavailable source entry, with `requires_setup` or `unsupported`
and its reason. Do not drop that source or generate an empty successful page.

The delivered runnable route is `metadata-import`: focused skills normalize
metadata from verified tools or an explicitly supplied normalized handoff into the
versioned contract. **Native provider export parsers and live HTTP adapters are
not implemented.** If normalization cannot preserve stable IDs, actual sender
roles, timestamps or coverage, stop that source and report the gap rather than
turning a prose summary or estimated count into observations.

## Run and inspect

For an account-free demonstration only, choose a fresh folder and run:

```powershell
npm run contacts:collect -- --demo --output .private\contacts\demo-001
```

For a prepared request:

```powershell
npm run contacts:collect -- --request .private\contacts\run-001\request.json
```

Do not swallow a nonzero exit. Exit 2 means the persisted manifest is partial;
inspect each requested source's status/error. Exit 1 is fatal. All sources can
still yield useful partial records without being presented as complete coverage.

The single `collection.json` snapshot atomically stores manifest, normalized
records, provenance and checkpoints. Never hand-edit its records or checkpoints.
Rerun the same input without resume to verify idempotency, or use `resume:true`
with the exact same resolved interval/as-of and the next saved input page.
Changing the interval requires a fresh traversal (`resume:false`), not reuse of
an unrelated cursor. A lock conflict requires confirming the previous process has
stopped before removing only the exact stale lock file.

Report the private output path, requested/resolved interval and time zone,
per-source status/freshness/coverage, unresolved identities, and concrete missing
access/format capabilities. Do not paste private account IDs or records into
public artifacts. A successful synthetic demo proves local ingestion only.

## Handoff boundary

No name-only person merges, inferred couples, group-membership-to-direct exchanges,
relationship-quality scores, meaningful-connection resets, source writes,
automations, or visualization implementation belong in collection. Canonical
identity review, deterministic aggregation and rendering are separate work items.
