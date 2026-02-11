# ==========================================
# Operation Smart - Start Server (V3 - FINAL ROBUST)
# ==========================================
# 1. Clean environment
# 2. Start Tunnels
# 3. VERIFY & INJECT (No Cache)
# ==========================================

$ErrorActionPreference = "Continue" # Don't stop on minor cleanup errors
$CloudflaredPath = "cloudflared.exe" 
$DockerComposeFile = "docker-compose.prod.yml"

Write-Host "`n🚀 DEEP VERIFICATION DEPLOYMENT STARTING..." -ForegroundColor Cyan

# 1. Cleanup everything
Write-Host "1. Hard reset of Docker & Tunnels..." -ForegroundColor Yellow
docker compose -f $DockerComposeFile down --remove-orphans
try { Stop-Process -Name "cloudflared" -Force -ErrorAction SilentlyContinue } catch {}

# 2. Backend Tunnel
Write-Host "2. Starting Backend Tunnel..." -ForegroundColor Yellow
$BackendLogFile = "backend_tunnel.log"
if (Test-Path $BackendLogFile) { Remove-Item $BackendLogFile }
Start-Process -FilePath $CloudflaredPath -ArgumentList "tunnel --url http://127.0.0.1:5132" -RedirectStandardOutput $BackendLogFile -RedirectStandardError $BackendLogFile -WindowStyle Hidden

$BackendUrl = $null
for ($i = 0; $i -lt 15; $i++) {
    Write-Host "." -NoNewline
    Start-Sleep -Seconds 2
    if (Test-Path $BackendLogFile) {
        $Log = Get-Content $BackendLogFile -Raw
        if ($Log -match "https://[a-zA-Z0-9-]+\.trycloudflare\.com") {
            $BackendUrl = $matches[0]
            break
        }
    }
}
Write-Host "`n✅ Captured Backend: $BackendUrl" -ForegroundColor Green

# 3. Inyectar y VERIFICAR
Write-Host "3. Injecting into $DockerComposeFile..." -ForegroundColor Yellow
$Content = Get-Content $DockerComposeFile -Raw
# Replace in build args (VITE_API_URL: "...")
$Content = $Content -replace 'VITE_API_URL:\s*".*"', "VITE_API_URL: `"$BackendUrl`""
# Replace in environment variables (- VITE_API_URL=...)
$Content = $Content -replace 'VITE_API_URL=.*', "VITE_API_URL=$BackendUrl"
Set-Content $DockerComposeFile $Content

# Verification check
$Verify = Get-Content $DockerComposeFile -Raw
if ($Verify -match $BackendUrl) {
    Write-Host "✅ INJECTION VERIFIED in file." -ForegroundColor Green
} else {
    Write-Host "❌ INJECTION FAILED. File does not contain the URL." -ForegroundColor Red
    exit 1
}

# 4. Clean Build & Start
Write-Host "4. Forcing clean rebuild of ALL services (Backend + Frontend)..." -ForegroundColor Yellow
docker compose -f $DockerComposeFile build --no-cache
docker compose -f $DockerComposeFile up -d

# 5. Frontend Tunnel
Write-Host "5. Starting Frontend Tunnel..." -ForegroundColor Yellow
$FrontendLogFile = "frontend_tunnel.log"
if (Test-Path $FrontendLogFile) { Remove-Item $FrontendLogFile }
Start-Process -FilePath $CloudflaredPath -ArgumentList "tunnel --url http://127.0.0.1:5173" -RedirectStandardOutput $FrontendLogFile -RedirectStandardError $FrontendLogFile -WindowStyle Hidden

$FrontendUrl = $null
for ($i = 0; $i -lt 15; $i++) {
    Write-Host "." -NoNewline
    Start-Sleep -Seconds 2
    if (Test-Path $FrontendLogFile) {
        $Log = Get-Content $FrontendLogFile -Raw
        if ($Log -match "https://[a-zA-Z0-9-]+\.trycloudflare\.com") {
            $FrontendUrl = $matches[0]
            break
        }
    }
}

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "🎯 DEPLOYMENT READY"
Write-Host "BACKEND : $BackendUrl"
Write-Host "FRONTEND: $FrontendUrl"
Write-Host "==========================================" -ForegroundColor Cyan
Read-Host "Press Enter to exit..."
