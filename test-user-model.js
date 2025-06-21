// Test User model loading
const { User } = require('./backend/models/sequelize/index');

console.log('Testing User model...');
console.log('User model attributes:', Object.keys(User.rawAttributes));
console.log('User model tableName:', User.tableName);

async function testUserFind() {
  try {
    console.log('Testing User.findOne with email...');
    const user = await User.findOne({ 
      where: { email: 'admin@erp.com' },
      attributes: ['id', 'name', 'email', 'role']  // Only select fields that exist
    });
    console.log('User found:', user ? user.toJSON() : 'No user found');
  } catch (error) {
    console.error('Error finding user:', error.message);
    console.error('SQL:', error.sql);
  } finally {
    await User.sequelize.close();
  }
}

testUserFind();
