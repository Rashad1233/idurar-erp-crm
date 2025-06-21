// Test script to verify UNSPSC favorites functionality
require('dotenv').config();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { User } = require('../models/sequelize');

// Helper function to generate a test token
async function generateTestToken() {
  try {
    const user = await User.findOne({
      where: { email: 'admin@erp.com' }
    });

    if (!user) {
      console.error('Admin user not found');
      return null;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return token;
  } catch (error) {
    console.error('Error generating test token:', error);
    return null;
  }
}

async function testUnspscFavorites() {
  try {
    console.log('\n=== Testing UNSPSC Favorites System ===');
    
    const token = await generateTestToken();
    if (!token) {
      console.error('Failed to generate test token');
      return;
    }

    const api = axios.create({
      baseURL: `http://localhost:${process.env.PORT || 8888}/api`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    // Test 1: Get all favorites (should be empty initially)
    console.log('\n--- Test 1: Get all favorites ---');
    const getFavoritesResponse = await api.get('/unspsc-favorites');
    console.log('Get favorites response:', JSON.stringify(getFavoritesResponse.data, null, 2));

    // Test 2: Create a new favorite
    console.log('\n--- Test 2: Create a new favorite ---');
    const favoriteData = {
      name: 'Common Ball Valves',
      description: 'Frequently used ball valves for projects',
      unspscCode: '40141607',
      level: 'COMMODITY',
      title: 'Ball valves',
      segment: '40',
      family: '40141607'.substring(0, 4),
      class: '40141607'.substring(0, 6),
      commodity: '40141607'.substring(6, 8),
      isDefault: false
    };

    console.log('Creating favorite with data:', JSON.stringify(favoriteData, null, 2));
    const createResponse = await api.post('/unspsc-favorites', favoriteData);
    console.log('Create favorite response:', JSON.stringify(createResponse.data, null, 2));

    // Test 3: Get favorites again (should show the new one)
    console.log('\n--- Test 3: Get favorites after creation ---');
    const getFavoritesAfterCreate = await api.get('/unspsc-favorites');
    console.log('Get favorites after create:', JSON.stringify(getFavoritesAfterCreate.data, null, 2));

    // Test 4: Create another favorite and set it as default
    console.log('\n--- Test 4: Create default favorite ---');
    const defaultFavoriteData = {
      name: 'Standard Pumps',
      description: 'Default pump selection for most projects',
      unspscCode: '40141800',
      level: 'COMMODITY',
      title: 'Centrifugal pumps',
      segment: '40',
      family: '40141800'.substring(0, 4),
      class: '40141800'.substring(0, 6),
      commodity: '40141800'.substring(6, 8),
      isDefault: true
    };

    const createDefaultResponse = await api.post('/unspsc-favorites', defaultFavoriteData);
    console.log('Create default favorite response:', JSON.stringify(createDefaultResponse.data, null, 2));

    // Test 5: Get all favorites to see both
    console.log('\n--- Test 5: Get all favorites ---');
    const getAllFavorites = await api.get('/unspsc-favorites');
    console.log('All favorites:', JSON.stringify(getAllFavorites.data, null, 2));

    // Test 6: Update a favorite
    if (getAllFavorites.data.success && getAllFavorites.data.data.length > 0) {
      const firstFavorite = getAllFavorites.data.data[0];
      console.log('\n--- Test 6: Update a favorite ---');
      
      const updateData = {
        name: 'Updated Ball Valves',
        description: 'Updated description for ball valves'
      };

      const updateResponse = await api.put(`/unspsc-favorites/${firstFavorite.id}`, updateData);
      console.log('Update favorite response:', JSON.stringify(updateResponse.data, null, 2));
    }

    // Test 7: Delete a favorite
    if (getAllFavorites.data.success && getAllFavorites.data.data.length > 1) {
      const secondFavorite = getAllFavorites.data.data[1];
      console.log('\n--- Test 7: Delete a favorite ---');
      
      const deleteResponse = await api.delete(`/unspsc-favorites/${secondFavorite.id}`);
      console.log('Delete favorite response:', JSON.stringify(deleteResponse.data, null, 2));
    }

    // Test 8: Final check of favorites
    console.log('\n--- Test 8: Final favorites list ---');
    const finalFavorites = await api.get('/unspsc-favorites');
    console.log('Final favorites:', JSON.stringify(finalFavorites.data, null, 2));

    console.log('\n✅ All favorites tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the test
testUnspscFavorites();
