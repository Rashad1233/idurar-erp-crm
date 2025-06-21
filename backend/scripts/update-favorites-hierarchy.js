const { sequelize, UserUnspscFavorite, UnspscCode } = require('../models/sequelize');

// Helper function to fetch hierarchy titles
async function fetchHierarchyTitles(unspscCode) {
  if (!unspscCode || unspscCode.length !== 8) {
    console.log(`Invalid UNSPSC code format: ${unspscCode}`);
    return {
      segmentTitle: null,
      familyTitle: null,
      classTitle: null,
      commodityTitle: null
    };
  }

  const segmentCode = unspscCode.substring(0, 2) + '000000';
  const familyCode = unspscCode.substring(0, 4) + '0000';
  const classCode = unspscCode.substring(0, 6) + '00';
  const commodityCode = unspscCode;

  console.log('Looking up codes:');
  console.log(`- Segment: ${segmentCode}`);
  console.log(`- Family: ${familyCode}`);
  console.log(`- Class: ${classCode}`);
  console.log(`- Commodity: ${commodityCode}`);

  try {
    // Fetch all hierarchy levels
    const [segment, family, classLevel, commodity] = await Promise.all([
      UnspscCode.findOne({ where: { code: segmentCode, level: 'SEGMENT' } }),
      UnspscCode.findOne({ where: { code: familyCode, level: 'FAMILY' } }),
      UnspscCode.findOne({ where: { code: classCode, level: 'CLASS' } }),
      UnspscCode.findOne({ where: { code: commodityCode, level: 'COMMODITY' } })
    ]);

    const hierarchyTitles = {
      segmentTitle: segment?.title || null,
      familyTitle: family?.title || null,
      classTitle: classLevel?.title || null,
      commodityTitle: commodity?.title || null
    };
    
    console.log('Found titles:');
    console.log(`- Segment: ${hierarchyTitles.segmentTitle}`);
    console.log(`- Family: ${hierarchyTitles.familyTitle}`);
    console.log(`- Class: ${hierarchyTitles.classTitle}`);
    console.log(`- Commodity: ${hierarchyTitles.commodityTitle}`);
    
    return hierarchyTitles;
  } catch (error) {
    console.error('Error fetching hierarchy titles:', error);
    return {
      segmentTitle: null,
      familyTitle: null,
      classTitle: null,
      commodityTitle: null
    };
  }
}

// Main function to update favorites
async function updateFavoritesWithHierarchy() {
  try {
    console.log('Starting update of favorites hierarchy titles...');
    
    // Get all favorites
    const favorites = await UserUnspscFavorite.findAll();
    console.log(`Found ${favorites.length} favorites to update`);
    
    // Process each favorite
    for (const favorite of favorites) {
      console.log(`\nProcessing favorite: ${favorite.name} (${favorite.unspscCode})`);
      
      // Get the hierarchy titles for this code
      const hierarchyTitles = await fetchHierarchyTitles(favorite.unspscCode);
      
      // Extract segment, family, class and commodity codes from UNSPSC code
      const segment = favorite.unspscCode.substring(0, 2);
      const family = favorite.unspscCode.substring(2, 4);
      const classCode = favorite.unspscCode.substring(4, 6);
      const commodity = favorite.unspscCode.substring(6, 8);
      
      // Update the favorite with segment, family, class, commodity codes and titles
      await favorite.update({
        segment,
        segmentTitle: hierarchyTitles.segmentTitle,
        family,
        familyTitle: hierarchyTitles.familyTitle,
        class: classCode,
        classTitle: hierarchyTitles.classTitle,
        commodity,
        commodityTitle: hierarchyTitles.commodityTitle
      });
      
      console.log(`✓ Updated favorite: ${favorite.name}`);
    }
    
    console.log('\nAll favorites have been updated successfully!');
  } catch (error) {
    console.error('Error updating favorites:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
    console.log('Database connection closed');
  }
}

// Run the update
updateFavoritesWithHierarchy();
