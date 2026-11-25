---
name: contacts-email-activity
description: Prepare authorized email activity metadata with stable source IDs, recipient roles, pagination and coverage for private contacts collection.
---

# Email activity collection

Use independently or under [contacts-collect](../contacts-collect/SKILL.md).
Follow its authorization boundary and the
[shared contract](../../../docs/spec/contacts-technical-spec.md). No Gmail
HTTP/OAuth adapter or raw mailbox parser ships with this skill.

1. Resolve account, period/time zone/as-of, canonical account namespace and optional
   source checkpoint. Inspect available, already authorized email tools before
   claiming access. Do not acquire credentials or broaden permissions.
2. Retrieve available message/thread metadata, not bodies/snippets/attachments.
   Preserve stable message/thread IDs, actual sender, sent timestamp, available
   To/CC/BCC roles and verified self identities. Unknown roles/identities must not
   become assumed direct exchanges; stop normalization if required evidence is absent.
3. Emit the versioned handoff with `source: email`, `channel: email`.
   Keep multi-recipient/broadcast/group/unknown threads distinct from two-person
   direct threads. One email remains one event, not one event per recipient.
4. Preserve explicit interpersonal/bulk/automated/unclassified classifications.
   Collection does not implement a classifier; do not silently exclude uncertain
   mail or invent classification evidence. A future reducer will disclose exclusions.
5. Preserve source retrieval times, page cursors and upstream history bounds.
   Cursor exhaustion is not proof of complete history. Record source errors or
   partial coverage, including search/result limits.
6. Import through `contacts:collect` with this source only for an independent refresh,
   or return the handoff to the coordinator. Source checkpoints advance only with
   persisted pages; the helper's handoff cursor is not a Gmail history token.

Without a verified authorized tool or supplied normalized metadata, report
`requires_setup`. Native mailbox exports require a separately implemented converter.
Do not turn a narrative query answer or aggregate estimate into source events.
Reusing a second connector requires reviewed shared upstream IDs/account namespace.
Validate behavior with synthetic fixtures via `npm run test:contacts`.
