const { sequelize, UserUnspscFavorite } = require('../models/sequelize');

async function checkFavorites() {
  try {
    console.log('Checking existing favorites in the database...');
    
    const favorites = await UserUnspscFavorite.findAll();
    
    console.log(`Found ${favorites.length} favorites:`);
    
    favorites.forEach(favorite => {
      console.log('\n---------------------------------------');
      console.log(`ID: ${favorite.id}`);
      console.log(`Name: ${favorite.name}`);
      console.log(`UNSPSC Code: ${favorite.unspscCode} (${favorite.level})`);
      console.log(`Title: ${favorite.title}`);
      console.log('Hierarchy Data:');
      console.log(`  Segment: ${favorite.segment || 'null'} - Title: ${favorite.segmentTitle || 'null'}`);
      console.log(`  Family: ${favorite.family || 'null'} - Title: ${favorite.familyTitle || 'null'}`);
      console.log(`  Class: ${favorite.class || 'null'} - Title: ${favorite.classTitle || 'null'}`);
      console.log(`  Commodity: ${favorite.commodity || 'null'} - Title: ${favorite.commodityTitle || 'null'}`);
      console.log('---------------------------------------');
    });
    
  } catch (error) {
    console.error('Error checking favorites:', error);
  } finally {
    await sequelize.close();
  }
}

checkFavorites();
