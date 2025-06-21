const { Sequelize, DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

// Configure database connection
const sequelize = new Sequelize({
  host: 'localhost',
  database: 'erpdb',
  username: 'postgres',
  password: 'UHm8g167',
  dialect: 'postgres',
  logging: true
});

// Define the Supplier model to match the database
const Supplier = sequelize.define('Supplier', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  supplierNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  legalName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tradeName: {
    type: DataTypes.STRING
  },
  contactEmail: {
    type: DataTypes.STRING
  },
  contactEmailSecondary: {
    type: DataTypes.STRING
  },
  contactPhone: {
    type: DataTypes.STRING
  },
  contactName: {
    type: DataTypes.STRING
  },
  complianceChecked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  supplierType: {
    type: DataTypes.STRING,
    defaultValue: 'general'
  },
  paymentTerms: {
    type: DataTypes.STRING
  },
  address: {
    type: DataTypes.TEXT
  },
  city: {
    type: DataTypes.STRING
  },
  state: {
    type: DataTypes.STRING
  },
  country: {
    type: DataTypes.STRING
  },
  postalCode: {
    type: DataTypes.STRING
  },
  taxId: {
    type: DataTypes.STRING
  },
  registrationNumber: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active'
  },
  notes: {
    type: DataTypes.TEXT
  },
  createdById: {
    type: DataTypes.UUID
  },
  updatedById: {
    type: DataTypes.UUID
  },
  createdAt: {
    type: DataTypes.DATE
  },
  updatedAt: {
    type: DataTypes.DATE
  },
  created_at: {
    type: DataTypes.DATE
  },
  updated_at: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'Suppliers',
  timestamps: true
});

// Define the User model to get admin user
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING
  },
  email: {
    type: DataTypes.STRING
  },
  role: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'Users',
  timestamps: true
});

async function addSampleSuppliers() {
  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('✅ Connected to database successfully.');

    // Check if there are already suppliers
    const existingSuppliers = await Supplier.findAll();
    console.log(`Found ${existingSuppliers.length} existing suppliers.`);

    if (existingSuppliers.length > 0) {
      console.log('Sample suppliers already exist. Skipping creation.');
      return;
    }

    // Get admin user ID
    const admin = await User.findOne({ where: { role: 'admin' } });
    if (!admin) {
      console.error('❌ No admin user found. Please create an admin user first.');
      return;
    }

    console.log(`Using admin user ID: ${admin.id}`);
    console.log('Adding sample suppliers...');

    // Create sample suppliers
    const suppliers = [
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
        supplierType: 'general',
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
        createdById: admin.id,
        updatedById: admin.id
      },
      {
        id: uuidv4(),
        supplierNumber: 'SUP-20250614-0002',
        legalName: 'Global Software Solutions',
        tradeName: 'GSS',
        contactEmail: 'info@gss.example.com',
        contactPhone: '+1-555-987-6543',
        contactName: 'Jane Doe',
        complianceChecked: true,
        supplierType: 'general',
        paymentTerms: 'Net 45',
        address: '456 Software Blvd',
        city: 'Boston',
        state: 'MA',
        country: 'USA',
        postalCode: '02110',
        taxId: '98-7654321',
        registrationNumber: 'REG654321',
        status: 'active',
        notes: 'Software and IT services provider',
        createdById: admin.id,
        updatedById: admin.id
      },
      {
        id: uuidv4(),
        supplierNumber: 'SUP-20250614-0003',
        legalName: 'European Machinery Ltd',
        tradeName: 'EuroMach',
        contactEmail: 'contact@euromach.example.com',
        contactPhone: '+44-20-1234-5678',
        contactName: 'Hans Mueller',
        complianceChecked: true,
        supplierType: 'general',
        paymentTerms: 'Net 60',
        address: '42 Industrial Road',
        city: 'London',
        state: 'England',
        country: 'UK',
        postalCode: 'EC1A 1BB',
        taxId: 'GB123456789',
        registrationNumber: 'UK87654321',
        status: 'active',
        notes: 'Industrial machinery supplier',
        createdById: admin.id,
        updatedById: admin.id
      }
    ];

    // Add created_at and updated_at fields
    const now = new Date();
    suppliers.forEach(supplier => {
      supplier.createdAt = now;
      supplier.updatedAt = now;
      supplier.created_at = now;
      supplier.updated_at = now;
    });

    // Insert suppliers
    for (const supplier of suppliers) {
      await Supplier.create(supplier);
      console.log(`✅ Added supplier: ${supplier.legalName}`);
    }

    console.log(`✅ Successfully added ${suppliers.length} sample suppliers to the database.`);
  } catch (error) {
    console.error('❌ Error adding sample suppliers:', error);
  } finally {
    // Close the connection
    await sequelize.close();
    console.log('✅ Database connection closed.');
  }
}

// Run the function
addSampleSuppliers();
