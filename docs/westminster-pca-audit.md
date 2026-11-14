# Historical reader compared with the PCA-adopted confession

Reviewed 14 November 2026. The historical text in westminster/content.json is unchanged. The optional study layer now includes a directly sourced PCA comparison in every chapter, with original editorial summaries rather than a replacement confession.

## Result and scope

All **33 chapters and 172 historical sections** were compared with **33 chapters and 171 sections** of the [official PCA confession PDF](https://www.pcaac.org/wp-content/uploads/2022/04/WCFScripureProofs2022.pdf). **Six chapters** contain substantive adopted-text differences: 20, 22, 23, 24, 25 and 31. They affect historical 20.4, 22.3, 23.3, 24.4, 25.6, 31.1 and 31.2. The other **27 chapters** have no substantive doctrinal revision identified. This is not a claim of exact verbal identity: spelling, punctuation, smaller wording variants and apparent transcript/printing errors are recorded separately.

The [PCA publication preface](https://www.pcaac.org/wp-content/uploads/2019/11/WCFPreface.pdf) identifies this as the standards adopted by the PCA. It explains the American revisions and the later textual/editorial history. The [OPC comparison](https://opc.org/documents/WCF_orig.html) corroborates the amendment list; it was not substituted for examination of the PCA PDF itself. “PCA comparison” means this named official 2022 publication, available at the review date, not an unqualified assertion about every church’s edition or a later unexamined revision.

## Method and evidence

1. Pinned the actual local JSON baseline by SHA-256; no text replacements or spelling fixes were made.
2. Downloaded the PCA confession and preface from the supplied official URLs. The audit data retain their SHA-256 hashes, edition identification and access date. Private working downloads/extractions remain under ignored .tmp/pca-audit and are not published or committed.
3. Extracted confession body text separately from smaller Scripture proofs and superscript markers. A first extraction mixed markers/paragraph boundaries; the final character-size extraction recovered every PCA section in order. Counts and numbering were checked chapter by chapter, including the chapter 1 book list and chapter 31 omission.
4. Compared every corresponding section and examined lexical differences. Capitalization, punctuation, compound spelling and layout were separated from doctrinal changes. The same biblical canon in 1.2 is a presentation difference, not a changed canon.
5. Checked substantive changes against the official paragraphs and used the preface to distinguish adopted amendments from source/textual variants. The PCA PDF’s apparent “if” for “in” in 20.2 was visually confirmed on printed/PDF p. 95 rather than attributed automatically to extraction error.
6. Recorded an explicit original-to-PCA section map in every chapter. Historical 31.1 maps to expanded PCA 31.1; historical 31.2 is omitted; historical 31.3–5 map to PCA 31.2–4.

## Important transcript and printing findings

The all-chapter audit found apparent baseline/source problems beyond the adopted amendment list. Examples are the duplicated “head” in 2.3, “fake” in 8.2, “words” in one occurrence of the covenant phrase in 19.6, “dne” in 21.5 and “andj” in 29.8. There are also less obvious variants in 2.2, 7.3, 7.6, 8.1 and 22.7. These occur in the actual hosted transcript and are explicitly flagged, not dismissed as spelling differences or labeled PCA doctrinal amendments. A separate collation with the printed Schaff edition is required before certifying or repairing these readings. The user asked to preserve this baseline, so this task leaves them unchanged.

The PCA comparison publication itself visibly prints “if matters” in 20.2 where the hosted transcript reads “in matters.” That source-level printing variant is likewise not treated as proof of a doctrinal amendment. This audit distinguishes what the documents literally display from the separate historical question of an adopted doctrinal change.

## Chapter coverage

Page numbers below are printed/PDF page numbers in the official confession (they coincide). Boundary pages can contain the end of one chapter and the beginning of the next. The JSON provides section maps and claim-level links.

| Chapter | Adopted-text result | Wording/transcript sections flagged | PCA pages |
| --- | --- | --- | --- |
| 1. Of the Holy Scripture | No substantive doctrinal difference identified | 1.1, 1.2 | 1–8 |
| 2. Of God, and of the Holy Trinity | No substantive doctrinal difference identified | 2.2, 2.3 | 8–12 |
| 3. Of God's Eternal Decree | No substantive doctrinal difference identified | 3.4 | 12–17 |
| 4. Of Creation | No substantive doctrinal difference identified | None beyond presentation noted | 17–19 |
| 5. Of Providence | No substantive doctrinal difference identified | 5.5, 5.6 | 19–25 |
| 6. Of the Fall of Man, of Sin, and of the Punishment thereof | No substantive doctrinal difference identified | 6.2 | 26–29 |
| 7. Of God's Covenant with Man | No substantive doctrinal difference identified | 7.3, 7.6; 7.4 | 29–34 |
| 8. Of Christ the Mediator | No substantive doctrinal difference identified | 8.1, 8.2; 8.7 | 34–42 |
| 9. Of Free-will | No substantive doctrinal difference identified | 9.1, 9.2 | 42–45 |
| 10. Of Effectual Calling | No substantive doctrinal difference identified | 10.1, 10.3, 10.4 | 45–50 |
| 11. Of Justification | No substantive doctrinal difference identified | 11.1, 11.3 | 50–56 |
| 12. Of Adoption | No substantive doctrinal difference identified | None beyond presentation noted | 56–57 |
| 13. Of Sanctification | No substantive doctrinal difference identified | 13.1, 13.2 | 58–60 |
| 14. Of Saving Faith | No substantive doctrinal difference identified | None beyond presentation noted | 60–64 |
| 15. Of Repentance unto Life | No substantive doctrinal difference identified | 15.3 | 64–67 |
| 16. Of Good Works | No substantive doctrinal difference identified | 16.3, 16.6, 16.7 | 67–74 |
| 17. Of the Perseverance of the Saints | No substantive doctrinal difference identified | 17.2 | 74–78 |
| 18. Of the Assurance of Grace and Salvation | No substantive doctrinal difference identified | 18.1, 18.3, 18.4 | 79–82 |
| 19. Of the Law of God | No substantive doctrinal difference identified | 19.6 | 83–92 |
| 20. Of Christian Liberty, and Liberty of Conscience | Civil enforcement removed | 20.2; 20.4 | 92–98 |
| 21. Of Religious Worship and the Sabbath-day | No substantive doctrinal difference identified | 21.1, 21.5, 21.7; 21.5 | 99–110 |
| 22. Of Lawful Oaths and Vows | Refusal-of-oath sentence omitted | 22.7 | 111–115 |
| 23. Of the Civil Magistrate | Religious-enforcement task replaced | 23.4 | 116–120 |
| 24. Of Marriage and Divorce | Additional spouse-kindred rule omitted | 24.2, 24.4 | 120–123 |
| 25. Of the Church | Antichrist identification omitted | None beyond presentation noted | 123–128 |
| 26. Of the Communion of Saints | No substantive doctrinal difference identified | 26.3 | 128–130 |
| 27. Of the Sacraments | No substantive doctrinal difference identified | 27.2 | 131–133 |
| 28. Of Baptism | No substantive doctrinal difference identified | 28.7 | 133–137 |
| 29. Of the Lord's Supper | No substantive doctrinal difference identified | 29.2; 29.8 | 138–142 |
| 30. Of Church Censures | No substantive doctrinal difference identified | None beyond presentation noted | 142–144 |
| 31. Of Synods and Councils | Church rulers explicitly convene assemblies; Original second section omitted | None beyond presentation noted | 145–147 |
| 32. Of the State of Men after Death, and of the Resurrection of the Dead | No substantive doctrinal difference identified | 32.1, 32.2 | 147–149 |
| 33. Of the Last Judgment | No substantive doctrinal difference identified | None beyond presentation noted | 149–151 |

## Meaning of the result

A changed adopted standard is not an individual minister’s subscription exception. These notes make no claim that a presbytery has allowed any particular exception, and they do not generalize a local decision into denominational policy. The separate study note on the PCA’s dated 2024 examination procedure remains labeled as procedure. Churches using other editions must check their own texts and rules.

## Rights boundary

These are original comparisons with linked sources. The full modern edition, Scripture-proof apparatus and publisher preface/commentary are not reproduced. [Copyright Office Circular 14](https://www.copyright.gov/circs/circ14.pdf), p. 2, distinguishes new derivative authorship from preexisting public-domain material; a later edition’s copyright does not extend to the underlying public-domain work. That does not establish blanket clearance for the modern edition’s notes, apparatus, formatting or other new protected content. The historical reader’s original source/licensing memo remains applicable to its baseline; the new audit does not replace it with a claim that the entire PCA publication is public domain.

## Implementation and limits

westminster/pca-audit.json is the portable audit record. The new pca-audit-build.cjs validates all 33 chapter statuses, the 172-to-171 section mapping and the unchanged baseline hash during each build. study-build.cjs renders the audit inside the existing closed-by-default Go deeper disclosures; direct links use #pca-N and #pca-N-variants. The confession stays primary and remains readable without JavaScript. The published route stays /wcf/ and the legacy /westminster/ redirect is preserved.

This is a source-checked editorial comparison, not independent peer review, a complete historical-critical edition, or a survey of present subscription practice. The known amendment list was verified against every chapter, not used as a reason to skip the rest. Future changes to the baseline or comparison edition require a new audit and hash update.

### Verification and delivery

The canonical /wcf/ build and asset-reference checks passed. Reader checks cover all 33 PCA audit links and all 67 study notes at 1440, 390 and 320px, plus original reader checks at 1440, 768, 390 and 320px. Tests verify the 6/27 status counts, chapter 31’s five-row map, source links, keyboard behavior, history and no-JavaScript access, and compare every rendered passage with the unchanged baseline. Desktop/mobile audit screenshots were inspected. Syntax, documentation links, data validation, model invariants and build-failure guards passed. The baseline hash is normalized to UTF-8 LF for consistent checkout behavior across operating systems; source PDFs retain binary SHA-256 hashes.

The route migration in PR 8 is a separate dependency: its protected merge was blocked by GitHub reporting an expected required status check despite a successful workflow run. Its rules were not changed or bypassed. This audit is delivered from an isolated topic worktree based on main, containing only Westminster source and documentation changes. Reader tests accept either the existing source route or the canonical /wcf/ artifact, allowing safe integration before or after the route PR without changing the site’s routing configuration.

The isolated topic branch also passed the repository’s full `npm run ci` suite on its current main base: build, syntax/data/assets, model, explorer desktop/mobile, reader/study/PCA audit, and landing/theme/link checks. The route-aware reader tests support both pre-migration and canonical artifacts. No route configuration, shared theme, root package/workflow or historical-text file is included in the audit commit.
