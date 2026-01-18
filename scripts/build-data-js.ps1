param(
  [string]$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
)

$dataDir = Join-Path $RepoRoot "data"
$outFile = Join-Path $dataDir "data.js"

$nodesPath = Join-Path $dataDir "nodes.json"
$edgesPath = Join-Path $dataDir "edges.json"

if (!(Test-Path $nodesPath) -or !(Test-Path $edgesPath)) {
  throw "Missing data files. Expected nodes.json and edges.json in $dataDir"
}

$nodes = Get-Content -Raw $nodesPath | ConvertFrom-Json
$edges = Get-Content -Raw $edgesPath | ConvertFrom-Json

$payload = [ordered]@{
  nodes = $nodes
  edges = $edges
}

$json = $payload | ConvertTo-Json -Depth 12
$content = @"
// Generated from local JSON sources. Update this file when data changes.
window.CHURCHTREE_DATA = $json;
"@

$content | Set-Content -Path $outFile -Encoding UTF8
Write-Host "Wrote $outFile"

