@echo off
echo ========================================
echo   Placement Portal - Development Setup
echo ========================================
echo.

echo [1/3] Checking MySQL...
mysql -u root -e "SELECT 1" >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: MySQL is not running!
    echo Please start MySQL service and try again.
    pause
    exit /b 1
)
echo MySQL is running ✓
echo.

echo [2/3] Starting Backend Server...
start "Backend Server" cmd /k "cd backend && node server.js"
timeout /t 3 >nul
echo Backend server started on http://localhost:3001 ✓
echo.

echo [3/3] Starting Frontend Server...
start "Frontend Server" cmd /k "npm run dev"
timeout /t 3 >nul
echo Frontend server starting on http://localhost:8080 ✓
echo.

echo ========================================
echo   Servers are starting!
echo ========================================
echo.
echo Backend:  http://localhost:3001/api
echo Frontend: http://localhost:8080
echo.
echo Press any key to open browser...
pause >nul

start http://localhost:8080

echo.
echo To stop servers, close the terminal windows.
echo.
pause
