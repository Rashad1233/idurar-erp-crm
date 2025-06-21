@echo off
SETLOCAL

REM Check if an API key was provided
IF "%~1"=="" (
    echo.
    echo ⚠️ No OpenAI API key provided. The system will run in demo mode with mock data.
    echo To use real OpenAI services, run: setup-openai-integration.bat YOUR_API_KEY
    echo.
    SET USE_DEMO_MODE=true
) ELSE (
    echo.
    echo ✅ Setting up OpenAI API key...
    call setup-openai-key.bat %1
    SET USE_DEMO_MODE=false
)

echo.
echo 📦 Installing OpenAI package for UNSPSC enhancements...
cd backend
call npm install openai@4.28.0 --save

echo.
echo 🗄️ Setting up UNSPSC tables...
cd ..
node setup-unspsc-tables.js

echo.
IF "%USE_DEMO_MODE%"=="true" (
    echo ℹ️ Running in DEMO MODE with mock data (no real AI calls will be made).
) ELSE (
    echo 🔍 Testing OpenAI connection...
    node test-openai-connection.js
    IF ERRORLEVEL 1 (
        echo.
        echo ❌ OpenAI connection test failed.
        echo You can still run the system in demo mode.
        echo.
        SET USE_DEMO_MODE=true
    ) ELSE (
        echo.
        echo ✅ OpenAI connection test successful!
    )
)

echo.
echo 🚀 Starting backend with OpenAI integration...
start powershell.exe -NoExit -Command "cd ./backend && npm start"

echo.
echo ⏳ Waiting for backend to start...
timeout /t 10

echo.
echo 🚀 Starting frontend...
start powershell.exe -NoExit -Command "cd ./frontend && npm start"

echo.
echo ✅ ERP development environment started successfully!
echo 🔗 Backend: http://localhost:8888
echo 🔗 Frontend: http://localhost:3000
echo 🔗 UNSPSC Enhanced Search: http://localhost:3000/unspsc/enhanced-search
echo.
IF "%USE_DEMO_MODE%"=="true" (
    echo ℹ️ Running in DEMO MODE with mock data.
    echo To use real OpenAI services, restart and run: setup-openai-integration.bat YOUR_API_KEY
)

ENDLOCAL
