@echo off
echo ========================================
echo   Smart Campus Pathways - Starting...
echo ========================================

echo Starting Backend Server...
start "Backend Server" cmd /k "cd /d "%~dp0backend" && node server.js"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd /d "%~dp0" && npm run dev"

timeout /t 5 /nobreak >nul

echo ========================================
echo   Project is starting!
echo   Open browser: http://localhost:8080
echo ========================================

start "" "http://localhost:8080"
