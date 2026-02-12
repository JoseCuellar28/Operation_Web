# ==========================================
# Operation Smart - Production Runbook Automation (V4)
# ==========================================
# This script executes the production captcha runbook end-to-end:
# 1) Restart tunnels and capture live URLs
# 2) Inject backend URL into docker-compose.prod.yml
# 3) Rebuild containers with --no-cache
# 4) Validate embedded frontend API URL in built bundle
# 5) Validate captcha endpoint, CORS, and legacy route hardening
# 6) Persist deployment evidence for audit
# ==========================================

$ErrorActionPreference = "Stop"
$DockerComposeFile = "docker-compose.prod.yml"
$BackendLogOutFile = "backend_tunnel.out.log"
$BackendLogErrFile = "backend_tunnel.err.log"
$FrontendLogOutFile = "frontend_tunnel.out.log"
$FrontendLogErrFile = "frontend_tunnel.err.log"
$EvidenceDir = "deployment_evidence"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$EvidenceFile = Join-Path $EvidenceDir "captcha_closure_$Timestamp.txt"

function Write-Step([string]$Text) {
    Write-Host "`n==> $Text" -ForegroundColor Yellow
}

function Assert-Condition([bool]$Condition, [string]$Message) {
    if (-not $Condition) {
        throw $Message
    }
}

function Append-Evidence([string]$Title, [string]$Body) {
    Add-Content -Path $EvidenceFile -Value "[$Title]"
    Add-Content -Path $EvidenceFile -Value $Body
    Add-Content -Path $EvidenceFile -Value ""
}

function Resolve-CloudflaredPath() {
    $candidates = @(
        (Join-Path (Get-Location) "cloudflared.exe"),
        (Join-Path $PSScriptRoot "cloudflared.exe")
    )

    foreach ($candidate in $candidates) {
        if (Test-Path $candidate) {
            return (Resolve-Path $candidate).Path
        }
    }

    $cmd = Get-Command cloudflared -ErrorAction SilentlyContinue
    if ($null -ne $cmd) {
        return $cmd.Source
    }

    throw "cloudflared not found. Place cloudflared.exe in repo root or add it to PATH."
}

function Get-TryCloudflareUrl([string[]]$LogFilePaths, [int]$MaxAttempts = 30, [int]$SleepSeconds = 2) {
    for ($i = 0; $i -lt $MaxAttempts; $i++) {
        Write-Host "." -NoNewline
        Start-Sleep -Seconds $SleepSeconds
        $combined = ""
        foreach ($logFilePath in $LogFilePaths) {
            if (Test-Path $logFilePath) {
                $combined += (Get-Content $logFilePath -Raw -ErrorAction SilentlyContinue) + "`n"
            }
        }
        if ($combined -match "https://[a-zA-Z0-9-]+\.trycloudflare\.com") {
            return $matches[0]
        }
    }
    return $null
}

function Wait-ApiHealthy([int]$MaxAttempts = 30, [int]$SleepSeconds = 2) {
    for ($i = 0; $i -lt $MaxAttempts; $i++) {
        try {
            $health = Invoke-WebRequest -Uri "http://127.0.0.1:5132/health" -Method GET -UseBasicParsing
            if ([int]$health.StatusCode -eq 200) {
                return $true
            }
        }
        catch { }
        Start-Sleep -Seconds $SleepSeconds
    }
    return $false
}

function Get-UniqueTunnelUrls([string]$Text) {
    $matches = [regex]::Matches($Text, "https://[a-zA-Z0-9-]+\.trycloudflare\.com")
    return $matches | ForEach-Object { $_.Value } | Select-Object -Unique
}

if (-not (Test-Path $DockerComposeFile)) {
    throw "Compose file not found: $DockerComposeFile"
}

$CloudflaredPath = Resolve-CloudflaredPath

try {
    $osType = ((docker info --format '{{.OSType}}') -join "").Trim().ToLowerInvariant()
    Assert-Condition ($osType -eq "linux") "Docker daemon is in '$osType' mode. Switch to Linux containers first."
}
catch {
    throw "Unable to validate docker daemon mode. Ensure Docker is running and Linux containers are enabled."
}

