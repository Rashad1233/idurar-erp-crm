# Run this script to initialize the database with migrations and seeds

Write-Host "Installing dependencies..." -ForegroundColor Green
npm install sequelize-cli sequelize pg pg-hstore

Write-Host "Running migrations..." -ForegroundColor Green
npx sequelize-cli db:migrate --config ./backend/config/database.js --migrations-path ./backend/migrations

Write-Host "Running seeders..." -ForegroundColor Green
npx sequelize-cli db:seed:all --config ./backend/config/database.js --seeders-path ./backend/seeders

Write-Host "Database initialization complete!" -ForegroundColor Green
Write-Host "You should now be able to login with:" -ForegroundColor Cyan
Write-Host "Email: admin@erp.com" -ForegroundColor Yellow
Write-Host "Password: admin123" -ForegroundColor Yellow
