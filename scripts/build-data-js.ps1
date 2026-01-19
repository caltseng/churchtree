param(
  [string]$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
)

$dataDir = Join-Path $RepoRoot "data"
$setDir = Join-Path $dataDir "sets\\presbyterian-us"
$outFile = Join-Path $dataDir "data.js"

$nodesPath = Join-Path $setDir "nodes.json"
$edgesPath = Join-Path $setDir "edges.json"

if (!(Test-Path $nodesPath) -or !(Test-Path $edgesPath)) {
  throw "Missing data files. Expected nodes.json and edges.json in $setDir"
}

$nodesJson = Get-Content -Raw $nodesPath
$edgesJson = Get-Content -Raw $edgesPath

$content = @"
// Generated from local JSON sources. Do not edit by hand.
window.CHURCHTREE_DATA = {
  nodes: $nodesJson,
  edges: $edgesJson
};
"@

$content | Set-Content -Path $outFile -Encoding UTF8
Write-Host "Wrote $outFile"
