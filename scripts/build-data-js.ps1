param(
  [string]$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
)

$dataDir = Join-Path $RepoRoot "data"
$setDirs = @(
  (Join-Path $dataDir "sets\\presbyterian-us"),
  (Join-Path $dataDir "sets\\presbyterian-europe"),
  (Join-Path $dataDir "sets\\anglican-europe"),
  (Join-Path $dataDir "sets\\lutheran-europe"),
  (Join-Path $dataDir "sets\\methodist-europe"),
  (Join-Path $dataDir "sets\\baptist-europe"),
  (Join-Path $dataDir "sets\\baptist-us"),
  (Join-Path $dataDir "sets\\methodist-us"),
  (Join-Path $dataDir "sets\\lutheran-us"),
  (Join-Path $dataDir "sets\\anglican-us"),
  (Join-Path $dataDir "sets\\pentecostal-us"),
  (Join-Path $dataDir "sets\\holiness-restorationist-us"),
  (Join-Path $dataDir "sets\\adventist-us")
)
$outFile = Join-Path $dataDir "data.js"

$nodes = @()
$edges = @()
$events = @()
$sources = @()
$sources += Get-Content -Raw (Join-Path $dataDir 'common/sources.json') | ConvertFrom-Json
$citations = @()
$citations += Get-Content -Raw (Join-Path $dataDir 'common/citations.json') | ConvertFrom-Json

foreach ($setDir in $setDirs) {
  $nodesPath = Join-Path $setDir "nodes.json"
  $edgesPath = Join-Path $setDir "edges.json"
  $eventsPath = Join-Path $setDir "events.json"
  $sourcesPath = Join-Path $setDir "sources.json"
  $citationsPath = Join-Path $setDir "citations.json"
  if (!(Test-Path $nodesPath) -or !(Test-Path $edgesPath)) {
    throw "Missing data files. Expected nodes.json and edges.json in $setDir"
  }
  $nodes += Get-Content -Raw $nodesPath | ConvertFrom-Json
  $edges += Get-Content -Raw $edgesPath | ConvertFrom-Json
  if (Test-Path $eventsPath) {
    $events += Get-Content -Raw $eventsPath | ConvertFrom-Json
  }
  if (Test-Path $sourcesPath) {
    $sources += Get-Content -Raw $sourcesPath | ConvertFrom-Json
  }
  if (Test-Path $citationsPath) {
    $citations += Get-Content -Raw $citationsPath | ConvertFrom-Json
  }
}

$nodesJson = $nodes | ConvertTo-Json -Depth 10
$edgesJson = $edges | ConvertTo-Json -Depth 10
$eventsJson = $events | ConvertTo-Json -Depth 10
$sourcesJson = $sources | ConvertTo-Json -Depth 10
$citationsJson = $citations | ConvertTo-Json -Depth 10

$content = @"
// Generated from local JSON sources. Do not edit by hand.
window.CHURCHTREE_DATA = {
  nodes: $nodesJson,
  edges: $edgesJson,
  events: $eventsJson,
  sources: $sourcesJson,
  citations: $citationsJson
};
"@

$content | Set-Content -Path $outFile -Encoding UTF8
Write-Host "Wrote $outFile"

