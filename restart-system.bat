@echo off
echo Restarting ERP system to apply user display changes...

:: Kill any existing node processes
taskkill /f /im node.exe /t

:: Wait a moment
timeout /t 3 /nobreak > nul

:: Start the backend server
cd backend
start cmd /k "npm start"

:: Wait for backend to initialize
echo Waiting for backend to initialize...
timeout /t 5 /nobreak > nul

:: Start the frontend
cd ..\frontend
start cmd /k "npm start"

echo System restart initiated. Please allow a few moments for both services to start...
echo Then navigate to http://localhost:3000/purchase-requisition to see the updated displays.
