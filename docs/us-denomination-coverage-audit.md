# Coverage of the 50 largest U.S. Christian bodies

Audit date: November 22, 2026.

**28 of 50 have no standalone node.** Main Branch represents 22 bodies directly (44%), provides historical or tradition-level context for 21, and has no relevant node for seven. The five largest gaps are the Church of Jesus Christ of Latter-day Saints (6,721,031), Jehovah's Witnesses (3,016,924), National Missionary Baptist Convention of America (2,428,820), African Methodist Episcopal Church (1,059,888), and United Church of Christ (924,744). The three historically Black Methodist bodies (AME, AME Zion, and CME) all lack their own nodes.

## Sources and method

1. Download the June 23, 2023 revision of ASARB's [2020 group-detail workbook](https://www.usreligioncensus.org/sites/default/files/2023-06/2020_USRC_Group_Detail.xlsx), SHA-256 `06d42b268029e828a68b033282573a160ffe5f512a6d1c991288b919324329d1`. Open **2020 Group by Nation**. Use **Group Code**, **Group Name** and **Adherents** (columns A, B and D). Keep the codes as text. The [Census FAQ](https://www.usreligioncensus.org/faq) and [ARDA source notes](https://thearda.com/us-religion/sources-for-religious-congregations-membership-data) identify 2020 as the latest available edition of this nationwide series for this audit. The [ARDA national report](https://www.thearda.com/us-religion/census/congregational-membership?t=4&y=2020) provides a second display of the same data, sometimes under a different name.
2. Drop blank/nonpositive adherent counts. Exclude codes `500, 267, 276, 895, 271, 890, 896, 270, 031, 891, 435, 892, 056` from the ranked candidate range (all the excluded rows above rank 50's cutoff). This removes non-Christian traditions, the Unitarian Universalist Association (a pluralist association placed under Other Christians in ARDA), and composite estimates for unrelated nondenominational congregations (21,095,641) and undifferentiated Amish groups (320,625). Keep individually identified denominations, jurisdictions, conventions, and named networks or coherent church fellowships, including the decentralized Stone–Campbell bodies. Include Latter-day Saints and Jehovah's Witnesses as separately identified restorationist bodies in this baseline. Sort by numeric adherents descending, then group code for ties, and take 50. There are no ties at the cutoff.
3. Build the site from `origin/main` at [`c7c47ef9763ed37cf1e93eb0050eff04e7e051f4`](https://github.com/caltseng/churchtree/commit/c7c47ef9763ed37cf1e93eb0050eff04e7e051f4) using `npm run build`. Inspect `dist/data/data.js` or its source records [under `data/sets`](https://github.com/caltseng/churchtree/tree/c7c47ef9763ed37cf1e93eb0050eff04e7e051f4/data/sets). The built inventory contains 63 nodes and its SHA-256 (`ca21afc425220b7c522e90ba3849aa0f56702ee2dc7c7d2fe3ff310242846d13`) matched the [live data payload](https://main-branch.com/data/data.js) on the audit date. To list all node IDs, names and statuses from the sources in PowerShell, run:

   ```powershell
   Get-ChildItem data/sets/*/nodes.json | ForEach-Object {
       Get-Content $_ -Raw | ConvertFrom-Json | Select-Object id, name, current_status
   }
   ```

4. **Standalone** means the published explorer has a current node for the same body, including a verified alias or a worldwide node for the same communion (e.g. Roman Catholic Church). A predecessor, successor formed in a merger, or umbrella over multiple census bodies only qualifies as **Context only** unless the node explicitly represents the same continuing body. Historical and tradition nodes give context when they represent an identifiable branch, relevant predecessor or established tradition of the body. **Absent** means the inventory lacks even that representation. All Context only and Absent rows count toward the 28 standalone gaps. Mentions in prose, citations, future plans, and generic name overlap do not count as nodes.

Adherents generally include formal members, participating nonmembers and children. Definitions and estimation methods vary by body, so these are neither standardized membership totals nor a survey of self-identification. The census reports adherent totals for only 218 of 372 participating bodies. Three bodies with sizable congregation counts have blank adherent counts in the national workbook: United Pentecostal Church International (code 454, 4,549 congregations), Church of God of Prophecy (145, 1,614), and Evangelical Free Church of America (203, 1,602). The explorer has no standalone node for any of the three. Their absence from the ranked table reflects missing adherent totals. The UMC figure predates the wave of disaffiliations that peaked in 2023 and the formation of the Global Methodist Church in 2022. It cannot be read as a current UMC count or used to estimate either body's current ranking. [2020 Census report and methods](https://usreligioncensus.org/sites/default/files/2023-10/2020_US_Religion_Census.pdf), [UM News disaffiliation reporting](https://www.umnews.org/news/heartbreak-hope-follow-season-of-church-exits).

## Ranked crosswalk

| Rank | Census code | Body | U.S. adherents (2020) | Coverage | Published node ID or inventory evidence |
| ---: | --- | --- | ---: | --- | --- |
| 1 | 081 | Catholic Church | 61,858,137 | Standalone | `catholic-church` |
| 2 | 419 | Southern Baptist Convention | 17,649,040 | Standalone | `southern-baptist-convention` |
| 3 | 449 | United Methodist Church | 8,018,629 | Standalone | `united-methodist-church` |
| 4 | 151 | Church of Jesus Christ of Latter-day Saints | 6,721,031 | Absent | No Latter-day Saint node or parent movement |
| 5 | 207 | Evangelical Lutheran Church in America | 3,139,413 | Standalone | `evangelical-lutheran-church-in-america` |
| 6 | 053 | Assemblies of God | 3,094,547 | Standalone | `assemblies-of-god` |
| 7 | 272 | Jehovah's Witnesses | 3,016,924 | Absent | No Bible Student movement or Witness node. The Adventist nodes do not represent this body |
| 8 | 302 | National Missionary Baptist Convention of America | 2,428,820 | Context only | `national-baptist-convention-of-america`. 1988 split from NBCA. Census code 302 is distinct from codes 300, 301 and 364 |
| 9 | 283 | Lutheran Church--Missouri Synod | 1,802,680 | Standalone | `lutheran-church-missouri-synod` |
| 10 | 193 | Episcopal Church | 1,576,611 | Standalone | `episcopal-church` |
| 11 | 300 | National Baptist Convention, USA, Inc. | 1,567,741 | Standalone | `national-baptist-convention-usa` |
| 12 | 355 | Presbyterian Church (U.S.A.) | 1,491,775 | Standalone | `pcusa` |
| 13 | 167 | Churches of Christ | 1,422,331 | Standalone | `churches-of-christ` |
| 14 | 097 | Christian Churches and Churches of Christ | 1,379,041 | Standalone | `independent-christian-churches` |
| 15 | 413 | Seventh-day Adventist Church | 1,339,830 | Standalone | `seventh-day-adventist-church` |
| 16 | 019 | American Baptist Churches in the USA | 1,259,804 | Standalone | `american-baptist-churches-usa` |
| 17 | 003 | African Methodist Episcopal Church | 1,059,888 | Context only | `methodist-episcopal-church` |
| 18 | 443 | United Church of Christ | 924,744 | Context only | `english-separatists` |
| 19 | 141 | Church of God in Christ | 920,429 | Standalone | `church-of-god-in-christ` |
| 20 | 165 | Church of the Nazarene | 905,690 | Standalone | `church-of-the-nazarene` |
| 21 | 127 | Church of God (Cleveland, Tennessee) | 868,446 | Standalone | `church-of-god-cleveland` |
| 22 | 123 | Church of God (Anderson, Indiana) | 427,038 | Context only | `holiness-movement`. Holiness context. The Cleveland and Seventh Day Church of God nodes represent separate bodies |
| 23 | 089 | Christian and Missionary Alliance | 414,360 | Context only | `holiness-movement` |
| 24 | 469 | Wisconsin Evangelical Lutheran Synod | 408,259 | Standalone | `wisconsin-evangelical-lutheran-synod` |
| 25 | 093 | Christian Church (Disciples of Christ) | 398,072 | Standalone | `christian-church-disciples-of-christ` |
| 26 | 246 | Greek Orthodox Archdiocese of America | 375,117 | Context only | `eastern-orthodox-tradition` |
| 27 | 356 | Presbyterian Church in America | 372,696 | Standalone | `pca` |
| 28 | 263 | International Church of the Foursquare Gospel | 363,626 | Standalone | `foursquare-church` |
| 29 | 467 | Wesleyan Church | 306,005 | Context only | `holiness-movement` |
| 30 | 005 | African Methodist Episcopal Zion Church | 304,704 | Context only | `methodist-episcopal-church` |
| 31 | 101 | Christian Methodist Episcopal Church | 269,126 | Context only | `methodist-episcopal-church-south` |
| 32 | 364 | Progressive National Baptist Convention, Inc. | 254,571 | Standalone | `progressive-national-baptist-convention` |
| 33 | FFR | Full Gospel Christian Assemblies International | 240,878 | Context only | `pentecostalism` |
| 34 | 371 | Reformed Church in America | 235,195 | Context only | `genevan-reformed` |
| 35 | 301 | National Baptist Convention of America International, Inc. | 225,776 | Standalone | `national-baptist-convention-of-america` |
| 36 | 255 | Lutheran Congregations in Mission for Christ | 194,144 | Context only | `evangelical-lutheran-church-in-america` |
| 37 | 186 | Coptic Orthodox Church | 179,155 | Absent | No Oriental Orthodox tradition node |
| 38 | 223 | National Association of Free Will Baptists | 156,895 | Context only | `baptist-movement` |
| 39 | 463 | Vineyard USA | 155,836 | Context only | `pentecostalism` |
| 40 | 201 | Evangelical Covenant Church | 154,267 | Absent | No Swedish Pietist or Covenant branch |
| 41 | 105 | Christian Reformed Church in North America | 149,096 | Context only | `genevan-reformed` |
| 42 | 017 | American Baptist Association | 146,820 | Context only | `baptist-movement` |
| 43 | 403 | Salvation Army | 141,098 | Context only | `holiness-movement` |
| 44 | 232 | Full Gospel Baptist Church Fellowship | 138,354 | Context only | `baptist-movement` |
| 45 | 157 | Church of the Brethren | 109,288 | Absent | No Schwarzenau Brethren branch |
| 46 | 204 | Ethiopian Orthodox | 96,374 | Absent | No Oriental Orthodox tradition node |
| 47 | 050 | Armenian Apostolic Church (Catholicosate of Etchmiadzin) | 95,207 | Absent | No Oriental Orthodox tradition node. The Cilicia jurisdiction is a separate census row |
| 48 | 155 | Church of Our Lord Jesus Christ of the Apostolic Faith, Inc. | 85,938 | Context only | `pentecostalism` |
| 49 | 331 | Orthodox Church in America | 74,449 | Context only | `eastern-orthodox-tradition` |
| 50 | 221 | Free Methodist Church--USA | 71,634 | Context only | `methodist-episcopal-church` |

## Identity checks and scope sensitivity

- Census code `302` is the National Missionary Baptist Convention of America, formed in the 1988 split from the National Baptist Convention of America (`301`). Code `300` identifies National Baptist Convention, USA, Inc., and `364` identifies the Progressive National Baptist Convention. The explorer has standalone nodes for the latter three. NMBCA currently advertises 400,000+ members. The 2,428,820 figure in the table is the census estimate of U.S. adherents for 2020. The measures and reference periods differ, so the comparison cannot establish a change in size. [NMBCA](https://www.nmbca.org/), [Southern Baptist Historical Library and Archives](https://sbhla.org/digital-resources/national-baptist-america-annuals/).
- Codes `167`, `097` and `093` map to three standalone Stone–Campbell branches. The independent Christian Churches and Churches of Christ node covers `097`. International Churches of Christ (`264`, 53,612 adherents) is a distinct census row below the cutoff. United Church of Christ (`443`) has historical context through the Congregational line of the English Separatists. Its 1957 merger created a different body from any of the ranked Stone–Campbell bodies. [ARDA national report](https://www.thearda.com/us-religion/census/congregational-membership?t=4&y=2020), [UCC history](https://www.ucc.org/who-we-are/about/history/).
- The Eastern Orthodox tradition node provides context for the Greek Orthodox Archdiocese and Orthodox Church in America. The Coptic, Ethiopian, and Armenian jurisdictions in the table belong to Oriental Orthodoxy. [Census Appendix F](https://www.usreligioncensus.org/sites/default/files/2023-03/Appendix_F--Orthodox_Christian_Groups.pdf).
- If the scope excludes Latter-day Saints and Jehovah's Witnesses, the next two bodies enter at ranks 49–50. The Antiochian Orthodox Christian Archdiocese of North America (`034`, 71,216 adherents) has context via `eastern-orthodox-tradition`. Mennonite Church USA (`288`, 71,058) is absent. The result is **22 standalone, 22 context only, and six absent**, still 28 standalone gaps. National Missionary Baptist Convention of America becomes the largest gap under that scope.
- If the scope follows ARDA's Other Christians label for the Unitarian Universalist Association (code 435, 201,541 adherents), it enters at rank 36 as Absent and Free Methodist Church–USA drops out. That scope yields **22 standalone, 20 context only, and eight absent**.
