@echo off
REM Run this script to initialize the database with migrations and seeds

echo Installing dependencies...
npm install sequelize-cli sequelize pg pg-hstore

echo Running migrations...
npx sequelize-cli db:migrate --config ./backend/config/config.js --migrations-path ./backend/migrations

echo Running seeders...
npx sequelize-cli db:seed:all --config ./backend/config/config.js --seeders-path ./backend/seeders

echo Database initialization complete!
echo You should now be able to login with:
echo Email: admin@erp.com
echo Password: admin123
