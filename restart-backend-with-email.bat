@echo off
echo ===== Restarting Backend with Email Functionality =====
echo.
echo Stopping any existing backend processes...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq C:\WINDOWS\system32\cmd.exe*" 2>nul
timeout /t 2

echo.
echo Starting backend with email functionality...
cd backend
start "ERP Backend" npm start

echo.
echo Backend restarted! The email functionality is now active.
echo Check the new window for backend logs.
echo.
pause
