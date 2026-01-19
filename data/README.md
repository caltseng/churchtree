# Data Files

Primary data lives in:
- `data/sets/presbyterian-us/nodes.json`
- `data/sets/presbyterian-us/edges.json`

Shared metadata lives in:
- `data/common/sources.json`
- `data/common/citations.json`
- `data/common/tags.json`

Build `data/data.js` for the web app with:
```
powershell -ExecutionPolicy Bypass -File scripts/build-data-js.ps1
```
