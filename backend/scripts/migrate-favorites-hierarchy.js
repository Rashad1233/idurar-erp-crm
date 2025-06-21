// Migration script to add hierarchy titles to existing UserUnspscFavorite records
require('dotenv').config();
const { sequelize } = require('../config/db');
const { UserUnspscFavorite, UnspscCode } = require('../models/sequelize');

// Helper function to fetch hierarchy titles (same as in userUnspscFavoritesRoutes.js)
async function fetchHierarchyTitles(unspscCode) {
  try {
    const segmentCode = unspscCode.substring(0, 2) + '000000';
    const familyCode = unspscCode.substring(0, 4) + '0000';
    const classCode = unspscCode.substring(0, 6) + '00';
    const commodityCode = unspscCode;

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
    console.error('Error fetching hierarchy titles for', unspscCode, ':', error);
    return {
      segmentTitle: null,
      familyTitle: null,
      classTitle: null,
      commodityTitle: null
    };
  }
}

async function migrateFavoritesHierarchy() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    console.log('🔄 Fetching existing favorites without hierarchy titles...');
    const favorites = await UserUnspscFavorite.findAll({
      where: {
        segmentTitle: null
      }
    });

    console.log(`📊 Found ${favorites.length} favorites to update`);

    if (favorites.length === 0) {
      console.log('✅ No favorites need updating. Migration complete!');
      return;
    }

    console.log('🔄 Updating favorites with hierarchy titles...');
    let updated = 0;
    let errors = 0;

    for (const favorite of favorites) {
      try {
        console.log(`Updating favorite: ${favorite.name} (${favorite.unspscCode})`);
        
        const hierarchyTitles = await fetchHierarchyTitles(favorite.unspscCode);
        
        await favorite.update({
          segmentTitle: hierarchyTitles.segmentTitle,
          familyTitle: hierarchyTitles.familyTitle,
          classTitle: hierarchyTitles.classTitle,
          commodityTitle: hierarchyTitles.commodityTitle
        });

        updated++;
        console.log(`  ✅ Updated with titles: ${hierarchyTitles.segmentTitle || 'N/A'} > ${hierarchyTitles.familyTitle || 'N/A'} > ${hierarchyTitles.classTitle || 'N/A'} > ${hierarchyTitles.commodityTitle || 'N/A'}`);
      } catch (error) {
        errors++;
        console.error(`  ❌ Error updating favorite ${favorite.id}:`, error.message);
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`  ✅ Successfully updated: ${updated} favorites`);
    console.log(`  ❌ Errors: ${errors} favorites`);    if (updated > 0) {
      console.log('\n🔄 Verifying updates...');
      const verifyFavorites = await UserUnspscFavorite.findAll({
        where: {
          segmentTitle: { [require('sequelize').Op.not]: null }
        }
      });
      console.log(`✅ Verification: ${verifyFavorites.length} favorites now have hierarchy titles`);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed.');
  }
}

// Run the migration
if (require.main === module) {
  migrateFavoritesHierarchy()
    .then(() => {
      console.log('\n✅ Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = migrateFavoritesHierarchy;
