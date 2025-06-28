const { sequelize } = require('./backend/models/sequelize');

(async () => {
  try {
    const [items] = await sequelize.query('SELECT COUNT(*) as count FROM "ItemMasters"');
    console.log('Total ItemMasters:', items[0].count);
    
    const [sample] = await sequelize.query('SELECT * FROM "ItemMasters" LIMIT 3');
    console.log('Sample data:', JSON.stringify(sample, null, 2));
    
    const [statuses] = await sequelize.query('SELECT DISTINCT status FROM "ItemMasters"');
    console.log('Available statuses:', statuses.map(s => s.status));
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
})();