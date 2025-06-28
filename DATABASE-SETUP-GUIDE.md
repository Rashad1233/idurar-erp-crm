# Database Setup Guide

This guide explains how to set up and test the database connection for the ERP system.

## Configuration Files

1. `db-config-template.js` - A template showing the required database configuration structure
2. `db-config.js` - The actual configuration file with your database credentials
3. `test-database-connection.js` - A script to verify the database connection

## Prerequisites

- PostgreSQL installed and running
- Node.js and npm installed
- PostgreSQL user credentials

## Setup Steps

1. Ensure PostgreSQL is running on your system
2. Install required Node.js package:
   ```bash
   npm install pg
   ```

3. The database configuration is set up with these parameters:
   - Host: localhost
   - Port: 5432
   - User: postgres
   - Database: erp_db
   - Password: [Your secure password]

## Testing the Connection

Run the test script to verify the database connection:
```bash
node test-database-connection.js
```

If successful, you'll see: "Database connection successful!"
If there's an error, check:
- PostgreSQL is running
- Credentials are correct
- Database exists
- Network/firewall settings

## Troubleshooting

If you encounter connection issues:
1. Verify PostgreSQL is running
2. Check if the database exists
3. Confirm the password is correct
4. Ensure the postgres service is accepting connections
5. Check firewall settings

## Security Note

The `db-config.js` file contains sensitive credentials. Ensure it is:
- Not committed to version control
- Properly secured with restricted file permissions
- Backed up safely
