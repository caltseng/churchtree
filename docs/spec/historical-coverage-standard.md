# Historical coverage and completeness standard

This is the editorial standard for collecting, converting, reviewing, and expanding ChurchTree data. Read it with [the data model](../architecture/data-model.md) and [audit checklist](data-audit-checklist.md). A populated profile, a working screen, and resolving citations are necessary engineering checks; none establishes historical completeness.

## Scope and units of history

The current priority is major US Protestant churches and the European, revival, migration, and organizational contexts needed to explain them. Catholic and Orthodox records currently provide bounded context, not comprehensive histories of those communions. Global denominational histories, ancient Christianity, and every local congregation are not yet exhaustive coverage commitments. State the selected historical cutoff and geography in each collection batch; an active church's founding-only account must not imply coverage through the present.

Identify what each record means before collecting dates: a denomination, movement, local congregation, mission society, constitutional phase, demographic process, regional aggregate, or church-government tradition. The present `kind` enum is coarse; explain finer identity in `profile_scope` and research notes. Do not silently turn a society into a denomination, a display group into a historical body, or a present label into proof of an unchanged institution across centuries.

## Minimum substantive profile standard

For every applicable category below, supply a supported explanation or a specific unresolved question. Copying family-level labels is insufficient.

1. **Origins and agency:** immediate institutional predecessors; earlier intellectual/revival roots; founders and other consequential participants with roles; who organized the body and why that organization was needed then. A founder's earlier affiliation is not automatically the parent institution of the new church.
2. **Why formation happened:** theological disagreements, authority/governance, mission and practical cooperation, social/political circumstances, and founders' stated aims where historically material. Explain the mechanism (a vote, exclusion, withdrawal, mission initiative, legal change, or union), not merely “doctrinal differences.” Attribute participants' allegations and distinguish them from independent historical conclusions.
3. **Development after founding:** identify the major periods that changed the body—consolidation, institutional or geographic expansion, doctrinal/confessional change, important leadership transitions, and major disputes. An account of a century-old body ordinarily needs founding, a consequential later period, and its subsequent trajectory. A short-lived body or narrowly defined context node may reasonably have fewer periods; explain why rather than inventing them.
4. **Beliefs and documents in history:** explain beliefs in plain language, what they meant for worship/government/practice, and how they distinguish relevant streams. Name consequential confessions, catechisms, constitutions, declarations, liturgies, and publications, with authoritative links and adoption/status evidence. Separate adopted, proposed, inherited, influential, superseded, and illustrative documents. Modern doctrine is not automatically founding doctrine.
5. **Disputes and branches:** include major splits both **into and out of** the body. Identify the issues, parties, process, and outcome; give competing interpretations where material. Check the other party's account. Do not select only controversies that favor one confessional perspective.
6. **Merger and reorganization:** identify every immediate merger partner, effective date, successor identity, and what happened to continuing minorities. Explain skipped intermediates. An omission may be declared during research, but a seemingly complete merger tree cannot conceal a missing partner.
7. **Continuation or ending:** say whether the body continues, renamed, reorganized, merged, divided, dissolved, or diffused. Explain why/how, identify supported successors, and distinguish the end of a corporation from continued congregations or teaching. A split-off is not the terminal successor of its still-active parent.
8. **Limits and evidence:** state disputed dates, unknown causes, identity ambiguities, material missing episodes, and the observation date/definition of statistics. Tie evidence to the specific historical claim; a bibliography is not blanket substantiation.

Use `formation_narrative`, `ending_narrative`, `core_beliefs`, structured `key_figures`, `key_dates`, `key_documents`, `further_reading`, `successor_ids`, `profile_scope`, and `profile_citations` for current display-compatible content. Additional research findings can live in set notes and the audit report. Do not put facts only into an unrendered new field and claim the visible profile is corrected.

There is no fixed number of words, citations, people, or milestones that proves completeness. At least one explained position, named historical process, or justified exception is required in each applicable category. “Active,” “merged,” “Reformed,” and a founder's name alone do not meet that standard. Evidence should include the foundational text or proceedings when available, an institutional history, and independent historical assessment when contested causes matter. Record a retrieval failure as a limitation, not as evidence that a document never existed.

