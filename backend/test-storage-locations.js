const sequelize = require('./config/postgresql');
const { StorageLocation, User } = require('./models/sequelize');

async function testStorageLocations() {
  try {
    console.log('Starting storage locations test...');
    // Connect to database
    await sequelize.authenticate();
    console.log('Database connected successfully');

    // Check existing storage locations
    const existingLocations = await StorageLocation.findAll();
    console.log(`Found ${existingLocations.length} existing storage locations:`);
    existingLocations.forEach(location => {
      console.log(`- ${location.code}: ${location.description} (Active: ${location.isActive})`);
    });

    // If no storage locations exist, create some sample ones
    if (existingLocations.length === 0) {
      console.log('\nNo storage locations found. Creating sample storage locations...');

      // Find or create a user to associate with the locations
      let user = await User.findOne();
      if (!user) {
        console.log('No users found. Creating a test user...');
        user = await User.create({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          role: 'admin'
        });
      }

      const sampleLocations = [
        {
          code: 'WH001',
          description: 'Main Warehouse',
          street: '123 Industrial Blvd',
          city: 'Manufacturing City',
          postalCode: '12345',
          country: 'USA',
          isActive: true,
          createdById: user.id
        },
        {
          code: 'WH002',
          description: 'Secondary Storage',
          street: '456 Storage Ave',
          city: 'Storage Town',
          postalCode: '67890',
          country: 'USA',
          isActive: true,
          createdById: user.id
        },
        {
          code: 'WH003',
          description: 'Cold Storage Facility',
          street: '789 Cold Storage Rd',
          city: 'Freezer City',
          postalCode: '11111',
          country: 'USA',
          isActive: true,
          createdById: user.id
        }
      ];

      for (const locationData of sampleLocations) {
        const location = await StorageLocation.create(locationData);
        console.log(`Created storage location: ${location.code} - ${location.description}`);
      }
    }

    // Verify final count
    const finalLocations = await StorageLocation.findAll({
      where: { isActive: true },
      order: [['code', 'ASC']]
    });
    console.log(`\nTotal active storage locations: ${finalLocations.length}`);
    finalLocations.forEach(location => {
      console.log(`- ${location.code}: ${location.description}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

testStorageLocations();
