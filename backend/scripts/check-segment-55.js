const { sequelize, UnspscCode } = require('../models/sequelize');

async function checkSegment55() {
  try {
    console.log('Checking for segment 55...');
    
    const segment55 = await UnspscCode.findOne({ 
      where: { 
        code: '55000000',
        level: 'SEGMENT' 
      }
    });
    
    console.log('Segment 55:', segment55 ? JSON.stringify(segment55.dataValues, null, 2) : 'Not found in database');
    
    // Check if 55101500 exists
    const code55101500 = await UnspscCode.findOne({
      where: {
        code: '55101500',
        level: 'CLASS'
      }
    });
    
    console.log('\nCode 55101500:', code55101500 ? JSON.stringify(code55101500.dataValues, null, 2) : 'Not found in database');
    
    // Check family 5510
    const family5510 = await UnspscCode.findOne({
      where: {
        code: '55100000',
        level: 'FAMILY'
      }
    });
    
    console.log('\nFamily 5510:', family5510 ? JSON.stringify(family5510.dataValues, null, 2) : 'Not found in database');
    
    // Try to create segment 55 if it doesn't exist
    if (!segment55) {
      console.log('\nCreating segment 55...');
      
      const newSegment = await UnspscCode.create({
        code: '55000000',
        segment: '55',
        family: '00',
        class: '00',
        commodity: '00',
        title: 'Published Products',
        definition: 'Segment for published products including printed, electronic, and other media',
        level: 'SEGMENT',
        isActive: true
      });
      
      console.log('\nCreated segment 55:', JSON.stringify(newSegment.dataValues, null, 2));
    }
    
  } catch (error) {
    console.error('Error checking segment 55:', error);
  } finally {
    await sequelize.close();
    console.log('\nDatabase connection closed');
  }
}

checkSegment55();
