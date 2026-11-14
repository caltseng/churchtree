# ChurchTree

A desktop explorer of church-history relationships, with an emphasis on American
Protestant movements and their historical roots. Content aims to be sourced,
neutral and clear about uncertainty; the dataset remains under active review.

## Explore
- Major branches remain a connected graph, without a proportional time scale.
- Compact lineage reveals historical groups, then individual denominations.
- Proportional timeline preserves real date spacing: wheel to zoom, drag to pan.
  Nearby records cluster within their tradition and separate as you zoom in.
  Records at the same date may remain clustered; select them to inspect members.
- Search reaches any recorded body. Select nodes and connections for details,
  sources, people, documents and successor navigation where available.
- Trace ancestry retains originating bodies as context outside the time scale.
- Drag the divider to resize the graph and reading panel, or focus it and use
  left/right arrows. Mobile is currently out of scope.

## Run
Build the static bundle:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/build-data-js.ps1
```

Open `index.html`, or serve the repository using a local static HTTP server.
D3 loads from d3js.org and requires an internet connection.

## Validate

```powershell
node scripts/validate-data.cjs
node scripts/test-explorer.cjs
```

Browser checks require Playwright and Microsoft Edge. If Playwright is installed
outside the repository, set `PLAYWRIGHT_MODULE` to its package directory. Set
`HEADED=1` to watch the checks. Screenshots are written under `.tmp/browser-check`.
The validator deliberately fails for unresolved evidence; don't confuse a working
UI with completed historical verification.

## Structure
Research notes and structured records live under `data/sets`. Shared evidence lives
under `data/common`. The build combines these into generated `data/data.js`.
`graph-groups.js` defines display groupings, not new historical denominations.
`explorer.js` manages selection and compact rendering; `timeline.js` handles the
proportional timeline and screen-space clustering.

See `plans/desktop-explorer.md` for the implementation decisions,
`docs/data-quality-audit.md` for data review, and `plans/belief-history-future.md`
for the future theological-development explorer (planned, not implemented).

For an interactive Playwright window, run `node scripts/launch-explorer.cjs` after starting a local server (default: http://127.0.0.1:8765). This uses the actual window size instead of a fixed test viewport.

The Horizontal timeline layout runs dates left to right. Use the horizontal scrollbar, trackpad, or Shift + mouse wheel to travel through time; +/− and Ctrl + wheel zoom around the visible date. Tradition labels stay visible while scrolling. Both timeline orientations use named clusters and date-only subtitles.
