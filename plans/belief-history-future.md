# Future feature: history of beliefs and theological disagreements

Status: planned only. Do not implement as part of the desktop explorer work.

## Experience
A user chooses a topic such as communion and follows its development across
traditions, rather than following one denomination. Start with a neutral overview
of the principal positions, then explore key moments, people, documents and disputes.
Distinguish a teaching's emergence, its formal definition, institutional adoption,
and later reinterpretation. Avoid presenting one branch as the inevitable endpoint.

## First pilot: communion
Research scope should include early Christian witnesses, medieval developments,
Reformation disagreements and confessions, and selected later denominational
positions. This is a proposed research scope, not an assertion that the current
dataset already supports it. Let research determine defensible milestones and dates.

## Content model
- Topic: stable ID, names/aliases, neutral overview, scope and related topics.
- Position: substantive explanation, terminology and qualifications; positions may
  coexist within one tradition and change over time.
- Development or dispute: date or uncertain interval, context, participants,
  competing claims, outcome and unresolved interpretations.
- Attestation/adoption: who expressed or formally adopted a position, when, and in
  what capacity; distinguish individual opinion from binding church standards.
- Documents: exact edition and relevant section, publication/adoption dates,
  authoritative text URL, and relationship to a position or event.
- Evidence: claim-level citations, source perspective, confidence, contested
  interpretations and alternative readings.

Reuse stable church/person/document IDs where possible. Link topics to existing
nodes without adding belief changes as denominational split edges. A split may
have several theological and political causes; a shared belief does not establish
organizational descent.

## Interface proposal
Topic overview → positions and key disagreements → scoped chronology of developments.
Allow comparison of traditions, reading a primary document, and jumping to the
corresponding church-history node. Use compact chronology by default and an optional
proportional period view. Zoom summarizes eras/disputes and reveals individual
attestations; show uncertainty and simultaneous positions explicitly.

## Delivery sequence
1. Finish the current node profiles and source validation.
2. Agree topic vocabulary and distinguish belief, practice and institutional policy.
3. Research the communion pilot with primary texts and academic historical context.
4. Review neutrality, anachronism, translation and adoption-status claims.
5. Prototype one topic using the reviewed pilot dataset.
6. Validate that users can explain both the disagreement and its historical context.
7. Expand only after the pilot's schema and evidence model hold up.

## Acceptance for a later pilot
Every displayed historical milestone has claim-level evidence; disputed accounts
are attributed; date uncertainty is visible; institutional doctrine is separated
from individual opinion; no topic graph implies that beliefs evolved in a single
unbroken or universally accepted sequence. Include a coverage statement rather
than claiming a complete history of Christian theology.
