# Westminster study layer: research and implementation plan

## Aim and limits

Keep the 1647/Schaff confession unchanged and central. Every chapter receives optional, substantive editorial notes, not a claim to an exhaustive commentary or a guide to a denomination’s current subscription requirements. The first release will compare selected primary standards and documented revisions, explaining context with historical scholarship. Modern commentary is paraphrased; sources are linked at the claim level.

## Research sequence

1. Establish the baseline: hosted 1647 chapter/section numbering; distinguish the 1788 American revisions, later Presbyterian revisions, and other confessions rather than treating them as one standard.
2. Read authoritative primary comparisons: OPC’s published Confession, Savoy Declaration (1658), Second London Baptist Confession (1677/1689), Augsburg Confession (1530), Canons of Dort (1618–19), Roman Catholic Catechism, and the Church of Scotland’s 1647 adopting act. Use Westminster Assembly Project and published historical scholarship for assembly context.
3. Build a chapter coverage matrix. For every chapter: a grounded explanation of an important historical or interpretive issue and at least one specific, accurately scoped comparison, revision or contextual note. Do not manufacture a disagreement or a formal exception just to fill a slot.
4. Distinguish note kinds: historical context; doctrinal comparison; textual revision; formal subscription procedure. A different confession is evidence of a doctrinal comparison, not evidence that a Presbyterian church permits an exception. A denominational revision is a changed text, not an individual exception. Subscription decisions require jurisdiction, date, and the actual decision or rule.
5. Check each claim against the cited section, retain source locators and research limits, and paraphrase modern material. State where a note is a comparison/inference rather than a recorded assembly motive. Avoid attributing one fixed position to every Baptist, Lutheran, Catholic, Presbyterian or Reformed church.
6. Integrate only after all 33 chapters are covered. Validate source references, chapter/section references, coverage and editorial/text separation; run browser tests for no-JS access, direct note links, keyboard focus, mobile behavior and theme compatibility.

## Data contract (version 1)

`westminster/study-sources.json`: registry keyed by stable IDs. Each source stores title, author/institution, document date/edition, URL, source type (primary/historical scholarship), jurisdiction/scope, date accessed, and reuse treatment. Sources are identified editions, not generic denominational labels.

`westminster/study-notes.json`: schemaVersion, baselineEdition, lastReviewed, editorialPolicy, researchLimits, subscriptionScope, and chapters. Each chapter has chapter number, a short orientation, and entries. Each entry has a stable `id`, `kind`, title, relevant `sections`, paraphrased `body`, and `citations` (source ID, specific locator, and supporting scope). Each entry carries `reviewStatus` and `reviewedOn`. Orientation is navigation/editorial framing, not an additional unsupported historical claim.

Stable reader addresses: `#study-N` for chapter notes, `#note-N-slug` for an individual entry, existing `#chapter-N` and `#section-N-S` unchanged. Notes are compiled into the HTML so no-JavaScript readers can open them. The JSON is independently usable and retained alongside generated HTML.

## Interface

A small “Go deeper” disclosure after the chapter heading/section index. Closed by default; no inline commentary interrupts the confession. Expanded content is visibly labeled “Editorial study notes,” distinguishes note types, links relevant original sections, supplies claim-level citations and further reading, and offers “Return to the confession.” Use native disclosure semantics and keyboard support. Direct study/note links reveal the correct chapter and open its notes. Close/reopen preserves the text and chapter position. Shared theme tokens govern colors; no separate palette or new dependency.

## Acceptance checks

- All 33 chapters have substantive, sourced notes; all source IDs/URLs/section references resolve structurally.
- Notes identify specific standards and dates, and distinguish changes in wording from differences in belief and formal subscription decisions.
- Primary text JSON is byte-for-byte unchanged by this feature; generated passage text matches it.
- No modern commentary is reproduced verbatim. Registry and reader disclose research limits and further reading.
- Reader remains calm with disclosures closed, usable at 320px and on desktop, navigable by keyboard, and complete without JavaScript.
- Existing reader checks remain compatible with `CHURCHTREE_TEST_ROOT=dist` and Playwright CI environment variables. Parent handles deployment/CI registration; no shared root files or workflows are edited here.

