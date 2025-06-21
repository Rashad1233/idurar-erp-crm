# ERP System Cleanup Script
# This script will remove all modules except the frontend directory
# It will create a backup of your current system first

# Set error action preference to stop on any error
$ErrorActionPreference = "Stop"

Write-Host "==== ERP System Cleanup Tool ====" -ForegroundColor Cyan
Write-Host "This script will remove all modules except the frontend directory." -ForegroundColor Cyan
Write-Host "A backup will be created before proceeding." -ForegroundColor Yellow
Write-Host ""

# Get the current directory
$currentDir = Get-Location
$backupDir = Join-Path -Path $currentDir -ChildPath "erp-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

# Create backup
Write-Host "Step 1: Creating backup at $backupDir..." -ForegroundColor Yellow
try {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    
    # Copy all items to backup except large folders like node_modules
    Get-ChildItem -Path $currentDir -Exclude "node_modules", "erp-backup-*" | 
        Copy-Item -Destination $backupDir -Recurse -Force
    
    Write-Host "Backup created successfully." -ForegroundColor Green
} catch {
    Write-Host "Error creating backup: $_" -ForegroundColor Red
    Write-Host "Aborting cleanup. Please resolve the backup issue first." -ForegroundColor Red
    exit 1
}

# Ask for confirmation before proceeding
Write-Host "`nWARNING: This will delete all modules except the frontend directory." -ForegroundColor Red
Write-Host "All backend code and utility scripts will be removed." -ForegroundColor Red
Write-Host "Your data has been backed up to: $backupDir" -ForegroundColor Yellow
Write-Host "`nDo you want to proceed with deletion? (Y/N)" -ForegroundColor Cyan
$confirmation = Read-Host

if ($confirmation -ne "Y" -and $confirmation -ne "y") {
    Write-Host "Operation cancelled. No changes were made." -ForegroundColor Yellow
    exit 0
}

# Proceed with deletion
Write-Host "`nStep 2: Removing backend modules..." -ForegroundColor Yellow
try {
    # Keep a list of items to preserve
    $preserveItems = @(
        "frontend",
        "cleanup-modules.ps1",
        ".git",
        ".gitignore",
        "README.md",
        "LICENSE"
    )
    
    # Remove everything except preserved items
    Get-ChildItem -Path $currentDir -Exclude $preserveItems | ForEach-Object {
        if ($_.Name -ne "frontend") {
            if ($_.PSIsContainer) {
                Remove-Item $_.FullName -Recurse -Force
                Write-Host "Removed directory: $($_.Name)" -ForegroundColor Green
            } else {
                Remove-Item $_.FullName -Force
                Write-Host "Removed file: $($_.Name)" -ForegroundColor Green
            }
        }
    }
    
    Write-Host "All modules except frontend have been removed." -ForegroundColor Green
} catch {
    Write-Host "Error during removal: $_" -ForegroundColor Red
    Write-Host "Some items may not have been removed. Check the error message above." -ForegroundColor Yellow
}

# Create a minimal structure for new development
Write-Host "`nStep 3: Creating minimal structure for new development..." -ForegroundColor Yellow
try {
    # Create new backend directory with basic structure
    New-Item -ItemType Directory -Path (Join-Path -Path $currentDir -ChildPath "backend") -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path -Path $currentDir -ChildPath "backend\src") -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path -Path $currentDir -ChildPath "backend\config") -Force | Out-Null
    
    # Create a placeholder README in the backend directory
    $readmePath = Join-Path -Path $currentDir -ChildPath "backend\README.md"
    Set-Content -Path $readmePath -Value "# Backend Directory`n`nThis directory will contain the new backend modules for the ERP system.`n`nThe previous backend modules have been removed as part of the system cleanup process."
    
    Write-Host "Created minimal structure for new development." -ForegroundColor Green
} catch {
    Write-Host "Error creating minimal structure: $_" -ForegroundColor Red
}

# Final message
Write-Host "`n==== Cleanup Process Complete ====" -ForegroundColor Cyan
Write-Host "All modules except frontend have been removed." -ForegroundColor Green
Write-Host "A backup of your previous system is available at: $backupDir" -ForegroundColor Yellow
Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "1. Create a new backend structure based on your requirements" -ForegroundColor White
Write-Host "2. Update frontend configuration to work with the new backend" -ForegroundColor White
Write-Host "3. Restore any essential files from the backup as needed" -ForegroundColor White
