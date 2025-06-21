const { sequelize, UserUnspscFavorite, UnspscCode } = require('../models/sequelize');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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

// Function to check if a code exists in the database
async function checkCodeExists(code) {
  if (!code || code.length !== 8) {
    console.log(`Invalid UNSPSC code format: ${code}`);
    return false;
  }
  
  try {
    const codeExists = await UnspscCode.findOne({ where: { code } });
    return !!codeExists;
  } catch (error) {
    console.error('Error checking if code exists:', error);
    return false;
  }
}

// Function to test various UNSPSC codes
async function testUnspscCodes() {
  try {
    console.log('===================================================');
    console.log('UNSPSC Code Test and Validation Tool');
    console.log('===================================================');
    
    // Test codes
    const testCodes = [
      { code: '51161500', name: 'Non prescription drugs' },      // Exists (Segment 51)
      { code: '43211501', name: 'Desktop computers' },          // Should exist (Segment 43)
      { code: '40141800', name: 'Centrifugal pumps' },          // Doesn't exist (Segment 40)
      { code: '44121701', name: 'Pens' },                       // Should exist (Segment 44)
      { code: '99999999', name: 'Invalid test code' }           // Definitely doesn't exist
    ];
    
    for (const testItem of testCodes) {
      console.log('\n---------------------------------------------');
      console.log(`Testing code: ${testItem.code} (${testItem.name})`);
      console.log('---------------------------------------------');
      
      // Check if code exists in database
      const exists = await checkCodeExists(testItem.code);
      console.log(`Code exists in database: ${exists ? 'YES ✓' : 'NO ✗'}`);
      
      // Get hierarchy titles
      const hierarchyTitles = await fetchHierarchyTitles(testItem.code);
      
      // Summarize findings
      console.log('\nSummary:');
      if (exists) {
        console.log(`✓ Code ${testItem.code} exists in the database`);
        console.log(`✓ The "Use this code" button should work properly`);
        console.log(`✓ Hierarchy titles should be displayed correctly`);
      } else {
        console.log(`✗ Code ${testItem.code} does NOT exist in the database`);
        console.log(`✗ The "Use this code" button may have issues with this code`);
        console.log(`✗ Hierarchy titles may show as "Classification details not available"`);
      }
      
      // Get user input before proceeding to next code
      await new Promise(resolve => {
        rl.question('\nPress Enter to test the next code...', () => {
          resolve();
        });
      });
    }
    
    console.log('\n===================================================');
    console.log('Test completed!');
    console.log('===================================================');
    
  } catch (error) {
    console.error('Error during code testing:', error);
  } finally {
    rl.close();
    await sequelize.close();
    console.log('Database connection closed');
  }
}

// Run the test
testUnspscCodes();
