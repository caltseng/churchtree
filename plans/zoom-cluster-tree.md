# Zoom Cluster Tree (v0)

All nodes must belong to exactly one cluster. Cluster membership is determined
by `tradition_family` AND a time window. If a node falls outside the time window
for its tradition, it should be assigned to a fallback cluster (see rules).

## Assignment rules
1. Primary rule: `tradition_family` match + start_year within the cluster time window.
2. If start_year is missing, assign to the tradition cluster and mark for review.
3. If start_year is outside the window, assign to `cluster-out-of-window` until
   the window or node metadata is updated.
4. If tradition_family is missing, assign to `cluster-unknown`.

## Cluster metadata (macro tier)
Each cluster node should carry:
- `cluster_start_year` (number)
- `cluster_end_year` (number or null for present)
- `cluster_time_range_label` (string, e.g., "1054–present")

## Mid-tier clusters (v0)
Mid-tier clusters sit between macro clusters and the leaf nodes. Leaves remain
the existing nodes in the dataset.

### cluster-orthodox
- mid-orthodox-core (1054–present)
  - eastern-orthodox-tradition

### cluster-catholic
- mid-catholic-latin (1054–present)
  - catholic-church

### cluster-anglican
- mid-anglican-reformation (1534–present)
  - english-reformation
  - church-of-england
- mid-anglican-mainline (1785–present)
  - episcopal-church
- mid-anglican-conservative (2009–present)
  - anglican-church-in-north-america

### cluster-lutheran
- mid-lutheran-reformation (1517–1555)
  - lutheran-reformation
  - scandinavian-lutheran-state-churches
  - german-lutheran-territorial-churches
- mid-lutheran-us-mainline (1960–1987)
  - american-lutheran-church
  - lutheran-church-in-america
  - association-of-evangelical-lutheran-churches
  - evangelical-lutheran-church-in-america
- mid-lutheran-us-conservative (1847–1850)
  - lutheran-church-missouri-synod
  - wisconsin-evangelical-lutheran-synod

### cluster-reformed
- mid-reformed-swiss (1520–1560)
  - swiss-reformed-zurich
  - genevan-reformed
  - english-congregation-geneva
- mid-reformed-scottish (1560–1581)
  - scottish-reformation
  - church-of-scotland
  - presbyterian-polity-scotland
- mid-presbyterian-foundations (1683–1706)
  - presbyterian-migrations-america
  - presbyterian-polity-founding-context
- mid-presbyterian-us-mainline (1789–1983)
  - pcusa-1789
  - upcna
  - pcus
  - upcusa
  - pcusa
- mid-presbyterian-us-conservative (1936–present)
  - opc
  - pca

### cluster-baptist
- mid-baptist-origins (1606–1609)
  - english-separatists
  - early-baptist-amsterdam
  - baptist-movement
- mid-baptist-us-mainline (1814–1907)
  - triennial-convention
  - american-baptist-churches-usa
- mid-baptist-us-conservative (1845–present)
  - southern-baptist-convention
- mid-baptist-us-black (1895–1961)
  - national-baptist-convention-usa
  - national-baptist-convention-of-america
  - progressive-national-baptist-convention
- mid-baptist-us-network (1947–present)
  - venture-church-network

### cluster-methodist
- mid-methodist-origins (1738–1784)
  - methodist-movement-england
  - methodist-episcopal-church
- mid-methodist-mainline (1939–1968)
  - methodist-church
  - evangelical-united-brethren-church
  - united-methodist-church
- mid-methodist-conservative (1828–1845)
  - methodist-protestant-church
  - methodist-episcopal-church-south

### cluster-restorationist
- mid-restorationist-origins (1804–1832)
  - restoration-movement
  - christian-church-disciples-of-christ
- mid-restorationist-mainline (1906–1926)
  - churches-of-christ
  - independent-christian-churches

### cluster-holiness
- mid-holiness-mainline (1850–present)
  - holiness-movement
  - church-of-the-nazarene

### cluster-adventist
- mid-adventist-mainline (1831–1863)
  - millerism
  - church-of-god-seventh-day
  - advent-christian-church
  - seventh-day-adventist-church

### cluster-revivalist
- mid-revivalist-mainline (1790–present)
  - second-great-awakening

### cluster-pentecostal
- mid-pentecostal-origins (1886–1906)
  - church-of-god-cleveland
  - church-of-god-in-christ
  - pentecostalism
- mid-pentecostal-mainline (1914–1923)
  - assemblies-of-god
  - foursquare-church

