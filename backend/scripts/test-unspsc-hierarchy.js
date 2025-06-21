// Test UNSPSC Hierarchy API
require('dotenv').config();
const { sequelize } = require('../config/db');
const { User, UserUnspscHierarchy, UnspscCode } = require('../models/sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function testUnspscHierarchy() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Find admin user
    console.log('🔄 Looking for admin user...');
    const adminUser = await User.findOne({ 
      where: { 
        email: 'admin@erp.com' 
      } 
    });

    if (!adminUser) {
      console.log('❌ Admin user not found!');
      return;
    }
    
    console.log('✅ Admin user found:', {
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role
    });
    
    // Generate JWT token
    const token = jwt.sign(
      { id: adminUser.id, email: adminUser.email, role: adminUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    console.log('✅ JWT token generated');
    
    // Count UNSPSC segments
    console.log('🔄 Counting UNSPSC segments...');
    const segmentCount = await UnspscCode.count({ 
      where: { level: 'SEGMENT' } 
    });
    
    console.log(`✅ Found ${segmentCount} UNSPSC segments in the database`);
    
    // Count user's UNSPSC hierarchy entries
    console.log('🔄 Counting user UNSPSC hierarchy entries...');
    const hierarchyCount = await UserUnspscHierarchy.count({ 
      where: { userId: adminUser.id } 
    });
    
    console.log(`✅ Found ${hierarchyCount} entries in user's UNSPSC hierarchy`);
    
    // Add a test segment to user's hierarchy if none exist
    if (hierarchyCount === 0) {
      console.log('🔄 Adding test segment to user hierarchy...');
      
      // Get a segment from UnspscCode
      const segment = await UnspscCode.findOne({
        where: { level: 'SEGMENT' },
        order: [['code', 'ASC']]
      });
      
      if (segment) {
        const newHierarchyEntry = await UserUnspscHierarchy.create({
          userId: adminUser.id,
          unspscCode: segment.code,
          level: 'SEGMENT',
          title: segment.title,
          segment: segment.code.substring(0, 2),
          useFrequency: 1,
          lastUsed: new Date()
        });
        
        console.log('✅ Added segment to user hierarchy:', {
          id: newHierarchyEntry.id,
          unspscCode: newHierarchyEntry.unspscCode,
          title: newHierarchyEntry.title
        });
      } else {
        console.log('❌ No segments found in UNSPSC codes table');
      }
    }
    
    // List user's hierarchy entries
    console.log('🔄 Listing user hierarchy entries...');
    const hierarchyEntries = await UserUnspscHierarchy.findAll({
      where: { userId: adminUser.id },
      order: [['lastUsed', 'DESC']]
    });
    
    console.log(`✅ User hierarchy entries (${hierarchyEntries.length}):`);
    hierarchyEntries.forEach(entry => {
      console.log(`  - ${entry.unspscCode} (${entry.level}): ${entry.title}`);
    });
    
    console.log('✅ Test completed successfully');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed.');
  }
}

// Run the test
testUnspscHierarchy();
