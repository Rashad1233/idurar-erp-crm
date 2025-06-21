require('dotenv').config();
const { Pool } = require('pg');

// Create a new PostgreSQL client
const pool = new Pool({
  database: process.env.POSTGRES_DB || 'erpdb',
  user: process.env.POSTGRES_USER || 'postgres',
  password: String(process.env.POSTGRES_PASSWORD || 'UHm8g167'),
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT) || 5432,
});

async function verifyUnspscHierarchy() {
  const client = await pool.connect();
  
  try {
    console.log('=== Verifying UNSPSC Hierarchy Structure ===');
    console.log('\nChecking segment 55 hierarchy...');
    
    // Check if all levels exist in database
    const [segment, family, classLevel, commodity] = await Promise.all([
      client.query('SELECT * FROM "UnspscCodes" WHERE code = $1 AND level = $2', ['55000000', 'SEGMENT']),
      client.query('SELECT * FROM "UnspscCodes" WHERE code = $1 AND level = $2', ['55100000', 'FAMILY']),
      client.query('SELECT * FROM "UnspscCodes" WHERE code = $1 AND level = $2', ['55101500', 'CLASS']),
      client.query('SELECT * FROM "UnspscCodes" WHERE code = $1 AND level = $2', ['55101507', 'COMMODITY'])
    ]);
    
    console.log(`\nSegment 55: ${segment.rows.length ? 'Found ✓' : 'Missing ✗'}`);
    if (segment.rows.length) {
      console.log(`- Title: ${segment.rows[0].title}`);
      console.log(`- Code: ${segment.rows[0].code}`);
    }
    
    console.log(`\nFamily 5510: ${family.rows.length ? 'Found ✓' : 'Missing ✗'}`);
    if (family.rows.length) {
      console.log(`- Title: ${family.rows[0].title}`);
      console.log(`- Code: ${family.rows[0].code}`);
    }
    
    console.log(`\nClass 551015: ${classLevel.rows.length ? 'Found ✓' : 'Missing ✗'}`);
    if (classLevel.rows.length) {
      console.log(`- Title: ${classLevel.rows[0].title}`);
      console.log(`- Code: ${classLevel.rows[0].code}`);
    }
    
    console.log(`\nCommodity 55101507: ${commodity.rows.length ? 'Found ✓' : 'Missing ✗'}`);
    if (commodity.rows.length) {
      console.log(`- Title: ${commodity.rows[0].title}`);
      console.log(`- Code: ${commodity.rows[0].code}`);
    }
    
    // Check for other segments that might be used in the system
    console.log('\nChecking all segments in the system...');
    const segments = await client.query('SELECT DISTINCT segment, title FROM "UnspscCodes" WHERE level = $1 ORDER BY segment', ['SEGMENT']);
    
    console.log(`\nFound ${segments.rows.length} segments:`);
    segments.rows.forEach(row => {
      console.log(`- Segment ${row.segment}: ${row.title}`);
    });
    
  } catch (error) {
    console.error('Error verifying UNSPSC hierarchy:', error);
  } finally {
    client.release();
    await pool.end();
    console.log('\nDatabase connection closed');
  }
}

verifyUnspscHierarchy();
