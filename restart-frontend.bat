@echo off
echo Restarting ERP frontend to apply table display changes...

:: Change to the frontend directory
cd frontend

:: Kill any existing npm processes for the frontend
taskkill /f /im node.exe /fi "WINDOWTITLE eq npm" /t

:: Wait a moment
timeout /t 2 /nobreak > nul

:: Start the frontend again
start cmd /k "npm start"

echo Frontend restart initiated. Please allow a few moments for the application to rebuild...
echo Once the frontend is running, go to http://localhost:3000/purchase-requisition to see the updated table view.
