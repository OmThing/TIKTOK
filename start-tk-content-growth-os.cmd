@echo off
setlocal
cd /d "%~dp0"

set "NODE_EXE=D:\node\node.exe"
set "NPM_CLI=D:\Marvis\Application\1.60.1000.21\marvisnode\node_modules\npm\bin\npm-cli.js"
set "APP_URL=http://localhost:5173/dashboard"
set "API_URL=http://localhost:8787/api/health"
set "PATH=D:\node;%PATH%"

title TK Content Growth OS Launcher

echo.
echo ==========================================
echo   TK Content Growth OS
echo   Local launcher
echo ==========================================
echo.

if not exist "%NODE_EXE%" (
  echo [ERROR] Node was not found: %NODE_EXE%
  pause
  exit /b 1
)

if not exist "%NPM_CLI%" (
  echo [ERROR] npm CLI was not found: %NPM_CLI%
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -Command "try { Invoke-WebRequest -UseBasicParsing -Uri '%API_URL%' -TimeoutSec 1 | Out-Null; exit 0 } catch { exit 1 }" >nul 2>nul
if "%ERRORLEVEL%"=="0" (
  echo Service is already running. Opening dashboard...
  start "" "%APP_URL%"
  exit /b 0
)

if not exist "node_modules" (
  echo Installing dependencies. This may take a few minutes...
  "%NODE_EXE%" "%NPM_CLI%" install --cache .npm-cache
  if errorlevel 1 (
    echo [ERROR] Dependency install failed.
    pause
    exit /b 1
  )
)

echo Preparing local SQLite database...
"%NODE_EXE%" "%NPM_CLI%" run db:push
if errorlevel 1 (
  echo [ERROR] Database setup failed.
  pause
  exit /b 1
)

echo Starting API server in the background...
start "TK Content API" /min cmd /c "set PATH=D:\node;%%PATH%%&& node_modules\.bin\tsx.cmd watch server/index.ts >> api-server.log 2>&1"

echo Starting web server in the background...
start "TK Content Web" /min cmd /c "set PATH=D:\node;%%PATH%%&& node_modules\.bin\vite.cmd --config vite.config.js --host 0.0.0.0 >> web-server.log 2>&1"

echo Waiting for dashboard...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$url='%APP_URL%'; for ($i=0; $i -lt 45; $i++) { try { Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 1 | Out-Null; Start-Process $url; exit 0 } catch { Start-Sleep -Seconds 1 } }; exit 1"
if errorlevel 1 (
  echo [ERROR] Dashboard did not become ready. Check api-server.log and web-server.log.
  pause
  exit /b 1
)

echo Done. You can close this window.
timeout /t 2 >nul
