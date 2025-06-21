const { UserUnspscFavorite, UnspscCode } = require('../models/sequelize');

// Helper function to fetch hierarchy titles (copied from routes)
async function fetchHierarchyTitles(unspscCode) {
  if (!unspscCode || unspscCode.length !== 8) {
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

  try {
    // Fetch all hierarchy levels
    const [segment, family, classLevel, commodity] = await Promise.all([
      UnspscCode.findOne({ where: { code: segmentCode, level: 'SEGMENT' } }),
      UnspscCode.findOne({ where: { code: familyCode, level: 'FAMILY' } }),
      UnspscCode.findOne({ where: { code: classCode, level: 'CLASS' } }),
      UnspscCode.findOne({ where: { code: commodityCode, level: 'COMMODITY' } })
    ]);

    return {
      segmentTitle: segment?.title || null,
      familyTitle: family?.title || null,
      classTitle: classLevel?.title || null,
      commodityTitle: commodity?.title || null
    };
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

async function addValidFavorites() {
  console.log('Adding favorites with valid UNSPSC codes...');
  
  const validFavorites = [
    {
      name: 'Desktop Computers',
      description: 'Standard desktop computers for office use',
      unspscCode: '43211501',
      level: 'COMMODITY',
      isDefault: true
    },
    {
      name: 'Pens',
      description: 'Writing instruments - pens',
      unspscCode: '44121701',
      level: 'COMMODITY',
      isDefault: false
    },
    {
      name: 'Ball Bearings',
      description: 'Mechanical ball bearings',
      unspscCode: '31151501',
      level: 'COMMODITY',
      isDefault: false
    }
  ];

  try {
    const userId = 1; // Assuming user 1 exists
    
    for (const favorite of validFavorites) {
      console.log(`\nAdding favorite: ${favorite.name} (${favorite.unspscCode})`);
      
      // Fetch hierarchy titles
      const hierarchy = await fetchHierarchyTitles(favorite.unspscCode);
      
      // Create the favorite
      const newFavorite = await UserUnspscFavorite.create({
        userId: userId,
        unspscCode: favorite.unspscCode,
        name: favorite.name,
        description: favorite.description || '',
        level: favorite.level,
        isDefault: favorite.isDefault || false,
        segment: hierarchy.segmentTitle,
        family: hierarchy.familyTitle,
        class: hierarchy.classTitle,
        commodity: hierarchy.commodityTitle,
        title: hierarchy.commodityTitle || hierarchy.classTitle || hierarchy.familyTitle || hierarchy.segmentTitle
      });
      
      console.log(`✅ Successfully added: ${favorite.name}`);
      console.log(`   ID: ${newFavorite.id}`);
      console.log(`   Code: ${newFavorite.unspscCode}`);
      console.log(`   Hierarchy: ${newFavorite.segment} > ${newFavorite.class} > ${newFavorite.commodity}`);
    }
    
    console.log('\n=== Listing all favorites ===');
    const allFavorites = await UserUnspscFavorite.findAll({ 
      where: { userId: userId },
      order: [['isDefault', 'DESC'], ['createdAt', 'ASC']]
    });
    
    console.log(`Found ${allFavorites.length} favorites:`);
    allFavorites.forEach(fav => {
      console.log(`- ${fav.name} (${fav.unspscCode}) - ${fav.segment} > ${fav.class} > ${fav.commodity}`);
    });
    
  } catch (error) {
    console.error('Error adding favorites:', error);
  } finally {
    process.exit(0);
  }
}

addValidFavorites();
