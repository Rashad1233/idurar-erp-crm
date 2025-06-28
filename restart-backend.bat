@echo off
echo Restarting backend server...

REM Change to the backend directory
cd /d c:\Users\rasha\Desktop\test erp\backend

REM Kill existing node processes (optional, may need admin rights)
REM taskkill /f /im node.exe

REM Install dependencies if needed
echo Installing dependencies...
npm install

REM Start the server
echo Starting server...
npm start

echo Server restarted successfully!
