const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Database connection
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || 'postgres',
    logging: false,
  }
);

// Function to test the database connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
}

// Function to get the table structure
async function getTableStructure() {
  try {
    // This query works for PostgreSQL to get column information
    const tableInfo = await sequelize.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM 
        information_schema.columns
      WHERE 
        table_name = 'ItemMasters'
      ORDER BY 
        ordinal_position
    `, { type: Sequelize.QueryTypes.SELECT });
    
    console.log('Table structure for ItemMasters:');
    console.table(tableInfo);
    return tableInfo;
  } catch (error) {
    console.error('Error getting table structure:', error);
    return null;
  }
}

// Direct SQL insertion function to bypass ORM complexity
async function insertItemMaster(itemData) {
  try {
    // Get column names from the database
    const tableColumns = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'ItemMasters'
    `, { type: Sequelize.QueryTypes.SELECT });
    
    const columnNames = tableColumns.map(col => col.column_name);
    console.log('Available columns:', columnNames);
    
    // Filter item data to only include valid columns
    const validData = {};
    for (const key in itemData) {
      if (columnNames.includes(key)) {
        validData[key] = itemData[key];
      }
    }
    
    // Add default values for createdAt and updatedAt if they exist in the table
    if (columnNames.includes('createdAt')) {
      validData.createdAt = new Date();
    }
    if (columnNames.includes('updatedAt')) {
      validData.updatedAt = new Date();
    }
    
    // Generate SQL query dynamically based on available columns
    const fields = Object.keys(validData);
    const values = fields.map(field => `:${field}`);
    
    const query = `
      INSERT INTO "ItemMasters" (${fields.map(f => `"${f}"`).join(', ')})
      VALUES (${values.join(', ')})
      RETURNING *
    `;
    
    console.log('Executing query:', query);
    console.log('With values:', validData);
    
    const result = await sequelize.query(query, {
      replacements: validData,
      type: Sequelize.QueryTypes.INSERT
    });
    
    console.log('Item successfully created:', result[0][0]);
    return result[0][0];
  } catch (error) {
    console.error('Error inserting item:', error.message);
    throw error;
  }
}

// Setup Express server to handle direct item creation
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Route to get table structure
app.get('/api/simple-inventory/schema', async (req, res) => {
  try {
    const schema = await getTableStructure();
    res.status(200).json({
      success: true,
      data: schema
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Route to handle direct item creation
app.post('/api/simple-inventory/create', async (req, res) => {
  try {
    console.log('Received item creation request:', req.body);
    const newItem = await insertItemMaster(req.body);
    res.status(201).json({
      success: true,
      data: newItem,
      message: 'Item created successfully'
    });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create item'
    });
  }
});

// Route to get all items
app.get('/api/simple-inventory/items', async (req, res) => {
  try {
    const items = await sequelize.query(
      'SELECT * FROM "ItemMasters" ORDER BY "createdAt" DESC LIMIT 100',
      { type: Sequelize.QueryTypes.SELECT }
    );
    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to fetch items'
    });
  }
});

// Start the server
const PORT = process.env.SIMPLE_INVENTORY_PORT || 5555;

async function startServer() {
  const isConnected = await testConnection();
  if (isConnected) {
    // Get table structure on startup
    await getTableStructure();
    
    app.listen(PORT, () => {
      console.log(`Simple Inventory API running on port ${PORT}`);
      console.log(`- Schema endpoint: http://localhost:${PORT}/api/simple-inventory/schema`);
      console.log(`- Create item endpoint: http://localhost:${PORT}/api/simple-inventory/create (POST)`);
      console.log(`- List items endpoint: http://localhost:${PORT}/api/simple-inventory/items`);
    });
  } else {
    console.error('Cannot start server without database connection');
    process.exit(1);
  }
}

startServer();
