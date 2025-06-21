const { User } = require('./backend/models/sequelize');

async function testUserLogin() {
  try {
    console.log('🔍 Checking existing users...');
    const users = await User.findAll();
    console.log(`Found ${users.length} users`);
    
    if (users.length === 0) {
      console.log('Creating test user...');
      const user = await User.create({
        name: 'Test Admin',
        email: 'admin@example.com',
        password: 'Password123!',
        role: 'admin',
        createItemMaster: true,
        editItemMaster: true,
        approveItemMaster: true,
        setInventoryLevels: true,
        createReorderRequests: true,
        approveReorderRequests: true,
        warehouseTransactions: true
      });
      console.log('✅ User created:', user.email);
    } else {
      console.log('Users exist:');
      users.forEach(user => {
        console.log(`- ${user.email} (${user.role})`);
      });
    }

    // Test login
    const testUser = await User.findOne({ where: { email: 'admin@example.com' } });
    if (testUser) {
      const isValid = await testUser.comparePassword('Password123!');
      console.log('Password validation:', isValid);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testUserLogin();
