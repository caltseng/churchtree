---
name: contacts-messenger-activity
description: Prepare authorized personal Messenger metadata for contacts collection without mistaking business APIs, browser queries or export snapshots for verified live history access.
---

# Personal Messenger activity collection

Use independently or under [contacts-collect](../contacts-collect/SKILL.md).
Follow its authorization boundary and the
[shared contract](../../../docs/spec/contacts-technical-spec.md).

1. Establish the explicitly authorized personal account and requested period.
   Inspect actual installed tools/capabilities. A Page/business conversation API
   is not evidence that personal inboxes or existing friend groups are accessible.
2. No live personal Messenger adapter or native export converter ships here.
   An earlier successful Muse browser query does not install a personal-agent API
   or establish full-history access. Do not inherit its private authenticated browser.
   Any new browser/export acquisition needs separate authorization and verification.
3. If an already authorized tool exposes structured metadata, preserve stable
   thread/message/sender IDs, actual event instants, participant membership,
   explicit self identities and direct/group distinctions in `source: messenger`,
   `channel: messenger` handoffs. Name-only exports need reviewed local IDs;
   never silently merge participants by display name.
4. Document source pagination, encryption/linked-device/history limits, actual
   retrieval time and partial/unavailable periods. Narratives, inferred totals
   and search snippets are not timestamped observations.
5. Keep bodies and attachments out of the handoff. Import a valid normalized
   envelope with `contacts:collect`, independently or with the coordinator.

Otherwise return `mode: unavailable`, `requires_setup` for missing authorized access,
or `unsupported` for an unimplemented native format. Do not request session cookies,
credentials or an account connection. Keep group activity separate from direct
exchanges; do not give every group member credit for a sender's one message.
Validate with `npm run test:contacts`, not the user's inbox.
