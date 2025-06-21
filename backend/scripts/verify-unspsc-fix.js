require('dotenv').config();
const { UserUnspscFavorite, UnspscCode, sequelize } = require('../models/sequelize');
const { ensureUnspscCodeExists } = require('../utils/unspscUtils');

// Function to verify a specific UNSPSC code
async function verifyUnspscCode(unspscCode) {
  console.log(`\nVerifying UNSPSC code: ${unspscCode}`);
  
  // Check if code exists in database
  const codeExists = await UnspscCode.findOne({ 
    where: { code: unspscCode },
    attributes: ['id', 'code', 'title', 'level']
  });
  
  if (codeExists) {
    console.log(`✅ UNSPSC code ${unspscCode} exists in database: ${codeExists.title} (${codeExists.level})`);
    
    // Check if all hierarchy levels exist with proper titles
    const segment = unspscCode.substring(0, 2);
    const family = unspscCode.substring(2, 4);
    const classCode = unspscCode.substring(4, 6);
    
    const segmentCode = segment + '000000';
    const familyCode = segment + family + '0000';
    const classCodeFull = segment + family + classCode + '00';
    
    const [segmentExists, familyExists, classExists] = await Promise.all([
      UnspscCode.findOne({ where: { code: segmentCode, level: 'SEGMENT' } }),
      UnspscCode.findOne({ where: { code: familyCode, level: 'FAMILY' } }),
      UnspscCode.findOne({ where: { code: classCodeFull, level: 'CLASS' } })
    ]);
    
    // Check for proper titles
    const hasProperSegmentTitle = segmentExists && segmentExists.title && segmentExists.title !== segment && !/^\d+$/.test(segmentExists.title);
    const hasProperFamilyTitle = familyExists && familyExists.title && familyExists.title !== family && !/^\d+$/.test(familyExists.title);
    const hasProperClassTitle = classExists && classExists.title && classExists.title !== classCode && !/^\d+$/.test(classExists.title);
    const hasProperCommodityTitle = codeExists.title && !/^\d+$/.test(codeExists.title);
    
    console.log(`Segment (${segmentCode}): ${segmentExists ? (hasProperSegmentTitle ? '✅ Exists with title: ' + segmentExists.title : '⚠️ Exists but missing proper title') : '❌ Missing'}`);
    console.log(`Family (${familyCode}): ${familyExists ? (hasProperFamilyTitle ? '✅ Exists with title: ' + familyExists.title : '⚠️ Exists but missing proper title') : '❌ Missing'}`);
    console.log(`Class (${classCodeFull}): ${classExists ? (hasProperClassTitle ? '✅ Exists with title: ' + classExists.title : '⚠️ Exists but missing proper title') : '❌ Missing'}`);
    console.log(`Commodity (${unspscCode}): ${hasProperCommodityTitle ? '✅ Exists with title: ' + codeExists.title : '⚠️ Missing proper title'}`);
    
    // Return true only if all levels have proper titles
    const allLevelsProper = hasProperSegmentTitle && hasProperFamilyTitle && hasProperClassTitle && hasProperCommodityTitle;
    if (!allLevelsProper) {
      console.log('⚠️ Some hierarchy levels are missing proper titles');
    }
    
    return true;
  } else {
    console.log(`❌ UNSPSC code ${unspscCode} does NOT exist in database`);
    return false;
  }
}

// Main verification function
async function verifyFix() {
  try {
    console.log('=== UNSPSC Favorites Fix Verification ===');
    
    // 1. Get all favorites with segment 40 (which was problematic)
    const segment40Favorites = await UserUnspscFavorite.findAll({
      where: {
        unspscCode: {
          [sequelize.Sequelize.Op.like]: '40%'
        }
      },
      attributes: ['id', 'name', 'unspscCode', 'segmentTitle', 'familyTitle', 'classTitle', 'commodityTitle']
    });
    
    console.log(`\nFound ${segment40Favorites.length} favorites with segment 40`);
    
    // 2. Verify each segment 40 favorite exists in the database
    for (const favorite of segment40Favorites) {
      console.log(`\nChecking favorite: ${favorite.name} (${favorite.unspscCode})`);
      
      if (!favorite.segmentTitle || !favorite.familyTitle || !favorite.classTitle || !favorite.commodityTitle) {
        console.log(`❌ Favorite is missing some hierarchy titles`);
        console.log(`Segment: ${favorite.segmentTitle || 'MISSING'}`);
        console.log(`Family: ${favorite.familyTitle || 'MISSING'}`);
        console.log(`Class: ${favorite.classTitle || 'MISSING'}`);
        console.log(`Commodity: ${favorite.commodityTitle || 'MISSING'}`);
      } else {
        console.log(`✅ Favorite has all hierarchy titles`);
      }
      
      // Check if the code exists in the database
      const exists = await verifyUnspscCode(favorite.unspscCode);
      
      if (!exists) {
        console.log(`Attempting to ensure code exists in database...`);
        
        // Try to ensure the code exists
        const hierarchyTitles = {
          segmentTitle: favorite.segmentTitle || 'Unknown Segment',
          familyTitle: favorite.familyTitle || 'Unknown Family',
          classTitle: favorite.classTitle || 'Unknown Class',
          commodityTitle: favorite.commodityTitle || 'Unknown Commodity'
        };
        
        const codeUuid = await ensureUnspscCodeExists(favorite.unspscCode, hierarchyTitles);
        
        if (codeUuid) {
          console.log(`✅ Successfully created UNSPSC code ${favorite.unspscCode} in database with UUID: ${codeUuid}`);
          await verifyUnspscCode(favorite.unspscCode);
        } else {
          console.log(`❌ Failed to create UNSPSC code ${favorite.unspscCode} in database`);
        }
      }
    }
    
    // 3. Create a test favorite with segment 40 code
    const testCode = '40101505'; // Use a known segment 40 code
    
    console.log(`\nCreating test UNSPSC code in database: ${testCode}`);
    
    // Create test hierarchy titles
    const testHierarchyTitles = {
      segmentTitle: 'Distribution and Conditioning Systems and Equipment and Components',
      familyTitle: 'Heating and ventilation and air circulation',
      classTitle: 'Space heaters',
      commodityTitle: 'Infrared heaters'
    };
    
    // Ensure the code exists
    const codeUuid = await ensureUnspscCodeExists(testCode, testHierarchyTitles);
    
    if (codeUuid) {
      console.log(`✅ Successfully created test UNSPSC code ${testCode} in database with UUID: ${codeUuid}`);
      await verifyUnspscCode(testCode);
    } else {
      console.log(`❌ Failed to create test UNSPSC code ${testCode} in database`);
    }
    
    console.log('\n=== Verification Completed ===');
    
  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the verification
verifyFix();
