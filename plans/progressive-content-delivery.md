# Progressive content delivery for Main Branch

This is a proposal. Start by deferring explorer profiles and relationship
narratives on GitHub Pages. Use the same release format for a read-only service
if measurements justify one. Keep Westminster's primary text in HTML.

## Current delivery and baseline

[The release build](../scripts/build-site.cjs) generates the landing and reader
HTML, merges canonical set JSON and shared citations/sources into
dist/data/data.js, and copies allowed website directories and file types.
The tracked data/data.js is for source preview. [The site workflow](../.github/workflows/site.yml)
builds and tests dist on PRs, and deploys the tested artifact from main through
GitHub Pages. There is no application server or database.

[The explorer](../explorer.js) loads the full CHURCHTREE_DATA bundle and D3
before initializing. Search, grouped overview, branch filtering, compact
lineage and both proportional orientations run locally. Node and edge
selections are in memory. The details renderer joins claims, citations and
sources from the same bundle. Its static HTML has navigation and introductory
copy. The interactive atlas and selected records require JS.

The landing page is at / and the explorer at /church-history/. The generated
/wcf/ HTML includes all 33 chapters and 172 sections, chapter and section
fragments, edition and source links, study and PCA audit content, and a public
chapter JSON download. JavaScript enhances navigation and disclosures.
The /westminster/ compatibility document forwards the query and fragment
with JS. Its no-JS refresh and link reach the reader root.

The [public artifact boundary](../docs/public-site-boundary.md) excludes
research notes, docs, scripts and Git metadata. The verifier rejects project
GitHub/Pages references and sourcemaps. The reader directory's allowed
extensions also ship study and audit JSON today.

On November 21, 2026, a clean Windows worktree at
`3a9033d18201d735ed0ef199b601c1a291a1a898` built in 1.61 s wall time using
`node scripts/build-site.cjs` on Node 20.11.0, excluding dependency installation.
PowerShell counted 73 files and 3,078,531 bytes in dist. Node's default
`zlib.gzipSync` produced the compressed estimates below. Hosted CI uses Node 24.

| File | Disk bytes | Local gzip bytes |
| --- | ---: | ---: |
| Landing HTML | 5,226 | — |
| Explorer HTML | 6,380 | — |
| Explorer data with 63 nodes and associated records | 975,793 | 125,052 |
| Westminster HTML | 356,818 | 65,120 |

Public HTTPS probes returned 200 for /church-history/, /wcf/ and /westminster/
on main-branch.com. File sizes above are from the local build. Capture a
production waterfall before drawing conclusions about transfer sizes or speed.

## Options and content split

| Option | Benefit | Tradeoff |
| --- | --- | --- |
| Versioned static JSON fetched on selection | Same-origin, one deploy workflow, smaller startup | Data still counts toward Pages size and transfer. Responses are precomputed |
| Read-only API over release objects | Independent content storage, explicit HTTP and monitoring controls | Second deploy and possible second origin. Current lookups can return identical static bytes |
| Request-time HTML | Readable, indexable responses for routes that cannot be prebuilt within budget | Runtime cost and failure on page navigation. Generated HTML provides the same reading properties for finite records |

Keep the landing inventory, shared branding, navigation, titles, descriptions,
canonical/share URLs and readable introductions in HTML. Generate a compact
initial explorer projection containing stable IDs, names/search aliases,
scope, tradition, grouping, date uncertainty, edge endpoints/type/year,
event markers and the fields required by all layouts, labels, successor lists
and short summaries. Inventory actual field reads before fixing the allowlist.
Graph navigation, search and switching layouts require zero detail requests.
Provide a prebuilt keyboard-readable index with summaries and ordinary links.

Defer richer node profiles and edge narratives on selection. This keeps detail
bytes and parsing out of the startup path for visitors who only browse.
Include the exact public citation/source closure in each response, including
nested milestones, people and documents. Preserve claim links, suggested
readings, source locators and uncertainty. Render the identity, short summary
and graph-derived relations immediately. Prebuild shareable, readable profile
HTML from the same records with an apex canonical and source links. Edges
already have canonical record IDs. If shareable edge pages are needed,
decide their public URL and alias/redirect policy before publishing links.
Preserve profile and edge links when titles change.

Keep Westminster's full text, TOC, edition/provenance, download and existing
chapter, section, study, note and audit anchors during the pilot. For new
longform and larger supplements, link to prebuilt reading pages and optionally
fetch the same material for inline expansion. Any later split must preserve
fragment landing points with links tested with JS on and off. HTTP routing
cannot see URL fragments. Give a future timeline its own dataset ID, landing
entry, compact projection and renderer. It can use the same detail contract
without fetching other timelines. Decide its public path with its product scope.

## Contract and release

Generate a bootstrap record with the shell's explicit release and schema.
Use a deterministic release ID derived from the public output inputs and
build/schema version. A release manifest lists datasets, record kinds,
inventory and digests. Both adapters use these resource shapes.

| Resource | Proposed path |
| --- | --- |
| Manifest | /content/v1/{release}/manifest.json |
| Detail | /content/v1/{release}/{dataset}/{kind}/{id}.json |
| Readable profile | /church-history/profiles/{id}/ |

The API supports GET and HEAD for validated manifest members. Return a JSON
envelope with schema, release, dataset, kind, ID, record and evidence. Use
404 for missing public resources and 503 for an incomplete release or temporary
store failure. The client validates the response version and identity. Avoid
a latest-record fallback that would mix evidence or graph versions.

