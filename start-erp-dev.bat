@echo off
echo Starting ERP development environment...

echo Starting backend...
start powershell.exe -NoExit -Command "cd ./backend && npm start"

echo Starting frontend...
start powershell.exe -NoExit -Command "cd ./frontend && npm start"

echo ERP development environment started successfully!
echo Backend: http://localhost:8888
echo Frontend: http://localhost:3000
