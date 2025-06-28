$env:PGPASSWORD="UHm8g167"
psql -U postgres -d erpdb -c "ALTER TYPE \`"enum_Contracts_status\`" ADD VALUE 'pending_approval';"
psql -U postgres -d erpdb -c "ALTER TYPE \`"enum_Contracts_status\`" ADD VALUE 'rejected';"
Write-Host "Status enum updated successfully!"
