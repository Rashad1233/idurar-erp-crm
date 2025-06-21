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

async function checkAndCreateInventoryData() {
  try {
    // Connect to the database
    await sequelize.authenticate();
    console.log('✅ Connected to database successfully.');
    
    // Check for existing inventory items
    const [inventoryCount] = await sequelize.query(`SELECT COUNT(*) as count FROM "Inventories"`);
    console.log(`Found ${inventoryCount[0].count} existing inventory items.`);
    
    // If inventory items already exist, do nothing
    if (parseInt(inventoryCount[0].count) > 0) {
      console.log('Inventory items already exist in the database.');
      return;
    }
    
    // Check if we have item masters and storage locations to create inventory items
    const [itemMasters] = await sequelize.query(`SELECT id, "itemNumber" FROM "ItemMasters" LIMIT 10`);
    if (itemMasters.length === 0) {
      console.log('❌ No item masters found. Please create some items first.');
      return;
    }
    
    // Get storage locations
    const [storageLocations] = await sequelize.query(`SELECT id, name FROM "StorageLocations" LIMIT 5`);
    if (storageLocations.length === 0) {
      console.log('❌ No storage locations found. Creating a default one...');
      
      // Create a default storage location
      const [newLocation] = await sequelize.query(`
        INSERT INTO "StorageLocations" (
          id, name, description, status, "createdById", "createdAt", "updatedAt"
        ) VALUES (
          :id, :name, :description, :status, :createdById, :createdAt, :updatedAt
        ) RETURNING id
      `, {
        replacements: {
          id: uuidv4(),
          name: 'Main Warehouse',
          description: 'Main storage facility for all items',
          status: 'active',
          createdById: await getAdminUserId(),
          createdAt: now,
          updatedAt: now
        }
      });
      
      console.log('✅ Created default storage location:', newLocation[0].id);
      
      // Fetch the created location
      const [locations] = await sequelize.query(`SELECT id, name FROM "StorageLocations" LIMIT 5`);
      storageLocations.push(...locations);
    }
    
    // Get bin locations
    const [binLocations] = await sequelize.query(`SELECT id, code, "storageLocationId" FROM "BinLocations" LIMIT 10`);
    if (binLocations.length === 0) {
      console.log('❌ No bin locations found. Creating default ones...');
      
      // Create default bin locations for each storage location
      for (const location of storageLocations) {
        for (let i = 1; i <= 3; i++) {
          await sequelize.query(`
            INSERT INTO "BinLocations" (
              id, code, description, "storageLocationId", status, "createdById", "createdAt", "updatedAt"
            ) VALUES (
              :id, :code, :description, :storageLocationId, :status, :createdById, :createdAt, :updatedAt
            )
          `, {
            replacements: {
              id: uuidv4(),
              code: `${location.name.substring(0, 3)}-ROW${i}`,
              description: `Row ${i} in ${location.name}`,
              storageLocationId: location.id,
              status: 'active',
              createdById: await getAdminUserId(),
              createdAt: now,
              updatedAt: now
            }
          });
        }
      }
      
      console.log('✅ Created default bin locations');
      
      // Fetch the created bin locations
      const [bins] = await sequelize.query(`SELECT id, code, "storageLocationId" FROM "BinLocations" LIMIT 10`);
      binLocations.push(...bins);
    }
    
    // Create inventory items for each item master
    console.log('Creating inventory items...');
    
    for (const item of itemMasters) {
      // Choose a random storage location and bin location
      const storageLocation = storageLocations[Math.floor(Math.random() * storageLocations.length)];
      const matchingBins = binLocations.filter(bin => bin.storageLocationId === storageLocation.id);
      const binLocation = matchingBins.length > 0 ? 
        matchingBins[Math.floor(Math.random() * matchingBins.length)] : 
        null;
      
      // Randomize some inventory quantities
      const onHand = Math.floor(Math.random() * 100);
      const allocated = Math.floor(Math.random() * Math.min(onHand, 20));
      const available = onHand - allocated;
      const reorderPoint = Math.floor(Math.random() * 20) + 10;
      const maxStock = reorderPoint * 3;
      
      await sequelize.query(`
        INSERT INTO "Inventories" (
          id, "itemMasterId", "currentQuantity", "allocatedQuantity", "availableQuantity",
          "reorderPoint", "maximumQuantity", "storageLocationId", "binLocationId",
          "lastUpdatedById", "createdAt", "updatedAt"
        ) VALUES (
          :id, :itemMasterId, :currentQuantity, :allocatedQuantity, :availableQuantity,
          :reorderPoint, :maximumQuantity, :storageLocationId, :binLocationId,
          :lastUpdatedById, :createdAt, :updatedAt
        )
      `, {
        replacements: {
          id: uuidv4(),
          itemMasterId: item.id,
          currentQuantity: onHand,
          allocatedQuantity: allocated,
          availableQuantity: available,
          reorderPoint: reorderPoint,
          maximumQuantity: maxStock,
          storageLocationId: storageLocation.id,
          binLocationId: binLocation ? binLocation.id : null,
          lastUpdatedById: await getAdminUserId(),
          createdAt: now,
          updatedAt: now
        }
      });
      
      console.log(`✅ Created inventory for item: ${item.itemNumber}`);
    }
    
    // Check the result
    const [newInventoryCount] = await sequelize.query(`SELECT COUNT(*) as count FROM "Inventories"`);
    console.log(`✅ Created ${newInventoryCount[0].count} inventory items successfully.`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

// Helper function to get admin user ID
async function getAdminUserId() {
  const [users] = await sequelize.query(`SELECT id FROM "Users" WHERE role = 'admin' LIMIT 1`);
  return users.length > 0 ? users[0].id : null;
}

checkAndCreateInventoryData();
