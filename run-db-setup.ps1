Write-Host "🔍 Checking existing database tables..." -ForegroundColor Cyan

# Set PostgreSQL password
$env:PGPASSWORD = "postgres"

# Check existing tables
Write-Host "📋 Checking existing tables..." -ForegroundColor Yellow
psql -U postgres -d erpdb -f check-tables.sql

Write-Host "`n🏗️ Creating missing tables..." -ForegroundColor Cyan
psql -U postgres -d erpdb -f create-missing-tables.sql

Write-Host "`n🔍 Verifying tables after creation..." -ForegroundColor Cyan
psql -U postgres -d erpdb -f check-tables.sql

Write-Host "`nDatabase setup complete!" -ForegroundColor Green
