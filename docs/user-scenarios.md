# User scenarios and verification

This is the acceptance guide for Main Branch. It describes observable behavior,
not just whether a function returns a value. Use the generated site, not a mixture
of source files and an old data bundle.

## Prepare a reproducible run

1. Read `README.md` and `AGENTS.md`; work on a topic branch.
2. Run `npm ci`, then `npx playwright install chromium` (CI additionally installs OS dependencies).
3. Set `PLAYWRIGHT_CHANNEL=chromium` and `CHURCHTREE_TEST_ROOT=dist` in your shell.
4. Run `npm run ci`. It rebuilds home, the Westminster reader and the release artifact.
5. Run `npm run serve` and open `http://127.0.0.1:4173/` for manual review.
6. Test a fresh/default preference with Site menu → Settings → Appearance → Reset to Parchment. Also test
   a saved theme; do not assume a private/incognito browser has saved state.

The desktop baseline is 1440×1000, with additional widths 1280 and 1100px. Mobile
emulation covers 320×568, 390×844, 768×1024, 1024×768 and 844×390. Below 1100px the
profile uses a reading sheet; at 1100px and above it uses the desktop split. Also
check a real touch device/Safari before claiming cross-browser certification.

## Scenarios

| ID | Steps | Expected result | Automated coverage |
| --- | --- | --- | --- |
| HOME-01 | Open `/`; activate Church History tile; return using Main Branch brand link; activate Westminster tile. | Home is an inventory, not the explorer. Links reach `/church-history/` and `/wcf/`, with no missing assets or console errors. | `scripts/test-features.cjs` |
| HOME-02 | At 320px, scroll the home page and tab through controls. | Tiles stack; no page-wide horizontal overflow; full tile is a meaningful link; Settings and Appearance are reachable by keyboard, and Escape returns focus to the site menu button. | Feature suite plus manual keyboard review |
| CHINA-01 | Follow Church in China from home; filter Protestant episodes to 1900-1940; select a cluster by keyboard in both orientations; open a member's sources and return. Repeat at 320px portrait and 844px short landscape. | Separate dataset; display lanes never claim lineage. Every cluster member is reachable. Filters, visible dates and zoom survive details; source locators and critical caveats are accessible. | `china-history/test-browser.cjs`; shared explorer/mobile suites |
| CHINA-02 | Open `/china-history/#alopen-arrival-report`, the True Jesus seminary record, Orthodox autonomy and either unplaced gap. Search a title; use Text view and an invalid date-range link. Disable JS or block D3. | 635 is distinguished from 781 testimony; 1924/1947/2020 remain distinct; 1956/1957 stay provisional; gaps acquire no invented endpoints. Invalid bounds show an error. All 45 records and citations remain accessible without dragging, color or JavaScript. | China model/build/browser suite |
| GRAPH-01 | In Church History, select Presbyterian from All branches. | Opens detailed timeline, skipping historical-group level. The date range and nodes reflect the Presbyterian records. | `scripts/test-explorer.cjs` |
| GRAPH-04 | With All branches and Compact lineage selected, pinch out/in repeatedly, drag with one finger, add/remove a finger, cancel, then tap a branch. On desktop use Ctrl+wheel and drag the background; focus the graph and use +/−/0 or arrow keys. | Graph geometry scales around the finger midpoint between 0.5× and 4×; page scale remains fixed. Drag pans; taps drill in. Browser pinch remains available outside the graph. | `scripts/test-overview-touch.cjs` uses real CDP touch input, actual node dimensions, anchored coordinates, limits, transitions/cancel, pan and outside-page zoom; explorer suite checks desktop wheel/drag |
| GRAPH-02 | Select Compact lineage and inspect PCUSA (1789), PCUS, OPC, PCA and the PC(USA) merger. | Splits diverge into different lanes; mergers converge. Chronological compact spacing does not claim proportional elapsed time. Nodes do not overlap. | Explorer suite and `scripts/test-timeline-model.cjs`; manually trace the actual arrows |
| GRAPH-03 | Zoom out to historical groups, then in. | Group titles convey shared history; individual records return. A group is not represented as a new denomination. | Explorer/model suites |
| TIME-01 | In Vertical, wheel inward/outward, then drag/pan. | Visible year span narrows/widens, nearby records separate/collapse, dates stay proportional. Same-date entries may remain grouped and can be opened individually. | Explorer suite checks visible domain and clustering, not only transform scale |
| TIME-02 | Toggle Horizontal; zoom in; side-scroll with trackpad, scrollbar or Shift+wheel; zoom out/reset. | Time runs left to right. Zoom anchors the date rather than jumping to the beginning; named groups collapse without count-only labels. Tradition labels and dates remain available during scrolling. | Explorer suite |
| TIME-03 | Toggle orientation while zoomed; edit date range; enter an invalid range, then correct it. | Toggle preserves the visible period; inputs reflect it while not being edited. Invalid/empty range produces an inline error; a valid range applies and clears the error. | Explorer suite; manually compare the period across orientations |
| SEARCH-01 | On mobile, open the magnifying-glass Search button. Search `PCA`, open the result, then reopen search and search `OPC`. | Search works outside the current branch; selected body's date is brought into view and its profile opens. No obsolete profile remains from an unrelated branch. | Explorer/mobile suites |
| PROFILE-01 | Open PCA, PCUS, a historical movement, and an origin node. | Heading shows a supported lifespan (PCA 1973–present; PCUS 1861–1983). Unknown endings are not invented. Milestones precede Key people. Beliefs, formation/continuation, contextual biographies, documents and reading links are substantive. | Explorer covers rendering/links/ranges; substantive truth requires the data audit |
| PROFILE-02 | Open PCUS and use its successor navigation; inspect a merger connection. | Goes to the supported successor(s); a split-off is not falsely treated as the ending of an active parent. Connection details explain parties and evidence. | Model/reference checks; manual successor/causation review |
| MOBILE-01 | Select a branch on a phone; zoom using +/−; use Earlier/Later; switch to Horizontal and swipe sideways. | Controls fit, touch targets are usable, date range changes, graph scroll is contained; the page does not spill horizontally. | `scripts/test-mobile.cjs` includes actual dispatched touch events |
| MOBILE-05 | On mobile, open Search; type a query; close with the visible X (Close search), Escape or the search button; reopen and select a suggestion or press Enter. Resize to desktop and back. | Search starts collapsed on mobile and desktop. Opening focuses the input without resizing the graph. The query survives closing, selection and resizing. Close search and Escape return focus to the toggle. Selecting a result closes search and opens details. The input stays 16px to avoid iOS focus zoom. | Mobile suite at all five sizes; desktop suite; before/after screenshot measurements |
| MOBILE-02 | Search PCA; read profile sheet; Back to graph; reopen. Resize to desktop with the sheet open, then back. | Sheet fits width and scrolls internally; close/Escape works and focus returns; desktop restores the same detail panel in the split view. | Mobile suite |
| DESKTOP-01 | At 1100/1280/1440px, resize the divider with mouse and keyboard; maximize/restore browser. | Split view remains; graph recomputes layout and retains useful date context; width is announced; no fixed emulated viewport leaves a blank right strip. | Explorer suite; manual actual-window maximize/restore |
| THEME-01 | Open Site menu → Settings → Appearance, apply each palette, reload, visit Church History and all three Westminster readers, then reset. | Semantic colors change consistently, selected preference persists locally, reader/explorer inherit it, reset restores Parchment. Main Branch logo keeps its fixed brand colors. | Feature suite; manual graph/selected/focus contrast review |
| WCF-01 | Open chapter 23, section 23.3; reload; use Next and browser Back; open chapter 33 directly. | Correct chapter/section appears, URL is stable, keyboard focus follows chapter navigation, all 33 chapters and 172 sections are present. | `westminster/test-reader.cjs` |
| WCF-02 | Disable JavaScript and open a section URL; read the edition/source note. | Entire primary text remains readable; source and edition are explicit. No modern adopted standard is silently substituted for the hosted historical edition. | Reader suite plus source/license memo |
| STUDY-01 | When chapter study notes are released, open and close their optional entry for each chapter. | Text remains the default experience; commentary is labeled, edition/jurisdiction and disagreements are attributed, claim links work. | Planned research/acceptance in `westminster-study-plan.md`; not yet a completed test |
| BUILD-01 | Run `npm run test:guards`. | Isolated fixtures with broken graph/citation references, missing assets or development files in a release fail; a valid fixture passes. Canonical source data is untouched. | `scripts/test-build-guards.cjs` |
| RELEASE-01 | Push a topic branch and open a PR; inspect the required check. | CI runs on GitHub, PR does not deploy; failures block merge. Trusted passing PRs can merge automatically, but branch rules are never bypassed. | GitHub ruleset/check evidence; see deployment guide |
| RELEASE-02 | After merge, inspect main's build and deployment; visit production routes. | Only the tested artifact deploys. A failed new build leaves the last successful site in place. DNS/certificate status is checked separately from repository settings. | Workflow dependency/environment plus live verification |

