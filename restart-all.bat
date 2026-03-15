@echo off
echo ========================================
echo Smart Campus Pathways - Restart All
echo ========================================
echo.

echo Step 1: Stopping all Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo.
echo Step 2: Starting MongoDB...
echo Please ensure MongoDB is running manually
echo Run: mongod
echo.
pause

echo.
echo Step 3: Starting Backend Server...
cd backend
start "Backend Server" cmd /k "npm start"
cd ..
timeout /t 3 >nul

echo.
echo Step 4: Starting Frontend...
start "Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo All services started!
echo ========================================
echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:8080
echo.
echo Admin Login: http://localhost:8080/admin-login
echo   Email: admin@college.edu
echo   Password: admin123
echo.
echo HR Login: http://localhost:8080/hr-login
echo   Email: hr@google.com
echo   Password: hr123
echo.
echo Student Login: http://localhost:8080/student-login
echo.
echo Press any key to exit...
pause >nul
