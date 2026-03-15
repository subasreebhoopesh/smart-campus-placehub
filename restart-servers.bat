@echo off
echo ========================================
echo  Smart Campus Pathways - Restart Servers
echo ========================================
echo.

echo Stopping all Node.js processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Starting MongoDB (if not running)...
net start MongoDB 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && node server.js"
timeout /t 3 /nobreak >nul

echo.
echo Starting Frontend Server...
start "Frontend Server" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo  Servers Started!
echo ========================================
echo.
echo Backend:  http://localhost:3001/api
echo Frontend: http://localhost:8080
echo.
echo Press any key to close this window...
pause >nul