## Review evidence and limits

- Screenshots: `.tmp/browser-check/`; CI uploads them as `browser-screenshots`,
  including on failure when screenshots exist. Inspect actual images after UI changes.
- Record viewport, palette, route, reproduction, expected/actual result and CI URL
  when reporting a regression. A local pass does not supersede a failing GitHub run.
- Syntax, referential integrity, image loading and HTTP success do not prove that
  history is complete, licensing is correct, or every claim is supported. Those
  require the source and historical coverage reviews.
- The study layer is an active separate task. Its plan/data should not be counted
  as a finished user experience until the feature and chapter-by-chapter checks ship.

## Adding or changing a feature

Add/update its scenario here, implement an appropriate test, rebuild generated
pages, review desktop/mobile screenshots, push its PR and verify the remote head
and required check. Update README, architecture and deployment/docs when the
source of truth changes. Keep intentional future plans clearly labeled.

## Mobile timeline gesture acceptance

| ID | Steps | Expected result | Coverage |
| --- | --- | --- | --- |
| MOBILE-03 | In Vertical and Horizontal, in Presbyterian and All branches, spread two fingers inside the timeline, pinch inward, then drag with one finger and tap a node. | Pinch narrows/widens proportional time around the fingers; nearby dates separate/collapse into meaningful groups. Page scale stays fixed. Drag pans; pinch never opens a profile; taps and controls still work. | `scripts/test-mobile.cjs`: real Chromium CDP multi-touch, reverse pinch, domain/page-scale assertions, drag, profile tap and controls at five viewport sizes. |

