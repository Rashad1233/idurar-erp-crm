# Database Setup Summary

## Overview
Successfully set up PostgreSQL database for the ERP system with all necessary tables and sample data.

## Database Configuration
- **Database Name:** mimiapp
- **Host:** localhost
- **Port:** 5432
- **User:** postgres
- **Password:** UHm8g167

## Tables Created

### 1. Users Table
- Stores user information for authentication and authorization
- Fields: id, name, email, password, role, status, created_at, updated_at

### 2. Suppliers Table
- Manages supplier information
- Fields: id, name, email, phone, address, contact_person, status, created_at, updated_at

### 3. Contracts Table
- Stores contract agreements with suppliers
- Fields: id, contract_number, supplier_id, title, description, start_date, end_date, total_value, status, created_at, updated_at

### 4. Contract Items Table
- Details of items/services in each contract
- Fields: id, contract_id, item_code, item_description, unit_price, quantity, total_price, created_at, updated_at

### 5. Purchase Requisitions Table
- Tracks purchase requests
- Fields: id, pr_number, requester_id, department, request_date, required_date, status, total_amount, contract_id, created_at, updated_at

### 6. Purchase Requisition Items Table
- Line items for each purchase requisition
- Fields: id, pr_id, item_code, item_description, quantity, unit_price, total_price, created_at, updated_at

## Sample Data Created

### Admin User
- **Email:** admin@example.com
- **Password:** admin123
- **Role:** admin
- **ID:** 1

### Suppliers (3)
1. **ABC Office Supplies Ltd**
   - Contact: John Smith
   - Email: contact@abcoffice.com
   - Status: Active

2. **Tech Solutions Inc**
   - Contact: Sarah Johnson
   - Email: sales@techsolutions.com
   - Status: Active

3. **Global Furniture Co**
   - Contact: Michael Brown
   - Email: info@globalfurniture.com
   - Status: Active

### Contracts (3)
1. **CTR-2024-001** - Office Supplies Annual Contract
   - Supplier: ABC Office Supplies Ltd
   - Value: $50,000
   - Status: Active
   - Items: A4 Paper, Ballpoint Pens

2. **CTR-2024-002** - IT Equipment and Services
   - Supplier: Tech Solutions Inc
   - Value: $150,000
   - Status: Active
   - Items: Laptops, Office 365 Licenses

3. **CTR-2024-003** - Office Furniture Supply
   - Supplier: Global Furniture Co
   - Value: $75,000
   - Status: Pending Approval
   - Items: Executive Desks, Ergonomic Chairs

### Purchase Requisition (1)
- **PR-2024-001**
  - Department: IT Department
  - Linked to Contract: CTR-2024-002
  - Total: $2,400
  - Items: 2 x Dell Latitude 5520 Laptops

## Next Steps

1. **Start the Backend Server:**
   ```bash
   cd backend
   npm start
   ```

2. **Start the Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the Application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8888

4. **Login Credentials:**
   - Email: admin@example.com
   - Password: admin123

## Key Features Available

1. **Supplier Management**
   - View, create, edit suppliers
   - Track supplier status

2. **Contract Management**
   - Create and manage contracts
   - Link contracts to suppliers
   - Track contract items and pricing

3. **Purchase Requisitions**
   - Create purchase requests
   - Link to existing contracts
   - Auto-populate pricing from contracts

4. **Approval Workflows**
   - Contracts pending approval
   - Purchase requisition approvals

## Database Maintenance

### Backup Database:
```bash
pg_dump -U postgres -d mimiapp > backup.sql
```

### Restore Database:
```bash
psql -U postgres -d mimiapp < backup.sql
```

### Reset Database:
```bash
# Drop and recreate
psql -U postgres -c "DROP DATABASE IF EXISTS mimiapp;"
psql -U postgres -c "CREATE DATABASE mimiapp;"

# Run setup scripts
cd backend
node setup-database-tables.js
node check-and-create-admin-user.js
node add-sample-data.js
```

## Troubleshooting

1. **Connection Issues:**
   - Ensure PostgreSQL is running
   - Check credentials in backend/config/postgresql.js
   - Verify port 5432 is not blocked

2. **Permission Issues:**
   - Grant necessary permissions to postgres user
   - Check database ownership

3. **Data Issues:**
   - Use provided reset commands to start fresh
   - Check foreign key constraints when deleting data

## Additional Resources

- PostgreSQL Documentation: https://www.postgresql.org/docs/
- Sequelize ORM: https://sequelize.org/
- Project Repository: [Your Repository URL]

---

**Setup Completed:** January 2025
**Database Version:** PostgreSQL 14+
**Application Stack:** Node.js + React + PostgreSQL
