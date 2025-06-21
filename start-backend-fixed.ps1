#!/bin/bash
Write-Host "Starting ERP backend server with debugging..." -ForegroundColor Green

# Change to the backend directory
Set-Location -Path "$PSScriptRoot\backend"

Write-Host "Installing any missing dependencies..." -ForegroundColor Yellow
npm install express cors morgan helmet path dotenv bcrypt jsonwebtoken sequelize pg uuid

Write-Host "Restarting backend server..." -ForegroundColor Green
Write-Host ""
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "Starting backend server - Press Ctrl+C to stop" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

nodemon src/index.js
