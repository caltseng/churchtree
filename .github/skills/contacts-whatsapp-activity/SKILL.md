---
name: contacts-whatsapp-activity
description: Prepare authorized personal WhatsApp metadata with explicit group, linked-device and history coverage limits for private contacts collection.
---

# Personal WhatsApp activity collection

Use independently or under [contacts-collect](../contacts-collect/SKILL.md).
Follow its authorization boundary and the
[shared contract](../../../docs/spec/contacts-technical-spec.md).

1. Establish the authorized personal account, interval, time zone and as-of instant.
   Inspect actual installed tools/capabilities. A business API is not evidence of
   access to personal inboxes or existing personal groups.
2. No live WhatsApp connector or native archive parser ships here. Use only a
   separately authorized verified structured tool or supplied normalized handoff;
   do not pair a device, install Beeper/a bridge, or request credentials.
3. Normalize to `source: whatsapp`, `channel: whatsapp`, preserving thread IDs,
   actual sender identities, original timestamps, participant membership, group
   identity and explicit self identities. A native text export may lack stable IDs
   or time-zone information; without a reviewed converter/identity strategy,
   report unsupported instead of fabricating those fields.
4. Keep existing group conversations separate and preserve one observation per
   actual message. Group membership must not imply pairwise communication.
5. Report linked-device, export, pagination and available-history limits with
   retrieval time. Do not present snapshots as ongoing sync or cursor exhaustion
   as proof of full upstream history. Never use a narrative answer as raw counts.
6. Import a contract-conforming metadata envelope through `contacts:collect` for
   this source only, or return it to the coordinating skill.

If access is absent, return `mode: unavailable`, `status: requires_setup` and the
specific missing capability. Use `unsupported` for an unimplemented supplied
format. Collect metadata only; no message bodies, media or private examples in git.
Run `npm run test:contacts` to validate the synthetic collection path.
