$env:PGPASSWORD="UHm8g167"
psql -U postgres -d erpdb -c "ALTER TABLE \`"Contracts\`" ADD COLUMN IF NOT EXISTS \`"approvalStatus\`" VARCHAR(32) DEFAULT 'pending';"
psql -U postgres -d erpdb -c "ALTER TABLE \`"Contracts\`" ADD COLUMN IF NOT EXISTS \`"approvalDate\`" TIMESTAMP;"
psql -U postgres -d erpdb -c "ALTER TABLE \`"Contracts\`" ADD COLUMN IF NOT EXISTS \`"approvedById\`" UUID;"
Write-Host "Migration completed successfully!"
