# Setup OpenAI API key in the environment
param(
    [Parameter(Mandatory=$true)]
    [string]$apiKey
)

# Check if the API key looks valid (basic check)
if ($apiKey.Length -lt 20) {
    Write-Host "Error: The provided API key seems too short. OpenAI API keys are typically longer." -ForegroundColor Red
    exit 1
}

# Path to the .env file
$envFilePath = "backend\.env"

# Check if .env file exists
if (-not (Test-Path $envFilePath)) {
    Write-Host "Error: .env file not found at $envFilePath" -ForegroundColor Red
    exit 1
}

# Read the current .env file
$envContent = Get-Content $envFilePath -Raw

# Check if OPENAI_API_KEY already exists in the file
if ($envContent -match "OPENAI_API_KEY=") {
    # Replace the existing key
    $newContent = $envContent -replace "OPENAI_API_KEY=.*", "OPENAI_API_KEY=$apiKey"
} else {
    # Add the key after NODE_ENV line
    $newContent = $envContent -replace "(NODE_ENV=.*)", "`$1`n`n# OpenAI`nOPENAI_API_KEY=$apiKey"
}

# Write the updated content back to the file
$newContent | Set-Content $envFilePath

Write-Host "✅ OpenAI API key has been set successfully in $envFilePath" -ForegroundColor Green
Write-Host "🚀 You can now run the server with 'cd backend && npm start' or 'cd backend && npm run dev'" -ForegroundColor Cyan
