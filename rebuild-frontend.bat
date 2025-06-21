@echo off
echo Rebuilding frontend with inventory fixes...

cd frontend
echo Running npm install...
call npm install

echo Building frontend...
call npm run build

echo Frontend rebuild complete!
echo.
echo Please restart your frontend development server with:
echo cd frontend
echo npm start
echo.
echo Then test the inventory page in the browser.

pause
