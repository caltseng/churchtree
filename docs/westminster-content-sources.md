# Westminster content sources and reuse

Verified 14 November 2026. Scope: `westminster/`, a static ChurchTree historical reader.

## Exactly which text

The complete **33 chapters / 172 numbered sections** of the historical **1647 English Confession**, taken from Philip Schaff, *The Creeds of Christendom*, volume III, fourth edition (1919), pp. 600–673. Schaff identifies the underlying English text as the 1647 second edition, printed in London and reprinted in Edinburgh by Evan Tyler. Schaff modernizes spelling and punctuation. This is not a diplomatic transcription of the 1646 manuscript, a modern-English translation, or a declaration of any contemporary denomination’s adopted standard.

Source edition and title/copyright pages:

- [Schaff, Westminster text and editorial identification](https://www.ccel.org/ccel/schaff/creeds3/creeds3.iv.xvii.ii.html)
- [Volume title and copyright page](https://ccel.org/ccel/schaff/creeds3/creeds3.i.html): fourth edition; copyrights 1877 (Harper & Brothers), 1905 and 1919 (David S. Schaff); printed in the United States; Baker reprint issued in 1977.
- [Source XML](https://www.ccel.org/ccel/s/schaff/creeds3.xml). The downloaded input’s SHA-256 is retained in `content.json`.
- [Westminster Assembly Project, original documents](https://westminsterassembly.org/principal-documents-of-the-assembly-facsimile-editions/): manuscript presentation in 1646 and subsequent printing/proof-text history.

## Rights rationale and boundaries

The seventeenth-century English work is public domain. The particular Schaff text used here was published in the United States by 1919, also placing it in the U.S. public domain. The [U.S. Copyright Office, Circular 22](https://www.copyright.gov/circs/circ22.pdf) states that copyright in works published or copyrighted before 1 January 1931 has expired. The date of a later reprint does not make the unchanged historical text a new modern edition. This memo makes a U.S. public-domain determination; it does not assert that all contemporary Westminster editions are unrestricted worldwide.

[CCEL’s policy](https://www.ccel.org/about/copyright.html) distinguishes public-domain books from its copyrighted website and special contents and asks users to contact it to republish CCEL works. ChurchTree reproduces only the underlying public-domain English confession, not CCEL’s website, markup, introductions, summary, cover art, or other original special content. The layout, navigation and source note here are newly written. No modern publisher license is assumed or claimed.

Modern translations, denominational revisions, critical apparatus, editorial notes, and modern proof-text selections can have separate rights even where the confession itself is public domain. We do not reproduce the OPC’s revised text or the 1937/1946 Carruthers critical edition. Schaff’s American comparison material and all Scripture proofs/editorial notes are omitted, rather than silently merged into the historical text. The original language in 20.4, 22.3, 23.3, 24.4, 25.6, and 31.2 is retained, including passages that differ from later American standards.

No permission or mandatory attribution license is needed for the public-domain text. For provenance, the on-page note credits Schaff, identifies the edition and omissions, and links to the source and copyright guidance. Retain that note when updating or redistributing this reader. This attribution is an editorial provenance requirement, not a claim of ownership over the confession.

## Preparation and checks

English table cells were extracted from the named Westminster section of the XML, excluding Latin columns, notes and comparative American material. Page-break continuations were joined; Roman section numbers became stable decimal labels. The two-column biblical book list in 1.2 was transcribed in canonical order and arranged as continuous prose; no biblical books are omitted. Display capitalization/punctuation of the list is normalized. The unnumbered first section in chapter 5 and sole section in chapter 12 are labeled 5.1 and 12.1. Chapter 31 uses the original five-section numbering, without Schaff’s bracketed American renumbering.

`content.json` is the reviewable content source. `node westminster/build.cjs` deterministically writes the complete `index.html`; it does not fetch or depend on a service. The HTML contains the entire text and remains usable without JavaScript. There are no remote fonts, images or runtime dependencies. Shared root `theme.css` and `theme.js` supply semantic colors and the saved theme preference; reader CSS has semantic fallbacks.

`node westminster/test-reader.cjs` checks the chapter-by-chapter section counts, all 172 rendered sections, deep-link reload, previous/next navigation, history, focus, overflow, no-JavaScript text, and desktop/mobile viewports (1440, 768, 390, 320 px). It uses the existing `scripts/test-server.cjs`, Playwright and the Edge channel; CI may set `PLAYWRIGHT_MODULE` to the installed package, and set `PLAYWRIGHT_CHANNEL=chromium` for its installed Playwright Chromium (local default: `msedge`). No package or deployment configuration was changed by this task. Copy the entire `westminster/` directory plus the shared theme assets to the published static site; no build is required for serving the checked-in HTML.

## Optional study layer (added 14 November 2026)

The chapter study notes are separate original editorial material. They paraphrase named primary documents and historical scholarship; they do not reproduce a modern study guide. `westminster/study-sources.json` identifies exact editions, dates, scopes and reuse treatment. `westminster/study-notes.json` supplies note-level citations and review metadata. The public-domain determination above applies to the historical confession, not automatically to modern translations, church-order publications or commentary used as references. See [the study plan and review record](westminster-study-plan.md) for the model, chapter coverage and research limits.

## PCA comparison audit (14 November 2026)

The audit now compares all 33 chapters directly with the official PCA 2022 publication while preserving the historical transcript unchanged. [The audit memo](westminster-pca-audit.md) records scope, method, results, minor variants and apparent transcript/printing problems. `westminster/pca-audit.json` contains the original editorial summaries, exact edition/hash provenance and complete section maps. The official PCA publication’s entire text, proof apparatus and publisher commentary are not reproduced. Copyright Office Circular 14 distinguishes new edition authorship from underlying public-domain material; this is not blanket clearance for modern protected additions.