## Release review record

Initial plan written 14 November 2026, before the research and study implementation. Completed checks and concrete limits will be recorded below after implementation.

## Completed first release · 14 November 2026

Implemented **67 source-checked editorial notes across all 33 chapters**, backed by **32 identified source records**. The registry records institutions, editions/dates, jurisdictional scope, access dates and reuse treatment. `study-build.cjs` validates coverage, IDs, types, section references, review metadata and citations on each reader build. Both JSON files are downloadable from the reader.

Native disclosures start closed. `#study-N` and `#note-N-slug` links reveal the relevant chapter and commentary with JavaScript; native disclosures remain operable without it. Source links identify supporting locators, while edition details and scope appear under further reading. Notes are labeled editorial and distinct from the unchanged historical text.

### Review boundaries

This is a first editorial source check, not independent peer review or an exhaustive history of interpretation. Reading guides explain the hosted primary text; document comparisons do not establish private motives or unanimity among the divines. Contemporary comparisons use named sources rather than claims about everyone in a tradition.

The modern-exception material is limited to the PCA’s **2024** examination procedure. It does not claim that any individual’s difference was allowed. The Scottish Assembly’s 1647 qualification is an adopting act, not a personal exception. Future entries claiming actual allowances must cite the court, date, record and precise permitted difference, never infer permission from a view’s existence.

Comparisons were checked against Schaff’s confession/Savoy texts, the Remonstrant institute’s 1610 articles, the Scottish adopting act in the historical Acts, Augsburg articles, identified Baptist chapters, relevant Holy See Catechism sections and the dated EUB/UMC confession. The Westminster Assembly Project supplies scholarly documentary chronology. Catholic links point to the sections containing the passages, rather than simply a navigation page. Polemical descriptions by one tradition are not treated as neutral evidence about another.

### Copyright and reproducibility

The confession in `content.json` is unchanged. Notes are original paraphrases and comparisons, not copied commentary or study-guide text. Modern references retain their own rights; the confession’s public-domain status does not license modern editions. The source registry records paraphrase-only treatment.

No extra runtime or package dependency is needed. `build.cjs` requires local `study-build.cjs`, automatically running data validation. Existing `test-reader.cjs` invokes `test-study.cjs`, preserving `CHURCHTREE_TEST_ROOT`, `PLAYWRIGHT_MODULE` and `PLAYWRIGHT_CHANNEL`. The artifact needs `study-notes.json` and `study-sources.json`, already covered by the parent’s JSON-copy rules. CJS helpers stay outside the public artifact.

### Coverage matrix

