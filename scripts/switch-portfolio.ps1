param(
  [Parameter(Mandatory = $true)]
  [ValidateSet("v1", "v2", "status")]
  [string]$Variant
)

$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$sourceItems = @("index.html", "css", "js")
$v1Profile = Join-Path $root "profiles\v1"
$v2Profile = Join-Path $root "profiles\v2"
$activeFile = Join-Path $root "active-variant.txt"

function Copy-VariantItem {
  param([string]$SourceRoot)

  foreach ($itemName in $sourceItems) {
    $source = Join-Path $SourceRoot $itemName
    $destination = Join-Path $root $itemName
    if (-not (Test-Path -LiteralPath $source)) {
      if (Test-Path -LiteralPath $destination) {
        if ((Get-Item -LiteralPath $destination).PSIsContainer) {
          Remove-Item -LiteralPath $destination -Recurse -Force
        } else {
          Remove-Item -LiteralPath $destination -Force
        }
      }
      continue
    }
    Copy-CleanItem -Source $source -Destination $destination
  }
}

function Copy-CleanItem {
  param([string]$Source, [string]$Destination)

  if (-not (Test-Path -LiteralPath $Source)) {
    throw "Missing variant item: $Source"
  }

  if (Test-Path -LiteralPath $Destination) {
    if ((Get-Item -LiteralPath $Destination).PSIsContainer) {
      Remove-Item -LiteralPath $Destination -Recurse -Force
    } else {
      Remove-Item -LiteralPath $Destination -Force
    }
  }

  Copy-Item -LiteralPath $Source -Destination $Destination -Recurse -Force
}

if ($Variant -eq "status") {
  if (Test-Path -LiteralPath $activeFile) {
    Write-Output "Active profile: $((Get-Content -LiteralPath $activeFile -Raw).Trim())"
  } else {
    Write-Output "Active profile: v1 (default)"
  }
  exit 0
}

if ($Variant -eq "v2") {
  New-Item -ItemType Directory -Force -Path $v1Profile | Out-Null
  foreach ($itemName in $sourceItems) {
    Copy-CleanItem -Source (Join-Path $root $itemName) -Destination (Join-Path $v1Profile $itemName)
  }
  Copy-VariantItem -SourceRoot $v2Profile
  Set-Content -LiteralPath $activeFile -Value "v2" -NoNewline
  Write-Output "Switched website root to profile v2."
  exit 0
}

if (-not (Test-Path -LiteralPath $v1Profile)) {
  throw "The v1 profile snapshot is missing."
}

Copy-VariantItem -SourceRoot $v1Profile
Set-Content -LiteralPath $activeFile -Value "v1" -NoNewline
Write-Output "Restored profile v1."
