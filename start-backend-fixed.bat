@echo off
echo Starting ERP backend server with debugging...

cd /d "%~dp0backend"

echo Creating backup of current node_modules...
xcopy /E /I /Y node_modules node_modules_backup > NUL

echo Installing any missing dependencies...
call npm install express cors morgan helmet path dotenv bcrypt jsonwebtoken sequelize pg uuid

echo Restarting backend server...
echo.
echo =======================================================
echo Starting backend server - Press Ctrl+C to stop
echo =======================================================
echo.

nodemon src/index.js

echo Stopped backend server.
