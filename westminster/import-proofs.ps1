param(
  [Parameter(Mandatory = $true)][string]$SourcePath
)
$ErrorActionPreference = 'Stop'
$expectedHash = '756ADF1DDD466D237221C76B99D25D55CAB7E83D08914F28A289C3B90DCCDDF3'
if ((Get-FileHash -LiteralPath $SourcePath -Algorithm SHA256).Hash -ne $expectedHash) {
  throw 'Unexpected Schaff XML: review the source before importing.'
}
$xml = New-Object System.Xml.XmlDocument
$xml.XmlResolver = $null
$xml.Load($SourcePath)
$source = $xml.SelectSingleNode('//*[@id="iv.xvii.ii"]')
$text = Get-Content -Encoding UTF8 -Raw (Join-Path $PSScriptRoot 'content.json') | ConvertFrom-Json
$chapters = @($text.chapters | ForEach-Object {
  [ordered]@{ chapter = $_.number; sections = @($_.sections | ForEach-Object { [ordered]@{ groups = @() } }) }
})
$bookNames = @{
  Gen='Genesis'; Exod='Exodus'; Lev='Leviticus'; Num='Numbers'; Deut='Deuteronomy'
  Josh='Joshua'; Judg='Judges'; Ruth='Ruth'; '1Sam'='1 Samuel'; '2Sam'='2 Samuel'
  '1Kgs'='1 Kings'; '2Kgs'='2 Kings'; '1Chr'='1 Chronicles'; '2Chr'='2 Chronicles'
  Ezra='Ezra'; Neh='Nehemiah'; Esth='Esther'; Job='Job'; Ps='Psalms'; Prov='Proverbs'
  Eccl='Ecclesiastes'; Song='Song of Songs'; Isa='Isaiah'; Jer='Jeremiah'; Lam='Lamentations'
  Ezek='Ezekiel'; Dan='Daniel'; Hos='Hosea'; Joel='Joel'; Amos='Amos'; Obad='Obadiah'
  Jonah='Jonah'; Mic='Micah'; Nah='Nahum'; Hab='Habakkuk'; Zeph='Zephaniah'; Hag='Haggai'
  Zech='Zechariah'; Mal='Malachi'; Matt='Matthew'; Mark='Mark'; Luke='Luke'; John='John'
  Acts='Acts'; Rom='Romans'; '1Cor'='1 Corinthians'; '2Cor'='2 Corinthians'; Gal='Galatians'
  Eph='Ephesians'; Phil='Philippians'; Col='Colossians'; '1Thess'='1 Thessalonians'
  '2Thess'='2 Thessalonians'; '1Tim'='1 Timothy'; '2Tim'='2 Timothy'; Titus='Titus'
  Phlm='Philemon'; Heb='Hebrews'; Jas='James'; '1Pet'='1 Peter'; '2Pet'='2 Peter'
  '1John'='1 John'; '2John'='2 John'; '3John'='3 John'; Jude='Jude'; Rev='Revelation'
}
$referenceCorrections = @{
  'iv.xvii.ii-p7.644' = 'Hebrews 9:15-17'
  'iv.xvii.ii-p9.230' = 'Ezekiel 16:20; Ezekiel 16:21'
  'iv.xvii.ii-p7.1668' = 'Ephesians 3:16-19'
  'iv.xvii.ii-p7.1756' = 'Ephesians 1:17-19'
  'iv.xvii.ii-p7.2377' = 'Psalms 89:31; Psalms 89:32'
  'iv.xvii.ii-p7.3013' = 'Revelation 3:9'
  'iv.xvii.ii-p7.3374' = 'Exodus 20:8; Exodus 20:10; Exodus 20:11'
  'iv.xvii.ii-p7.3632' = 'Acts 10:1; Acts 10:2'
  'iv.xvii.ii-p9.165' = 'Matthew 5:31; Matthew 5:32'
  'iv.xvii.ii-p9.681' = 'Exodus 4:24-26'
  'iv.xvii.ii-p9.734' = '1 Corinthians 11:23-26'
}
function RomanNumber([string]$value) {
  $digits = @{ I=1; V=5; X=10; L=50; C=100 }
  $result = 0; $previous = 0
  for ($i = $value.Length - 1; $i -ge 0; $i--) {
    $digit = $digits[[string]$value[$i]]
    if (!$digit) { throw "Invalid Roman numeral $value" }
    if ($digit -lt $previous) { $result -= $digit } else { $result += $digit }
    $previous = $digit
  }
  return $result
}
$chapter = 0; $section = 0; $excluded = @(); $corrections = @()
foreach ($row in $source.SelectNodes('.//tr')) {
  $cell = $row.SelectSingleNode('./th[1]|./td[1]')
  if (!$cell) { continue }
  if ($cell.InnerText -match '^Chapter ([IVX]+)\.$') {
    $chapter = RomanNumber $Matches[1]; $section = 0; continue
  }
  if (!$chapter -or $cell.Name -ne 'td' -or $cell.GetAttribute('lang') -eq 'LA') { continue }
  $clone = $cell.CloneNode($true)
  foreach ($note in @($clone.SelectNodes('.//note'))) { [void]$note.ParentNode.RemoveChild($note) }
  if ($clone.InnerText -match '^\s*([IVX]+)\.') { $section = RomanNumber $Matches[1] }
  if (!$section -and $chapter -in @(5,12)) { $section = 1 }
  foreach ($note in $cell.SelectNodes('.//note[scripRef]')) {
    if (!$section -or $section -gt $chapters[$chapter-1].sections.Count) { throw "Invalid section for $($note.id)" }
    # Bracketed American additions belong to Schaff's comparison, not this historical edition.
    $clean = [regex]::Replace($note.OuterXml, '\[[^\]]*\]', '')
    [xml]$proof = $clean
    $refs = @()
    foreach ($ref in $proof.SelectNodes('//scripRef')) {
      $passages = @()
      $originalLabel = ($ref.InnerText -replace '\s+', ' ').Trim()
      $printedChapters = @([regex]::Matches($originalLabel, '(?<![A-Za-z])([ivxlc]+)\.\s*(?=\d)') |
        ForEach-Object { RomanNumber $_.Groups[1].Value.ToUpperInvariant() } | Select-Object -Unique)
      $corrected = $false
      foreach ($part in ($ref.GetAttribute('osisRef') -split '\s+')) {
        if ($part -notmatch '^Bible:([\dA-Za-z]+)\.(\d+)(?:\.(\d+))?(?:-([\dA-Za-z]+)\.(\d+)(?:\.(\d+))?)?$') {
          throw "Unparsed reference $part in $($ref.id)"
        }
        $book=$Matches[1]; $startChapter=$Matches[2]; $startVerse=$Matches[3]
        $endBook=$Matches[4]; $endChapter=$Matches[5]; $endVerse=$Matches[6]
        if (!$bookNames.ContainsKey($book)) { throw "Unknown Bible book $book" }
        if ($printedChapters.Count -eq 1 -and [int]$startChapter -ne $printedChapters[0]) {
          if ($endChapter -and $endChapter -ne $startChapter) { throw "Review cross-chapter metadata in $($ref.id)" }
          $startChapter = [string]$printedChapters[0]
          if ($endChapter) { $endChapter = $startChapter }
          $corrected = $true
        }
        $label = "$($bookNames[$book]) $startChapter"
        if ($startVerse) { $label += ":$startVerse" }
        if ($endChapter) {
          if ($endBook -ne $book) { throw "Cross-book reference $part" }
          $label += '-'
          if ($endChapter -ne $startChapter -or !$startVerse) {
            $label += $endChapter
            if ($endVerse) { $label += ":$endVerse" }
          } else { $label += $endVerse }
        }
        $passages += $label
      }
      $reference = $passages -join '; '
      if ($referenceCorrections.ContainsKey($ref.GetAttribute('id'))) {
        $reference = $referenceCorrections[$ref.GetAttribute('id')]
        $corrected = $true
      }
      if ($corrected) {
        $corrections += [ordered]@{
          sourceId = $ref.GetAttribute('id')
          sourceLabel = $originalLabel
          sourceOSIS = $ref.GetAttribute('osisRef')
          correctedReference = $reference
          reason = 'Explicit printed chapter and verse numbers override inconsistent CCEL OSIS metadata.'
        }
      }
      $refs += [ordered]@{
        reference = $reference
        sourceLabel = $originalLabel
        sourceId = $ref.GetAttribute('id')
      }
    }
    if ($refs.Count) {
      $chapters[$chapter-1].sections[$section-1].groups += [ordered]@{
        sourceNote = $note.GetAttribute('id')
        sourceNumber = $note.GetAttribute('n')
        references = $refs
      }
    }
    foreach ($ref in $note.SelectNodes('.//scripRef')) {
      if ($clean -notmatch [regex]::Escape($ref.GetAttribute('id'))) { $excluded += $ref.GetAttribute('id') }
    }
  }
}
foreach ($c in $chapters) {
  foreach ($s in $c.sections) { if (!$s.groups.Count) { throw "Missing proofs in chapter $($c.chapter)" } }
}
$result = [ordered]@{
  schemaVersion = 1
  source = [ordered]@{
    title = 'Philip Schaff, The Creeds of Christendom, volume III, fourth edition (1919), pp. 600-673'
    url = 'https://www.ccel.org/ccel/schaff/creeds3/creeds3.iv.xvii.ii.html'
    xmlURL = 'https://www.ccel.org/ccel/s/schaff/creeds3.xml'
    sha256 = $expectedHash.ToLowerInvariant()
    accessedOn = '2026-11-22'
    scope = 'Scripture references in the historical English column; Latin duplicates and bracketed American additions excluded. CCEL OSIS metadata supplies expanded labels, except recorded chapter/verse corrections checked against the printed reference labels. Original labels and note locators are retained. Not a collation with the 1647 first printing.'
    reuse = 'Underlying pre-1931 edition is U.S. public domain. Only reference data is reproduced, not CCEL site content or commentary. Bible links open the ASV (1901); Bible text is not copied.'
    excludedAmericanReferenceIds = $excluded
    metadataCorrections = $corrections
  }
  chapters = $chapters
}
$output = Join-Path $PSScriptRoot 'scripture-proofs.json'
[System.IO.File]::WriteAllText($output, ($result | ConvertTo-Json -Depth 12) + "`n", (New-Object System.Text.UTF8Encoding($false)))
node -e "const fs=require('node:fs');const file=process.argv[1];fs.writeFileSync(file,JSON.stringify(JSON.parse(fs.readFileSync(file,'utf8')),null,2)+'\n');" $output
if ($LASTEXITCODE -ne 0) { throw 'Could not format imported proof data.' }
Write-Output 'Imported historical Scripture proofs for all 172 sections.'