Generate the shell, projections, detail files and readable HTML from the
same canonical snapshot. Run existing checks and extend them for explicit
field allowlists, cross-set IDs and relationships, nested citation closure,
safe URLs, escaping, licensed content and unpublished-record exclusions.
Audit both publish targets. An anonymous API is public, even if the bucket
and source repository are private. Keep research notes and credentials out
of both targets. Repository visibility governs access to source, and copies
created while public may persist. See [Pages publishing sources](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

On Pages, package the shell and its resources together. Retain current and
last-known-good detail paths for old tabs, with a window based on observed
shell caching. Test an old cached shell against the next artifact. For split
hosting, serialize release promotion, upload immutable objects first, verify
digests and probe them through the delivery origin, then activate the matching
shell. Failed promotion leaves the current release active. Never overwrite a
release path with new bytes. Retain previous snapshots for rollback and
remove expired files only outside the compatibility window.

For an origin we control, use content-derived ETags with conditional 304
responses, long public immutable caching for release resources, short caching
or revalidation for HTML and any release pointer, and short or disabled
negative caching. Measure actual Pages headers. For an expired release, offer
refresh. For withdrawals, disable affected reads and purge controlled caches
where possible. Previously downloaded copies can persist.

## Hosting and operations

Keep the Pages apex and existing publishing workflow for the static pilot.
GitHub documents a 1 GB published site cap, a 100 GB/month soft bandwidth
limit and a ten-minute deployment timeout. The soft ten-builds-per-hour
limit excludes custom Actions publishing. Confirm the domain in Pages settings
and DNS. A generated CNAME file has no effect on Actions publishing settings.
[Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
· [Custom domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

If production rollout is justified, pilot one Cloudflare Worker reading immutable release files from
an R2 bucket with public access disabled. Use a separate publisher identity
in a protected release job. Expose only keyed reads. The Worker binding
supports object access, and R2 has strong read-after-write consistency.
Verify the HTTP origin separately because caches have their own lifetime.
[Workers R2 binding](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/)
· [R2 consistency](https://developers.cloudflare.com/r2/reference/consistency/).

Pilot on a separate HTTPS origin while Pages keeps the apex. Begin with a
provider test hostname. A Worker custom domain requires an active Cloudflare
zone and routes the full hostname. Verify DNS and TLS before choosing a
hostname. Allow production and explicit preview origins via CORS, omit
credentials, and configure the connection policy and cache variation. Keep
public canonicals on the apex. Consider apex cutover only for justified
same-origin runtime paths or request-time HTML. Rehearse static and runtime
routing, TLS, apex/www redirects and legacy links on staging. Record current
DNS and Pages configuration, preserve unrelated records and rehearse restore
and certificate provisioning. [Worker Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
· [Worker asset routing](https://developers.cloudflare.com/workers/static-assets/routing/worker-script/).

Use one loader for both adapters. Start with a two-second timeout, cancel
superseded reads, ignore late results and deduplicate concurrent reads. Keep
the graph and summary visible. Announce loading and retry through a polite
status region. Retain focus and preserve focus return from the mobile sheet.
Try the same-release static copy on transient API failure during the pilot.
Offer a readable HTML link and retry. Link separately to any older snapshot
with its version identified. Roll back by switching to the static adapter or
reverting a bad Pages release through a protected PR with the matching data
snapshot. Exercise restoration before removing duplicate fallback files.

Serve dist locally with the existing site server. Run the same API handler
against local fixtures and use a separate preview origin and bucket for TLS,
CORS, ETag and publication smoke checks. Pin preview to its release, exclude
it from indexing, restrict unpublished material and disable production
fallbacks. Track aggregate route kind, release, status, latency, cache outcome
and fallback rate without raw search terms or visitor identifiers. Probe
initial routes, a record with evidence and a missing record. Alert on missing
manifest members or sustained detail failures.

## Work items and acceptance gates

| Work item | Acceptance criteria |
| --- | --- |
| 1. Inventory and baseline | Record actual renderer/search field reads, routes and anchors. Capture initial compressed bytes, time to usable graph/search and profile latency under a repeatable cold-cache throttled mobile profile |
| 2. Build projections and fallbacks | Data and artifact checks pass. Public projections exclude unpublished fields. Graph/search work with detail requests blocked. No-JS index and profiles show content and evidence. Reader anchors, legacy compatibility and JSON download pass |
| 3. Enable static lazy details | Desktop/mobile checks cover rapid reselection, slow/missing reads, keyboard/focus, prior shell and retries. Aim for at least 30% fewer compressed initial explorer data bytes and no graph/search latency regression in paired trials. Record the profile latency tradeoff |
| 4. Prove the API locally or in isolated preview | Complete the time-boxed handler and fixture checks above. Record parity, failure handling and remaining work |
| 5. Pilot production server reads after a trigger below | Static and API payloads match. Test interrupted promotion, cache skew, API outage and rollback. Initial routes and reading links work. Before expanding, target p95 selected-to-detail below one second under the defined mobile profile and under 1% detail timeout/error responses in a representative pilot |
| 6. Reassess HTML hosting | Quantify a route's missed freshness or publish budget after testing prebuilding/sharding. Verify canonicals, redirects, no-script reading and rollback on staging |

Revisit hosting if measured growth projects site size or bandwidth above 70%
of the documented limit within six months, or if repeated static releases
miss an agreed freshness target. Confirm the constraint over two release
windows or a representative load test and quantify the benefit of offloading.
These are proposed triggers. Use a database only for an observed write or
query requirement that precomputed projections and keyed reads cannot meet.

Open decisions include the searchable fields, final profile path and alias
policy, stale-shell retention, mobile measurement profile and ownership of
runtime support. Confirm DNS control and provider eligibility before hostname
work. Address graph payload creep with byte budgets, release skew with
immutable versions and fallback tests, route breakage with no-script anchor
checks, and publication mistakes with explicit projections at both targets.
