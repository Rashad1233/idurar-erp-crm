# Filepath: c:\Users\rasha\Desktop\test erp\setup-unspsc-favorites.ps1
Write-Host "Setting up UNSPSC Favorites feature..." -ForegroundColor Green

# Navigate to backend directory
Set-Location -Path ".\backend"

# Run the migration script
Write-Host "Creating UserUnspscFavorite table..." -ForegroundColor Cyan
node scripts/create-user-unspsc-favorites.js

Write-Host "UNSPSC Favorites feature setup complete!" -ForegroundColor Green
Set-Location -Path ".."
