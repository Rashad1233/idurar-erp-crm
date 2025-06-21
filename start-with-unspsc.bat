@echo off
echo Starting ERP development environment with UNSPSC setup...

echo Setting up UNSPSC tables...
node setup-unspsc-tables.js

echo Starting backend...
start powershell.exe -NoExit -Command "cd ./backend && npm start"

echo Waiting for backend to start...
timeout /t 10

echo Testing UNSPSC routes...
node test-unspsc-routes.js

echo Starting frontend...
start powershell.exe -NoExit -Command "cd ./frontend && npm start"

echo ERP development environment started successfully!
echo Backend: http://localhost:8888
echo Frontend: http://localhost:3000
echo UNSPSC Enhanced Search: http://localhost:3000/unspsc/enhanced-search