Also manually test adding/removing a finger during a drag, touch cancellation,
midpoint movement near viewport edges, and browser pinch outside the graph.
The graph alone uses `touch-action: none` with nonpassive touch listeners;
page user scaling remains enabled. Finger changes rebase the gesture and
end/cancel clears active contacts. Desktop wheel, trackpad and controls retain
their existing handlers (`scripts/test-explorer.cjs`).

Chromium desktop with mobile emulation exercises browser touch input but is not
physical Android certification. iOS Safari uses the same scoped touch-action
and cancelable Touch Event handlers; real iPhone/iPad testing remains required,
including Safari page zoom outside the viewport and interruption by system UI.

## Compact controls

| ID | Steps | Expected result | Coverage |
| --- | --- | --- | --- |
| MOBILE-04 | Open Filters in the Church History header. Change branch, view, orientation or date, then dismiss with the toggle or Escape. | Search, Filters, Details and the site menu share one header row at 320px, with 40px icon targets. Filters open over the graph on desktop and mobile. Escape returns focus to Filters. Both mobile timeline orientations show the graph, zoom and Earlier/Later controls within the first viewport. The controls join the header in short landscape. Swipe over the controls or outside the graph to reveal the legend below. | Mobile suite at five viewport sizes and desktop explorer tests. Screenshots show the closed header and open filter panel. |
