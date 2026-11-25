---
name: contacts-text-activity
description: Prepare authorized SMS, MMS, RCS or iMessage metadata while exposing device, archive-format and history limits for contacts collection.
---

# Text-message activity collection

Use independently or under [contacts-collect](../contacts-collect/SKILL.md).
Follow its authorization boundary and the
[shared contract](../../../docs/spec/contacts-technical-spec.md). The executable
currently accepts normalized handoffs, not phone databases, backups or XML.

1. Establish the user's explicitly selected device/account/protocol source and
   requested interval/time zone/as-of. Do not inspect devices, backups, messages
   or pairing sessions just because this skill is invoked for planning.
2. Inspect a separately authorized existing tool or supplied normalized handoff.
   Live access, local database access and imported snapshots are different capabilities.
   No SMS/MMS/RCS/iMessage endpoint or native export parser is installed here.
3. Preserve actual protocols (`sms/mms/rcs/imessage`), sender identities, timestamps,
   thread IDs and group participants using `source: text-messages`. Missing IDs
   require an explicitly labeled, reviewed stable local-ID strategy, never a name
   or participant-set-only merge. Preserve threads that share the same participants.
4. Keep one group message as one observation from its actual sender. Group
   membership, reactions, system events, edits and deletions are not direct messages.
   If group identity cannot be established, retain `kind: unknown`, not direct.
5. Disclose device/export range, unsupported protocols, missing participants,
   unavailable cloud history and retrieval time. Do not label an export as live
   synchronization or complete history.
6. Import a valid metadata handoff through `contacts:collect` for this source only
   or return it to the coordinator.

If there is no verified reader, report `requires_setup`; if a supplied native
format lacks a converter, report `unsupported` and name that missing parser.
Do not install a bridge, request a backup password, pair a device, or access another
participant's account. Use synthetic checks (`npm run test:contacts`) for validation.
