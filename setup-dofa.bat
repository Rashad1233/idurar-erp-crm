@echo off
echo Setting up DoFA functionality for the ERP system...

:: First, execute the database setup script
echo Setting up DoFA database table...
node setup-dofa-table.js

:: Wait a moment
timeout /t 3 /nobreak > nul

:: Kill any existing node processes
echo Restarting server components...
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
echo Then navigate to http://localhost:3000/item-master/review and click on the "Delegation of Authority (DoFA)" tab.
