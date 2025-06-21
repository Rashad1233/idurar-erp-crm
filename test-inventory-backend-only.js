// Test inventory creation with backend only (no frontend dependencies)
const path = require('path');
const models = require('./backend/models/sequelize/index');
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testInventoryCreationBackend() {
  console.log('🔄 Starting inventory creation test (backend only)...\n');

  try {
    // Test 1: Check if models load correctly
    console.log('✅ Test 1: Loading models...');
    console.log('Models loaded:', Object.keys(models));
    console.log('Inventory model table name:', models.Inventory?.tableName || 'not specified');
    
    // Test 2: Check database connection
    console.log('\n✅ Test 2: Testing database connection...');
    await models.sequelize.authenticate();
    console.log('Database connection successful');

    // Test 3: Check if Inventories table exists and has correct structure
    console.log('\n✅ Test 3: Checking Inventories table structure...');
    const [results] = await models.sequelize.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'Inventories' 
      ORDER BY ordinal_position;
    `);
    console.log('Inventories table columns:');
    results.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // Test 4: Try direct model creation (without API)
    console.log('\n✅ Test 4: Testing direct model creation...');
    
    // First, get an ItemMaster to use
    const itemMaster = await models.ItemMaster.findOne();
    if (!itemMaster) {
      console.log('❌ No ItemMaster found. Creating one...');
      // Create a sample ItemMaster
      const newItemMaster = await models.ItemMaster.create({
        itemNumber: 'TEST-001',
        description: 'Test Item for Inventory',
        unitOfMeasure: 'EA',
        category: 'Test Category',
        lastUpdatedById: '123e4567-e89b-12d3-a456-426614174000' // dummy UUID
      });
      console.log('✅ Created ItemMaster:', newItemMaster.id);    } else {
      console.log('✅ Found existing ItemMaster:', itemMaster.id);
    }

    // Get a real user for lastUpdatedById
    const user = await models.User.findOne();
    if (!user) {
      console.log('❌ No User found. Cannot create inventory without valid user.');
      return;
    }
    console.log('✅ Found user for lastUpdatedById:', user.id);

    // Try to create inventory
    const testInventory = {
      inventoryNumber: `INV-${Date.now()}`,
      physicalBalance: 100,
      unitPrice: 25.50,
      condition: 'A',
      itemMasterId: itemMaster?.id || newItemMaster?.id,
      itemId: itemMaster?.id || newItemMaster?.id, // For compatibility
      lastUpdatedById: user.id
    };

    console.log('Creating inventory with data:', testInventory);
    const inventory = await models.Inventory.create(testInventory);
    console.log('✅ Inventory created successfully:', inventory.id);

    // Test 5: Verify the inventory was saved correctly
    console.log('\n✅ Test 5: Verifying saved inventory...');
    const savedInventory = await models.Inventory.findByPk(inventory.id);
    console.log('Saved inventory details:');
    console.log(`  - ID: ${savedInventory.id}`);
    console.log(`  - Number: ${savedInventory.inventoryNumber}`);
    console.log(`  - Balance: ${savedInventory.physicalBalance}`);
    console.log(`  - Unit Price: ${savedInventory.unitPrice}`);
    console.log(`  - Line Price: ${savedInventory.linePrice}`);
    console.log(`  - Item Master ID: ${savedInventory.itemMasterId}`);
    console.log(`  - Item ID: ${savedInventory.itemId}`);

    console.log('\n🎉 All backend tests passed! Inventory creation is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.original) {
      console.error('Database error details:', error.original.message);
    }
    console.error('Full error:', error);
  } finally {
    await models.sequelize.close();
  }
}

testInventoryCreationBackend();
