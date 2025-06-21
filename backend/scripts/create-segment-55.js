require('dotenv').config();
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

// Create a new PostgreSQL client
const pool = new Pool({
  database: process.env.POSTGRES_DB || 'erpdb',
  user: process.env.POSTGRES_USER || 'postgres',
  password: String(process.env.POSTGRES_PASSWORD || 'UHm8g167'),
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT) || 5432,
});

async function checkAndCreateSegment55() {
  const client = await pool.connect();
  
  try {
    console.log('Checking and creating segment 55 and its hierarchy...');
    
    // Check if segment 55 exists
    const segmentResult = await client.query(
      'SELECT * FROM "UnspscCodes" WHERE code = $1 AND level = $2',
      ['55000000', 'SEGMENT']
    );
    
    if (segmentResult.rows.length === 0) {
      console.log('Segment 55 not found in database, creating it...');
      
      // Insert segment 55
      await client.query(
        'INSERT INTO "UnspscCodes" (code, segment, family, class, commodity, title, definition, level, "isActive", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
        ['55000000', '55', '00', '00', '00', 'Published Products', 'Segment for published products including printed, electronic, and other media', 'SEGMENT', true, new Date(), new Date()]
      );
      
      console.log('Created segment 55');
    } else {
      console.log('Segment 55 already exists:', segmentResult.rows[0]);
    }
    
    // Check if family 5510 exists
    const familyResult = await client.query(
      'SELECT * FROM "UnspscCodes" WHERE code = $1 AND level = $2',
      ['55100000', 'FAMILY']
    );
    
    if (familyResult.rows.length === 0) {
      console.log('Family 5510 not found in database, creating it...');
      
      // Insert family 5510
      await client.query(
        'INSERT INTO "UnspscCodes" (code, segment, family, class, commodity, title, definition, level, "isActive", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
        ['55100000', '55', '10', '00', '00', 'Printed Media', 'Printed books, brochures, and other published media', 'FAMILY', true, new Date(), new Date()]
      );
      
      console.log('Created family 5510');
    } else {
      console.log('Family 5510 already exists:', familyResult.rows[0].title);
    }
    
    // Check if class 551015 exists
    const classResult = await client.query(
      'SELECT * FROM "UnspscCodes" WHERE code = $1 AND level = $2',
      ['55101500', 'CLASS']
    );
    
    if (classResult.rows.length === 0) {
      console.log('Class 551015 not found in database, creating it...');
      
      // Insert class 551015
      await client.query(
        'INSERT INTO "UnspscCodes" (code, segment, family, class, commodity, title, definition, level, "isActive", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
        ['55101500', '55', '10', '15', '00', 'Educational books and brochures', 'Educational and reference books and materials', 'CLASS', true, new Date(), new Date()]
      );
      
      console.log('Created class 551015');
    } else {
      console.log('Class 551015 already exists:', classResult.rows[0].title);
    }
      // Check if commodity 55101500 exists (the one in your screenshot)
    const commodityResult = await client.query(
      'SELECT * FROM "UnspscCodes" WHERE code = $1 AND level = $2',
      ['55101507', 'COMMODITY']
    );
    
    if (commodityResult.rows.length === 0) {
      console.log('Commodity code from screenshot not found in database, creating it...');
      
      // Generate UUID for the new commodity
      const commodityId = uuidv4();
      
      // Insert commodity
      await client.query(
        'INSERT INTO "UnspscCodes" (id, code, segment, family, class, commodity, title, definition, level, "isActive", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
        [commodityId, '55101507', '55', '10', '15', '07', 'Printed books', 'Printed educational books', 'COMMODITY', true, new Date(), new Date()]
      );
      
      console.log('Created commodity 55101507');
    } else {
      console.log('Commodity from screenshot already exists:', commodityResult.rows[0].title);
    }
    
    console.log('\nSuccess: All necessary hierarchy levels have been created or found.');
    
  } catch (error) {
    console.error('Error checking/creating segment 55:', error);
  } finally {
    client.release();
    await pool.end();
    console.log('Database connection closed');
  }
}

checkAndCreateSegment55();
