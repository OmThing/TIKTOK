param(
  [switch]$NoElevate
)

$ErrorActionPreference = "Stop"

function Test-Command($Name) {
  return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

function Test-Admin {
  $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
  $principal = New-Object Security.Principal.WindowsPrincipal($identity)
  return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Refresh-Path {
  $machine = [Environment]::GetEnvironmentVariable("Path", "Machine")
  $user = [Environment]::GetEnvironmentVariable("Path", "User")
  $env:Path = "$machine;$user"
}

function Install-WithWinget($Id, $Name) {
  if (-not (Test-Command "winget")) {
    return $false
  }

  Write-Host "[INFO] Installing $Name with winget..."
  winget install --id $Id --exact --source winget --accept-package-agreements --accept-source-agreements
  Refresh-Path
  return $true
}

function Invoke-Download($Url, $OutFile) {
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
  Write-Host "[INFO] Downloading $Url"
  Invoke-WebRequest -Uri $Url -OutFile $OutFile -Headers @{ "User-Agent" = "TK-Content-Growth-OS" }
}

function Get-GitHubReleaseAsset($Repo, $Pattern) {
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
  $release = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/releases/latest" -Headers @{ "User-Agent" = "TK-Content-Growth-OS" }
  $asset = $release.assets | Where-Object { $_.name -like $Pattern } | Select-Object -First 1
  if (-not $asset) {
    throw "Could not find release asset $Pattern for $Repo"
  }
  return $asset.browser_download_url
}

function Install-GitFallback {
  $temp = Join-Path $env:TEMP "tk-github-tools"
  New-Item -ItemType Directory -Force -Path $temp | Out-Null
  $installer = Join-Path $temp "Git-64-bit.exe"
  $url = Get-GitHubReleaseAsset "git-for-windows/git" "Git-*-64-bit.exe"
  Invoke-Download $url $installer
  Write-Host "[INFO] Running Git installer..."
  Start-Process -FilePath $installer -ArgumentList "/VERYSILENT /NORESTART /NOCANCEL /SP- /CLOSEAPPLICATIONS /RESTARTAPPLICATIONS" -Wait
  Refresh-Path
}

function Install-GhFallback {
  $temp = Join-Path $env:TEMP "tk-github-tools"
  New-Item -ItemType Directory -Force -Path $temp | Out-Null
  $installer = Join-Path $temp "gh-windows-amd64.msi"
  $url = Get-GitHubReleaseAsset "cli/cli" "gh_*_windows_amd64.msi"
  Invoke-Download $url $installer
  Write-Host "[INFO] Running GitHub CLI installer..."
  Start-Process -FilePath "msiexec.exe" -ArgumentList "/i `"$installer`" /qn /norestart" -Wait
  Refresh-Path
}

$needsInstall = -not (Test-Command "git") -or -not (Test-Command "gh")

if ($needsInstall -and -not $NoElevate -and -not (Test-Admin)) {
  Write-Host "[INFO] Admin permission may be required. Relaunching installer as administrator..."
  $script = $MyInvocation.MyCommand.Path
  Start-Process powershell.exe -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$script`" -NoElevate"
  exit 0
}

if (Test-Command "git") {
  Write-Host "[OK] Git is installed: $((git --version) -join ' ')"
} else {
  if (-not (Install-WithWinget "Git.Git" "Git")) {
    Install-GitFallback
  }
}

if (Test-Command "gh") {
  Write-Host "[OK] GitHub CLI is installed: $((gh --version | Select-Object -First 1) -join ' ')"
} else {
  if (-not (Install-WithWinget "GitHub.cli" "GitHub CLI")) {
    Install-GhFallback
  }
}

Refresh-Path

Write-Host ""
Write-Host "[DONE] GitHub tools are ready."
Write-Host "Git: $(git --version)"
Write-Host "GitHub CLI: $((gh --version | Select-Object -First 1) -join ' ')"
Write-Host ""
Write-Host "If you have not logged in yet, run:"
Write-Host "  gh auth login"
