param(
  [string]$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
)

$dataDir = Join-Path $RepoRoot "data"
$setDirs = @(
  (Join-Path $dataDir "sets\\presbyterian-us"),
  (Join-Path $dataDir "sets\\presbyterian-europe")
)
$outFile = Join-Path $dataDir "data.js"

$nodes = @()
$edges = @()

foreach ($setDir in $setDirs) {
  $nodesPath = Join-Path $setDir "nodes.json"
  $edgesPath = Join-Path $setDir "edges.json"
  if (!(Test-Path $nodesPath) -or !(Test-Path $edgesPath)) {
    throw "Missing data files. Expected nodes.json and edges.json in $setDir"
  }
  $nodes += Get-Content -Raw $nodesPath | ConvertFrom-Json
  $edges += Get-Content -Raw $edgesPath | ConvertFrom-Json
}

$nodesJson = $nodes | ConvertTo-Json -Depth 10
$edgesJson = $edges | ConvertTo-Json -Depth 10

$content = @"
// Generated from local JSON sources. Do not edit by hand.
window.CHURCHTREE_DATA = {
  nodes: $nodesJson,
  edges: $edgesJson
};
"@

$content | Set-Content -Path $outFile -Encoding UTF8
Write-Host "Wrote $outFile"