## Explicit date semantics

For each start/end/relationship milestone, state its basis in the label or narrative: first congregation, revival, organizing meeting, constitution, legal incorporation, name adoption, effective merger, census recognition, or chosen period marker. Distinguish authoring from adoption and constitution from operational startup.

The current schema accepts integer years or `null`; it does not natively encode ranges. Describe ranges and approximation in prose and use `null` when selecting one year would mislead. A conventional plot marker must be labeled as such. Stable IDs can retain old year strings after a correction; IDs are identifiers, not evidence for dates. Never infer a factual date from an ID.

`origin`, `split`, `merge`, and `continuation` describe institutional relationships. `influence` describes transmission of ideas/practices or indirect heritage and must not masquerade as legal succession. An influence may precede a target's constitution or survive its source's institutional ending; an institutional origin cannot have a future parent. Fellowship suspension, cooperation, and membership in a network are not automatically institutional splits. Until a suitable relationship type exists, use a cited event/context explanation rather than forcing one into `split`.

## Missing-node and missing-episode assessment

Every collection/review batch must examine both the profile **and its neighborhood**:

- List immediate predecessors, merger partners, consequential split-offs, intermediary institutions, and successor candidates. Compare names/aliases against raw JSON, set membership, and the generated bundle before calling them absent.
- Classify each gap as **missing node**, **missing relationship**, **missing episode inside a present profile**, **misidentified/overbroad existing node**, or **present but hidden by the UI**. A revival, book, person, or one-time vote often belongs in a milestone rather than a new denomination node.
- Prioritize A: missing ancestry/partners/intermediates that distort an existing path; B: major omitted branches inside declared scope and tradition balance; C: optional breadth outside that scope. Size/popularity alone is not the ranking rule.
- For proposed additions record: proposed identity/slug, date basis and uncertainty, why it matters, likely parent/child/successor relationships and their types, supporting sources, affected existing records, and disposition. A recommendation is not an approved/imported node.
- Check balanced representation across traditions, Black church institutions, women and lay participants, minority streams, and social/political context. Balance means explaining consequential actors and developments, not assigning equal counts to unrelated histories.
- Inspect compressed direct edges for hidden intermediates. A statement such as “later became X” requires checking which institutions changed, what survived, and whether X already exists under another name.

Do not silently import a large speculative backlog. Correct verified errors and supported episodes within authorization; propose identity-sensitive new branches with a concrete evidence packet for review. Do not fabricate a common ancestor or universal founder merely to make the graph connected.

## Record each category's disposition

Use these meanings consistently in research notes/audit results:

| Disposition | Meaning | Required explanation |
|---|---|---|
| Covered within stated scope | Material history is explained with evidence for the chosen period/unit | Identify which history and period were assessed; this is not “all facts known” |
| Missing research | An applicable question is unanswered or inadequately supported | State the question, needed source, priority, and next action |
| Intentionally out of scope | Relevant history is deliberately excluded by the declared coverage boundary | Cite the boundary and explain any distortion the omission might cause |
| Not applicable | The historical unit genuinely lacks that category | For example, a revival era has no corporate merger or universal constitution; explain the unit |
| Present but UI-hidden | Raw record and bundle contain it, but a filter/cluster/navigation state hides it | Record the ID and observed code/UI state; do not create a duplicate record |
| Unsupported/conflicted | Evidence does not settle the current assertion | Attribute competing claims, lower certainty or remove unsupported precision, and retain the review question |

Missing research cannot be relabeled “not applicable” because an initial search failed. Intentionally out of scope cannot excuse a missing immediate merger parent while presenting a complete merger. Unknown is a research state, not a historical event.

## Review and publication gate

Before describing a dataset as historically reviewed, produce a per-node **substantive** findings list: expected story, actual coverage, missing or distorted episodes/relationships, evidence, priority, and disposition. Include a separate tradition-balance and missing-node register. A row of field counts is only a mechanical inventory.

Run structural validation and bundle parity checks after approved data edits. Separately inspect citations for actual support, historical identity, date semantics, neutrality, and discoverability. Publish remaining limitations and the as-of date. If substantive gaps remain, describe the result as an introductory or partial history with named gaps, even when every JSON field exists and tests pass.