if (-not (Test-Path $EvidenceDir)) {
    New-Item -ItemType Directory -Path $EvidenceDir | Out-Null
}

Set-Content -Path $EvidenceFile -Value "Operation Smart Captcha Closure Evidence"
Add-Content -Path $EvidenceFile -Value "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz')"
Add-Content -Path $EvidenceFile -Value "Compose File: $DockerComposeFile"
Add-Content -Path $EvidenceFile -Value "Cloudflared Path: $CloudflaredPath"
Add-Content -Path $EvidenceFile -Value ""

Write-Host "`nRUNBOOK START: CAPTCHA INCIDENT CLOSURE" -ForegroundColor Cyan

# 1) Cleanup and restart tunnels
Write-Step "1/9 Reset Docker stack and cloudflared processes"
docker compose -f $DockerComposeFile down --remove-orphans
Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Step "2/9 Start backend tunnel and capture active URL"
if (Test-Path $BackendLogOutFile) { Remove-Item $BackendLogOutFile -Force }
if (Test-Path $BackendLogErrFile) { Remove-Item $BackendLogErrFile -Force }
Start-Process -FilePath $CloudflaredPath -ArgumentList "tunnel --url http://127.0.0.1:5132" -RedirectStandardOutput $BackendLogOutFile -RedirectStandardError $BackendLogErrFile -WindowStyle Hidden
$BackendUrl = Get-TryCloudflareUrl -LogFilePaths @($BackendLogOutFile, $BackendLogErrFile)
Write-Host ""
Assert-Condition ($null -ne $BackendUrl) "Backend tunnel URL was not captured."
Write-Host "Backend URL: $BackendUrl" -ForegroundColor Green
Append-Evidence -Title "Backend Tunnel URL" -Body $BackendUrl

Write-Step "3/9 Inject backend URL into docker-compose.prod.yml and verify both VITE_API_URL targets"
$content = Get-Content $DockerComposeFile -Raw
$content = $content -replace 'VITE_API_URL:\s*".*"', "VITE_API_URL: `"$BackendUrl`""
$content = $content -replace 'VITE_API_URL=.*', "VITE_API_URL=$BackendUrl"
Set-Content -Path $DockerComposeFile -Value $content

$verify = Get-Content $DockerComposeFile -Raw
$hasBuildArg = $verify -match "VITE_API_URL:\s*`"$([regex]::Escape($BackendUrl))`""
$hasEnvVar = $verify -match "VITE_API_URL=$([regex]::Escape($BackendUrl))"
Assert-Condition $hasBuildArg "Build arg VITE_API_URL was not updated correctly."
Assert-Condition $hasEnvVar "Environment VITE_API_URL was not updated correctly."
Write-Host "Compose injection validated (build args + env)." -ForegroundColor Green
Append-Evidence -Title "Compose Injection Check" -Body "BuildArg=$hasBuildArg | EnvVar=$hasEnvVar"

Write-Step "4/9 Force clean rebuild and start containers"
docker compose -f $DockerComposeFile build --no-cache
docker compose -f $DockerComposeFile up -d
Assert-Condition (Wait-ApiHealthy) "API did not become healthy on http://127.0.0.1:5132/health"
$composePs = docker compose -f $DockerComposeFile ps
Append-Evidence -Title "Docker Compose PS" -Body ($composePs -join "`n")

Write-Step "5/9 Start frontend tunnel and capture active URL"
if (Test-Path $FrontendLogOutFile) { Remove-Item $FrontendLogOutFile -Force }
if (Test-Path $FrontendLogErrFile) { Remove-Item $FrontendLogErrFile -Force }
Start-Process -FilePath $CloudflaredPath -ArgumentList "tunnel --url http://127.0.0.1:5173" -RedirectStandardOutput $FrontendLogOutFile -RedirectStandardError $FrontendLogErrFile -WindowStyle Hidden
$FrontendUrl = Get-TryCloudflareUrl -LogFilePaths @($FrontendLogOutFile, $FrontendLogErrFile)
Write-Host ""
Assert-Condition ($null -ne $FrontendUrl) "Frontend tunnel URL was not captured."
Write-Host "Frontend URL: $FrontendUrl" -ForegroundColor Green
Append-Evidence -Title "Frontend Tunnel URL" -Body $FrontendUrl

