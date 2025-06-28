@echo off
echo Restarting ERP server to apply user display changes...

:: Kill any existing node processes for the server
taskkill /f /im node.exe /t

:: Wait a moment
timeout /t 2 /nobreak > nul

:: Start the server again (adjust path as needed)
cd backend
start cmd /k "npm start"

echo Server restart initiated. Please allow a few moments for the server to start...
echo Then refresh the Purchase Requisition page to see the updated user display.
