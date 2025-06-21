const { Sequelize } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

// Configure database connection
const sequelize = new Sequelize({
  host: 'localhost',
  database: 'erpdb',
  username: 'postgres',
  password: 'UHm8g167',
  dialect: 'postgres',
  logging: false
});

// Get the current date and time
const now = new Date();

// Sample supplier data
const sampleSuppliers = [
  {
    id: uuidv4(),
    supplierNumber: 'SUP-20250614-0001',
    legalName: 'Tech Components Inc.',
    tradeName: 'TechComp',
    contactEmail: 'sales@techcomp.example.com',
    contactEmailSecondary: 'support@techcomp.example.com',
    contactPhone: '+1-555-123-4567',
    contactName: 'John Smith',
    complianceChecked: true,
    supplierType: 'strategic',
    paymentTerms: 'Net 30',
    address: '123 Tech Ave',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    postalCode: '94105',
    taxId: '12-3456789',
    registrationNumber: 'REG123456',
    status: 'active',
    notes: 'Preferred supplier for electronic components',
    createdById: null, // We'll update this after checking for users
    updatedById: null,
    createdAt: now,
    updatedAt: now,
    created_at: now,
    updated_at: now
  },
  {
    id: uuidv4(),
    supplierNumber: 'SUP-20250614-0002',
    legalName: 'Global Industrial Supply Ltd.',
    tradeName: 'GIS',
    contactEmail: 'orders@gis.example.com',
    contactEmailSecondary: null,
    contactPhone: '+1-555-987-6543',
    contactName: 'Sarah Johnson',
    complianceChecked: true,
    supplierType: 'transactional',
    paymentTerms: 'Net 45',
    address: '789 Industrial Blvd',
    city: 'Chicago',
    state: 'IL',
    country: 'USA',
    postalCode: '60607',
    taxId: '98-7654321',
    registrationNumber: 'REG789012',
    status: 'active',
    notes: 'Global supplier for industrial equipment',
    createdById: null,
    updatedById: null,
    createdAt: now,
    updatedAt: now,
    created_at: now,
    updated_at: now
  },
  {
    id: uuidv4(),
    supplierNumber: 'SUP-20250614-0003',
    legalName: 'Office Solutions Co.',
    tradeName: 'OfficeS',
    contactEmail: 'contact@offices.example.com',
    contactEmailSecondary: null,
    contactPhone: '+1-555-456-7890',
    contactName: 'Michael Brown',
    complianceChecked: true,
    supplierType: 'preferred',
    paymentTerms: 'Net 15',
    address: '456 Office Park',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    postalCode: '10001',
    taxId: '45-6789012',
    registrationNumber: 'REG456789',
    status: 'active',
    notes: 'Office supplies and equipment provider',
    createdById: null,
    updatedById: null,
    createdAt: now,
    updatedAt: now,
    created_at: now,
    updated_at: now
  }
];

// Function to add sample suppliers
async function addSampleSuppliers() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Connected to database successfully.');
    
    // Check if there are any existing suppliers
    const [existingSuppliers] = await sequelize.query(`
      SELECT COUNT(*) FROM "Suppliers"
    `);
    
    const supplierCount = parseInt(existingSuppliers[0].count);
    console.log(`Found ${supplierCount} existing suppliers.`);
    
    if (supplierCount > 0) {
      console.log('Suppliers already exist, skipping sample data creation.');
      return;
    }
    
    // Get an admin user to use as createdById
    const [users] = await sequelize.query(`
      SELECT id FROM "Users" WHERE role = 'admin' LIMIT 1
    `);
    
    let adminUserId = null;
    if (users.length > 0) {
      adminUserId = users[0].id;
      console.log(`Using admin user ID: ${adminUserId}`);
    } else {
      console.log('No admin user found, will insert suppliers without user references.');
    }
    
    // Update user IDs in sample data
    sampleSuppliers.forEach(supplier => {
      supplier.createdById = adminUserId;
      supplier.updatedById = adminUserId;
    });
    
    // Insert sample suppliers
    console.log('Adding sample suppliers...');
    
    for (const supplier of sampleSuppliers) {
      // Insert using parameterized query to avoid SQL injection
      await sequelize.query(`
        INSERT INTO "Suppliers" (
          id, "supplierNumber", "legalName", "tradeName", "contactEmail", 
          "contactEmailSecondary", "contactPhone", "contactName", "complianceChecked", 
          "supplierType", "paymentTerms", address, city, state, country, 
          "postalCode", "taxId", "registrationNumber", status, notes, 
          "createdById", "updatedById", "createdAt", "updatedAt", created_at, updated_at
        ) VALUES (
          :id, :supplierNumber, :legalName, :tradeName, :contactEmail,
          :contactEmailSecondary, :contactPhone, :contactName, :complianceChecked,
          :supplierType, :paymentTerms, :address, :city, :state, :country,
          :postalCode, :taxId, :registrationNumber, :status, :notes,
          :createdById, :updatedById, :createdAt, :updatedAt, :created_at, :updated_at
        )
      `, {
        replacements: supplier,
        type: sequelize.QueryTypes.INSERT
      });
      
      console.log(`✅ Added supplier: ${supplier.legalName}`);
    }
    
    // Verify data was inserted
    const [newSupplierCount] = await sequelize.query(`
      SELECT COUNT(*) FROM "Suppliers"
    `);
    
    console.log(`Now have ${newSupplierCount[0].count} suppliers in the database.`);
    
    // Show sample of inserted data
    const [sampleData] = await sequelize.query(`
      SELECT id, "supplierNumber", "legalName", "contactName", "contactEmail", status 
      FROM "Suppliers" LIMIT 3
    `);
    
    console.log('\nSample of inserted suppliers:');
    console.table(sampleData);
    
    await sequelize.close();
    console.log('\n✅ Sample suppliers added successfully.');
    
  } catch (error) {
    console.error('❌ Error adding sample suppliers:', error);
    
    try {
      await sequelize.close();
    } catch (err) {
      // Ignore error on close
    }
  }
}

// Run the function
addSampleSuppliers();