| Chapter | Study topics |
| --- | --- |
| 1. Of the Holy Scripture | Scripture and tradition: the actual point of difference; Why the confession and its proof texts are separate |
| 2. Of God, and of the Holy Trinity | Reformed theology within older Trinitarian Christianity; The Western wording about the Spirit |
| 3. Of God's Eternal Decree | Election and foreseen faith; The chapter supplies its own guardrails |
| 4. Of Creation | A documented Presbyterian debate about six days; An interpretation is not automatically an allowed exception |
| 5. Of Providence | Providence does not erase ordinary causes; A shared denial, with different degrees of explanation |
| 6. Of the Fall of Man, of Sin, and of the Punishment thereof | Every faculty, not equal outward wickedness; A Catholic comparison with its qualifications |
| 7. Of God's Covenant with Man | Different administrations, not different ways of salvation; The 1689 Baptist confession rearranges the account |
| 8. Of Christ the Mediator | Two natures, one person: substantial shared ground; For whom redemption is purchased and applied |
| 9. Of Free-will | The will in innocence, fall, grace and glory; Civil and spiritual ability in Augsburg |
| 10. Of Effectual Calling | Grace’s effect, not its necessity; What the infant clause does—and does not—say |
| 11. Of Justification | Accounting righteous and inward renewal; Faith alone, but never a solitary faith |
| 12. Of Adoption | Related benefits without collapsing them; Adoption is not exclusively Reformed |
| 13. Of Sanctification | Progress is not perfection in this life; A specific Wesleyan formulation of Christian perfection |
| 14. Of Saving Faith | Believing a proposition and resting in Christ; Close agreement across a baptismal divide |
| 15. Of Repentance unto Life | Necessary does not mean meritorious; Confession to God and sacramental confession |
| 16. Of Good Works | Works matter without becoming the basis of pardon; What Catholic “merit” is claiming |
| 17. Of the Perseverance of the Saints | Can a justified person finally fall away?; Warnings and discipline still have a purpose |
| 18. Of the Assurance of Grace and Salvation | A believer may wait for assurance; Can experience certify one’s state of grace? |
| 19. Of the Law of God | Expired judicial laws and continuing equity; Not law versus no law |
| 20. Of Christian Liberty, and Liberty of Conscience | Not a modern religious-liberty charter; The American text removes civil enforcement |
| 21. Of Religious Worship and the Sabbath-day | Instituted worship and human church ordinances; Different rationales for Sunday observance |
| 22. Of Lawful Oaths and Vows | A contrast with historic Mennonite teaching; The OPC text omits the required-oath sentence |
| 23. Of the Civil Magistrate | A changed religious task for the magistrate; Office-holding is distinct from religious establishment |
| 24. Of Marriage and Divorce | Deletion of the rule about a deceased spouse’s kin; Dissolution and remarriage versus an indissoluble bond |
| 25. Of the Church | Who belongs to the visible church?; The Antichrist identification is edition-specific |
| 26. Of the Communion of Saints | Union without erasing the Creator–creature distinction; Mutual provision without abolishing property |
| 27. Of the Sacraments | Neither bare symbols nor an automatic effect; Two gospel sacraments and the Catholic seven |
| 28. Of Baptism | Infants and immersion: two differences; No simple baptized/saved equation |
| 29. Of the Lord's Supper | More than “real” versus “symbolic”; One sacrifice and a continuing celebration |
| 30. Of Church Censures | Restoration, protection and the keys; Where church authority resides |
| 31. Of Synods and Councils | Scottish approval qualified the magistrate’s role; Five original sections become four; Binding determinations or interchurch advice? |
| 32. Of the State of Men after Death, and of the Resurrection of the Dead | Immediate heavenly life and final purification; More than the soul’s survival |
| 33. Of the Last Judgment | Shared judgment, without manufacturing a dispute; What the chapter leaves unspecified |

### Validation completed

- Build and published-reference verification passed for the canonical `/wcf/` artifact. Source files remain under `westminster/`; the new study tests also support that source path when explicitly testing the checkout.
- All 33 chapter note links passed at 1440×1000, 390×844 and 320×568. Tests cover native Enter/Space disclosure controls, note reload, browser history, return-to-text focus, method links, local citation targets and horizontal overflow.
- Existing reader checks passed at 1440, 768, 390 and 320px. No-JavaScript disclosures and all 172 primary passages passed. Every rendered passage matches `content.json`; that file has no feature diff.
- Parchment, Slate and Ink were checked; desktop and mobile screenshots were visually inspected. Deep-linked native summaries remain in the Tab order. Source labels were enlarged after visual review.
- Syntax checks and note-data validation passed. No new dependencies, root navigation/theme changes, workflow changes, branch changes, commits or pushes were made for the study layer.

## PCA audit extension · 14 November 2026

The completed all-chapter audit is documented in [westminster-pca-audit.md](westminster-pca-audit.md). The source registry now has 34 sources, including the official PCA confession and preface. `pca-audit.json` adds explicit statuses for all 33 chapters, adopted-text changes, smaller wording/source flags, the historical-to-PCA numbering map and edition/hash provenance. The baseline JSON is unchanged. The build fails if its audited hash changes, requiring intentional re-audit rather than stale comparison claims. Audit content is rendered inside the existing optional study disclosure, including the 27 chapters with no substantive doctrinal difference identified; transcript flags are distinguished from adopted revisions and subscription exceptions.
The completed study/PCA audit delivery was verified with the full repository CI command in an isolated main-based topic worktree. Routing changes remain in the separate route PR; tests handle both artifact paths without changing routing configuration.
