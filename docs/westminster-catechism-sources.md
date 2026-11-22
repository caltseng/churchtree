# Westminster catechism editions

Both Main Branch readers use the Westminster Assembly’s historical English questions and answers as printed in *The Confession of Faith; the Larger and Shorter Catechisms, with the Scripture-Proofs at Large* (London: T. Nelson and Sons, 1860). The Internet Archive scan comes from the University of Toronto’s Robarts Library. [Catalogue and scan](https://archive.org/details/confessionoffait00westuoft) · [Westminster Assembly Project’s early printings](https://westminsterassembly.org/principal-documents-of-the-assembly-facsimile-editions/)

| Reader | Questions | Printed pages |
| --- | ---: | --- |
| Westminster Shorter Catechism | 107 | [285–314](https://archive.org/details/confessionoffait00westuoft/page/285/mode/2up) |
| Westminster Larger Catechism | 196 | [127–281](https://archive.org/details/confessionoffait00westuoft/page/127/mode/2up) |

The 1860 printing is in the U.S. public domain because of its publication date. Ian Buchanan dedicates the digital transcription and its data to the public domain under CC0 1.0. Main Branch extracted the paired question and answer strings from the corpus’s numbered Markdown blocks at commit `01ed626ffaabccbe14f3df3ff25c3e7b1b7935d6`. The corpus identifies this printing and records its page-image checks. [U.S. Copyright Office Circular 22](https://www.copyright.gov/circs/circ22.pdf) · [Corpus reuse terms](https://github.com/iandbuchanan/confessions-corpus/blob/01ed626ffaabccbe14f3df3ff25c3e7b1b7935d6/LICENSE-TEXTS.md) · [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/)

## Preparation and checks

The digital text retains the historical wording and uses the corpus’s continuous-prose layout. The reader supplies the titles, navigation, Q. and A. labels and source notes. The print edition’s Scripture proof notes and reference marks, acts of approval and typographic emphasis are outside the scope of the reader. No modern denominational revision or commentary was imported. [Shorter transcription and review](https://github.com/iandbuchanan/confessions-corpus/tree/01ed626ffaabccbe14f3df3ff25c3e7b1b7935d6/confessions/westminster-shorter-catechism) · [Larger transcription and review](https://github.com/iandbuchanan/confessions-corpus/tree/01ed626ffaabccbe14f3df3ff25c3e7b1b7935d6/confessions/westminster-larger-catechism)

Main Branch verified all 303 question numbers and spot-checked the first and last entries of both texts, Shorter Q. 4 and the opening of Larger Q. 99 against the scan. The import restores the printed closing parenthesis after “evil” in Shorter Q. 106. [Shorter pp. 313–314](https://archive.org/details/confessionoffait00westuoft/page/313/mode/2up) · [Larger p. 179](https://archive.org/details/confessionoffait00westuoft/page/179/mode/2up) · [Larger pp. 280–281](https://archive.org/details/confessionoffait00westuoft/page/280/mode/2up)

The checked-in [Shorter data](../wsc/questions.json) and [Larger data](../wlc/questions.json) are inputs to [the static generator](../scripts/build-catechisms.cjs). Run `npm run build` to regenerate both pages. The browser suite compares every published question and answer with these files and checks navigation and fragment links with JavaScript disabled.
