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

// Sample item data
const sampleItems = [
  {
    id: uuidv4(),
    itemNumber: 'IT000001',
    description: 'Desktop Computer - Core i7, 16GB RAM, 512GB SSD',
    uom: 'Each',
    category: 'IT Equipment',
    subcategory: 'Computers',
    specifications: 'Dell OptiPlex 7090, Intel Core i7 11th Gen, 16GB DDR4, 512GB NVMe SSD, Windows 11 Pro',
    minimumOrderQuantity: 1,
    reorderPoint: 5,
    unspsc: '43211507',
    manufacturer: 'Dell',
    manufacturerPartNumber: 'OPX7090-i7',
    barcode: '5901234123457',
    status: 'active',
    createdById: null, // Will be updated with admin user ID
    updatedById: null,
    createdAt: now,
    updatedAt: now,
    created_at: now,
    updated_at: now
  },
  {
    id: uuidv4(),
    itemNumber: 'IT000002',
    description: 'Laptop - Core i5, 8GB RAM, 256GB SSD',
    uom: 'Each',
    category: 'IT Equipment',
    subcategory: 'Laptops',
    specifications: 'HP EliteBook 840 G8, Intel Core i5 11th Gen, 8GB DDR4, 256GB NVMe SSD, Windows 11 Pro',
    minimumOrderQuantity: 1,
    reorderPoint: 3,
    unspsc: '43211503',
    manufacturer: 'HP',
    manufacturerPartNumber: 'EB840G8-i5',
    barcode: '5901234123458',
    status: 'active',
    createdById: null,
    updatedById: null,
    createdAt: now,
    updatedAt: now,
    created_at: now,
    updated_at: now
  },
  {
    id: uuidv4(),
    itemNumber: 'OF000001',
    description: 'Office Desk - 160x80cm',
    uom: 'Each',
    category: 'Furniture',
    subcategory: 'Desks',
    specifications: 'Height adjustable office desk, 160x80cm tabletop, steel frame',
    minimumOrderQuantity: 1,
    reorderPoint: 2,
    unspsc: '56101501',
    manufacturer: 'IKEA',
    manufacturerPartNumber: 'BEKANT-001',
    barcode: '5901234123459',
    status: 'active',
    createdById: null,
    updatedById: null,
    createdAt: now,
    updatedAt: now,
    created_at: now,
    updated_at: now
  }
];

async function addSampleItems() {
  try {
    // Connect to the database
    await sequelize.authenticate();
    console.log('✅ Connected to database successfully.');
    
    // Check if there are existing items
    const [itemCount] = await sequelize.query(`SELECT COUNT(*) as count FROM "ItemMasters"`);
    console.log(`Found ${itemCount[0].count} existing items.`);
    
    // If there are already items, don't add more
    if (parseInt(itemCount[0].count) > 0) {
      console.log('Items already exist in the database. Skipping sample item creation.');
      return;
    }
    
    // Get an admin user to use as creator
    const [users] = await sequelize.query(`SELECT id FROM "Users" WHERE role = 'admin' LIMIT 1`);
    if (users.length === 0) {
      console.error('❌ No admin users found in the database.');
      return;
    }
    
    const adminUserId = users[0].id;
    console.log(`Using admin user ID: ${adminUserId}`);
    
    // Set the admin user as creator for all sample items
    sampleItems.forEach(item => {
      item.createdById = adminUserId;
      item.updatedById = adminUserId;
    });
    
    console.log('Adding sample items...');
    
    // Insert each item
    for (const item of sampleItems) {
      await sequelize.query(`
        INSERT INTO "ItemMasters" (
          "id", "itemNumber", "description", "uom", "category", "subcategory",
          "specifications", "minimumOrderQuantity", "reorderPoint", "unspsc",
          "manufacturer", "manufacturerPartNumber", "barcode", "status",
          "createdById", "updatedById", "createdAt", "updatedAt"
        ) VALUES (
          :id, :itemNumber, :description, :uom, :category, :subcategory,
          :specifications, :minimumOrderQuantity, :reorderPoint, :unspsc,
          :manufacturer, :manufacturerPartNumber, :barcode, :status,
          :createdById, :updatedById, :createdAt, :updatedAt
        )
      `, {
        replacements: item
      });
      
      console.log(`✅ Added item: ${item.description}`);
    }
    
    // Check the count again
    const [newItemCount] = await sequelize.query(`SELECT COUNT(*) as count FROM "ItemMasters"`);
    console.log(`Now have ${newItemCount[0].count} items in the database.`);
    
    // Show a sample of what was inserted
    const [insertedItems] = await sequelize.query(`SELECT "id", "itemNumber", "description", "category", "manufacturer" FROM "ItemMasters" LIMIT 5`);
    console.log('Sample of inserted items:');
    console.table(insertedItems);
    
    console.log('✅ Sample items added successfully.');
    
  } catch (error) {
    console.error('❌ Error adding sample items:', error);
  } finally {
    await sequelize.close();
  }
}

addSampleItems();
