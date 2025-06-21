@echo off
SETLOCAL

REM Check if an API key was provided
IF "%~1"=="" (
    echo Error: Please provide an OpenAI API key as a parameter.
    echo Usage: setup-openai-key.bat YOUR_API_KEY
    exit /b 1
)

SET API_KEY=%~1

REM Execute the PowerShell script with the provided API key
powershell -ExecutionPolicy Bypass -File setup-openai-key.ps1 -apiKey "%API_KEY%"

ENDLOCAL
