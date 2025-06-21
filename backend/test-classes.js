const { UserUnspscHierarchy, UnspscCode } = require('./models/sequelize');
const { Op } = require('sequelize');

async function testGetClasses() {
  try {
    console.log('Testing getChildren for CLASS level...');
    
    // Simulate a family code like '10101000' (segment 10, family 10, padded to 8 digits)
    const parentCode = '10101000';
    const level = 'CLASS';
    
    console.log('Parent code:', parentCode);
    console.log('Requested level:', level);
    
    // First check if user has any classes for this family
    const userId = 'b86b85c3-5b8d-4db1-8e97-f7a8c2b3e4d6'; // Use the test user ID
    
    const whereClause = {
      userId: userId,
      family: parentCode.substring(0, 4),
      level: 'CLASS'
    };
    
    console.log('User hierarchy where clause:', whereClause);
    
    const hierarchyEntries = await UserUnspscHierarchy.findAll({
      where: whereClause,
      order: [['useFrequency', 'DESC'], ['lastUsed', 'DESC']],
      limit: 100
    });
    
    console.log('User hierarchy entries found:', hierarchyEntries.length);
    
    if (hierarchyEntries.length === 0) {
      console.log('No user entries found, checking global UNSPSC codes...');
      
      const unspscWhereClause = {
        code: { [Op.like]: `${parentCode.substring(0, 4)}__00` },
        level: 'CLASS'
      };
      
      console.log('Global UNSPSC where clause:', unspscWhereClause);
      
      const unspscCodes = await UnspscCode.findAll({
        where: unspscWhereClause,
        limit: 20
      });
      
      console.log('Global UNSPSC codes found:', unspscCodes.length);
      
      if (unspscCodes.length > 0) {
        console.log('Sample global codes:');
        unspscCodes.slice(0, 3).forEach(code => {
          console.log('  -', code.code, ':', code.title);
        });
      }
    } else {
      console.log('User hierarchy entries:');
      hierarchyEntries.forEach(entry => {
        console.log('  -', entry.unspscCode, ':', entry.title);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
}

testGetClasses();