## Cluster tree (macro tier)
Root: Christian Traditions (macro)
|
|-- cluster-orthodox (Eastern Orthodox, 1054-present)
|   |-- metadata: start=1054, end=null
|   |-- eastern-orthodox-tradition (1054)
|
|-- cluster-catholic (Catholic/Latin, 1054-present)
|   |-- metadata: start=1054, end=null
|   |-- catholic-church (1054)
|
|-- cluster-anglican (Anglican, 1534-present)
|   |-- metadata: start=1534, end=null
|   |-- english-reformation (1534)
|   |-- church-of-england (1534)
|   |-- episcopal-church (1785)
|   |-- anglican-church-in-north-america (2009)
|
|-- cluster-lutheran (Lutheran, 1517-present)
|   |-- metadata: start=1517, end=null
|   |-- lutheran-reformation (1517)
|   |-- scandinavian-lutheran-state-churches (1536)
|   |-- german-lutheran-territorial-churches (1555)
|   |-- lutheran-church-missouri-synod (1847)
|   |-- wisconsin-evangelical-lutheran-synod (1850)
|   |-- american-lutheran-church (1960)
|   |-- lutheran-church-in-america (1962)
|   |-- association-of-evangelical-lutheran-churches (1976)
|   |-- evangelical-lutheran-church-in-america (1987)
|
|-- cluster-reformed (Reformed/Presbyterian, 1520-present)
|   |-- metadata: start=1520, end=null
|   |-- swiss-reformed-zurich (1520)
|   |-- genevan-reformed (1536)
|   |-- english-congregation-geneva (1555)
|   |-- scottish-reformation (1560)
|   |-- church-of-scotland (1560)
|   |-- presbyterian-polity-scotland (1581)
|   |-- presbyterian-migrations-america (1683)
|   |-- presbyterian-polity-founding-context (1706)
|   |-- pcusa-1789 (1789)
|   |-- upcna (1858)
|   |-- pcus (1861)
|   |-- opc (1936)
|   |-- upcusa (1958)
|   |-- pca (1973)
|   |-- pcusa (1983)
|
|-- cluster-baptist (Baptist, 1609-present)
|   |-- metadata: start=1609, end=null
|   |-- english-separatists (1606)
|   |-- early-baptist-amsterdam (1609)
|   |-- baptist-movement (1609)
|   |-- triennial-convention (1814)
|   |-- southern-baptist-convention (1845)
|   |-- national-baptist-convention-usa (1895)
|   |-- american-baptist-churches-usa (1907)
|   |-- national-baptist-convention-of-america (1915)
|   |-- venture-church-network (1947)
|   |-- progressive-national-baptist-convention (1961)
|
|-- cluster-methodist (Methodist/Wesleyan, 1730-present)
|   |-- metadata: start=1730, end=null
|   |-- methodist-movement-england (1738)
|   |-- methodist-episcopal-church (1784)
|   |-- methodist-protestant-church (1828)
|   |-- methodist-episcopal-church-south (1845)
|   |-- methodist-church (1939)
|   |-- evangelical-united-brethren-church (1946)
|   |-- united-methodist-church (1968)
|
|-- cluster-restorationist (Restorationist, 1800-present)
|   |-- metadata: start=1800, end=null
|   |-- restoration-movement (1804)
|   |-- christian-church-disciples-of-christ (1832)
|   |-- churches-of-christ (1906)
|   |-- independent-christian-churches (1926)
|
|-- cluster-holiness (Holiness, 1830-present)
|   |-- metadata: start=1830, end=null
|   |-- holiness-movement (1850)
|   |-- church-of-the-nazarene (1908)
|
|-- cluster-adventist (Adventist, 1830-present)
|   |-- metadata: start=1830, end=null
|   |-- millerism (1831)
|   |-- church-of-god-seventh-day (1858)
|   |-- advent-christian-church (1860)
|   |-- seventh-day-adventist-church (1863)
|
|-- cluster-revivalist (Revivalist, 1730-present)
|   |-- metadata: start=1730, end=null
|   |-- second-great-awakening (1790)
|
|-- cluster-pentecostal (Pentecostal, 1901-present)
|   |-- metadata: start=1901, end=null
|   |-- church-of-god-cleveland (1886)
|   |-- church-of-god-in-christ (1897)
|   |-- pentecostalism (1906)
|   |-- assemblies-of-god (1914)
|   |-- foursquare-church (1923)
|
|-- cluster-out-of-window (fallback)
|   |-- metadata: start=null, end=null
|   |-- (empty in v0)
|
`-- cluster-unknown (fallback)
    |-- metadata: start=null, end=null
    |-- (empty in v0)

## Coverage check (v0)
- All current nodes are assigned to a cluster above.
- Nodes slightly preceding a window (e.g., early Baptist precursors at 1606)
  are allowed within the cluster when historically tied to the tradition.