Write-Step "6/9 Validate API URL compiled inside frontend bundle"
$bundleScan = docker exec operation_frontend sh -lc "grep -R --line-number -E 'https://[a-zA-Z0-9-]+\.trycloudflare\.com' /app/dist/assets/*.js || true"
$bundleUrls = Get-UniqueTunnelUrls -Text ($bundleScan -join "`n")
Assert-Condition ($bundleUrls.Count -ge 1) "No trycloudflare URL found in frontend bundle."
Assert-Condition ($bundleUrls -contains $BackendUrl) "Frontend bundle does not contain the active backend URL."
Assert-Condition ($bundleUrls.Count -eq 1) "Frontend bundle contains more than one trycloudflare URL: $($bundleUrls -join ', ')"
Write-Host "Frontend bundle is pinned to active backend URL." -ForegroundColor Green
Append-Evidence -Title "Frontend Bundle URL Scan" -Body ($bundleScan -join "`n")

Write-Step "7/9 Validate captcha endpoint and CORS headers"
$captchaResponse = Invoke-WebRequest -Uri "$BackendUrl/api/v1/auth/captcha" -Method GET -UseBasicParsing
$captchaStatus = [int]$captchaResponse.StatusCode
$captchaJson = $captchaResponse.Content | ConvertFrom-Json
Assert-Condition ($captchaStatus -eq 200) "Captcha endpoint status is not 200."
Assert-Condition (-not [string]::IsNullOrWhiteSpace($captchaJson.id)) "Captcha response has no id."
Assert-Condition (-not [string]::IsNullOrWhiteSpace($captchaJson.image)) "Captcha response has no image."

$corsResponse = Invoke-WebRequest -Uri "$BackendUrl/api/v1/auth/captcha" -Method GET -Headers @{ Origin = $FrontendUrl } -UseBasicParsing
$allowOrigin = $corsResponse.Headers["Access-Control-Allow-Origin"]
$allowCredentials = $corsResponse.Headers["Access-Control-Allow-Credentials"]
Assert-Condition ($allowOrigin -eq $FrontendUrl) "CORS Allow-Origin mismatch. Expected $FrontendUrl got $allowOrigin"
Assert-Condition ($allowCredentials -eq "true") "CORS Allow-Credentials is not true."
Write-Host "Captcha and CORS checks passed." -ForegroundColor Green
Append-Evidence -Title "Captcha + CORS Check" -Body ("Status=$captchaStatus | Allow-Origin=$allowOrigin | Allow-Credentials=$allowCredentials")

Write-Step "8/9 Validate legacy route hardening (/api/auth/captcha must return 404)"
$legacyStatus = 0
try {
    $legacyResponse = Invoke-WebRequest -Uri "$BackendUrl/api/auth/captcha" -Method GET -UseBasicParsing
    $legacyStatus = [int]$legacyResponse.StatusCode
}
catch {
    if ($_.Exception.Response -ne $null) {
        $legacyStatus = [int]$_.Exception.Response.StatusCode.value__
    } else {
        throw
    }
}
Assert-Condition ($legacyStatus -eq 404) "Legacy captcha route did not return 404. Got $legacyStatus"
Write-Host "Legacy hardening check passed (404)." -ForegroundColor Green
Append-Evidence -Title "Legacy Route Check" -Body "Status=$legacyStatus"

Write-Step "9/9 Final closure evidence"
Append-Evidence -Title "Tunnel Logs" -Body ("BackendOut=$BackendLogOutFile`nBackendErr=$BackendLogErrFile`nFrontendOut=$FrontendLogOutFile`nFrontendErr=$FrontendLogErrFile")
Append-Evidence -Title "Summary" -Body "Backend=$BackendUrl`nFrontend=$FrontendUrl`nEvidenceFile=$EvidenceFile"

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "INCIDENT CLOSURE CHECKLIST COMPLETED" -ForegroundColor Green
Write-Host "BACKEND URL : $BackendUrl"
Write-Host "FRONTEND URL: $FrontendUrl"
Write-Host "EVIDENCE    : $EvidenceFile"
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Action for QA/User: Hard refresh (Ctrl+F5) and re-check login captcha in browser." -ForegroundColor Yellow
