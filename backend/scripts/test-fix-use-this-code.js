const axios = require('axios');
const readline = require('readline');

require('dotenv').config({ path: '../.env' });

const API_URL = 'http://localhost:8888/api';
let authToken = null;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to prompt for user input
const prompt = (question) => new Promise(resolve => rl.question(question, resolve));

// Login to get auth token
async function login() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: process.env.TEST_USER_EMAIL || 'admin@example.com',
      password: process.env.TEST_USER_PASSWORD || 'password123'
    });
    
    if (response.data.token) {
      console.log('✓ Login successful');
      return response.data.token;
    } else {
      console.error('Login failed:', response.data);
      return null;
    }
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    return null;
  }
}

// Get all favorites
async function getFavorites(token) {
  try {
    const response = await axios.get(`${API_URL}/unspsc-favorites`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.success) {
      return response.data.data;
    } else {
      console.error('Failed to get favorites:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error getting favorites:', error.response?.data || error.message);
    return [];
  }
}

// Get a specific favorite by ID
async function getFavorite(token, id) {
  try {
    const response = await axios.get(`${API_URL}/unspsc-favorites/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.success) {
      return response.data.data;
    } else {
      console.error('Failed to get favorite:', response.data);
      return null;
    }
  } catch (error) {
    console.error('Error getting favorite:', error.response?.data || error.message);
    return null;
  }
}

// Check if a UNSPSC code exists in the database
async function checkUnspscExists(token, code) {
  try {
    const response = await axios.get(`${API_URL}/unspsc/code/${code}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data && response.data.id) {
      console.log(`✓ UNSPSC code ${code} exists in database with UUID: ${response.data.id}`);
      return true;
    } else {
      console.log(`✗ UNSPSC code ${code} does not exist in database`);
      return false;
    }
  } catch (error) {
    console.log(`✗ UNSPSC code ${code} does not exist in database`);
    return false;
  }
}

// Main function to test the solution
async function testFavorites() {
  try {
    console.log('===== UNSPSC Favorites "Use this code" Button Test =====\n');
    
    // Login to get token
    const token = await login();
    if (!token) {
      console.log('Login failed, cannot proceed with tests.');
      return;
    }
    
    // Get all favorites
    const favorites = await getFavorites(token);
    console.log(`\nFound ${favorites.length} favorites:`);
    
    favorites.forEach((favorite, index) => {
      console.log(`${index + 1}. ${favorite.name} (${favorite.unspscCode}) - ${favorite.title}`);
    });
    
    if (favorites.length === 0) {
      console.log('No favorites found to test. Please create some favorites first.');
      return;
    }
    
    // Ask which favorite to test
    const favoriteIndex = await prompt('\nWhich favorite would you like to test? (Enter the number): ');
    const selectedFavorite = favorites[parseInt(favoriteIndex) - 1];
    
    if (!selectedFavorite) {
      console.log('Invalid selection.');
      return;
    }
    
    console.log(`\nSelected favorite: ${selectedFavorite.name} (${selectedFavorite.unspscCode})`);
    
    // Check if the code exists in the database before "Use this code" button
    console.log('\nChecking if code exists in database BEFORE clicking "Use this code"...');
    const existsBefore = await checkUnspscExists(token, selectedFavorite.unspscCode);
    
    // Simulate clicking the "Use this code" button by getting the specific favorite
    console.log('\nSimulating "Use this code" button click by fetching the specific favorite...');
    const favorite = await getFavorite(token, selectedFavorite.id);
    
    if (!favorite) {
      console.log('Failed to get favorite details.');
      return;
    }
    
    // Display the favorite details
    console.log('\nFavorite details:');
    console.log(`- Code: ${favorite.unspscCode}`);
    console.log(`- Name: ${favorite.name}`);
    console.log(`- Title: ${favorite.title}`);
    console.log(`- Level: ${favorite.level}`);
    console.log('\nHierarchy titles:');
    console.log(`- Segment: ${favorite.segment} - ${favorite.segmentTitle || 'N/A'}`);
    console.log(`- Family: ${favorite.family} - ${favorite.familyTitle || 'N/A'}`);
    console.log(`- Class: ${favorite.class} - ${favorite.classTitle || 'N/A'}`);
    console.log(`- Commodity: ${favorite.commodity} - ${favorite.commodityTitle || 'N/A'}`);
    
    // Check if the code exists in the database after "Use this code" button
    console.log('\nChecking if code exists in database AFTER clicking "Use this code"...');
    const existsAfter = await checkUnspscExists(token, selectedFavorite.unspscCode);
    
    // Test results
    console.log('\nTest Results:');
    console.log(`- Before "Use this code": ${existsBefore ? 'Code existed in database ✓' : 'Code did NOT exist in database ✗'}`);
    console.log(`- After "Use this code": ${existsAfter ? 'Code exists in database ✓' : 'Code does NOT exist in database ✗'}`);
    
    if (!existsBefore && existsAfter) {
      console.log('\n✅ SUCCESS! The code was added to the database automatically when "Use this code" button was clicked.');
      console.log('Now you should be able to select this code in the hierarchy selector.');
    } else if (existsBefore && existsAfter) {
      console.log('\n✅ SUCCESS! The code already existed in the database, so it can be selected in the hierarchy selector.');
    } else {
      console.log('\n❌ FAILED! The code was not added to the database. Something went wrong with our solution.');
    }
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    rl.close();
  }
}

// Run the test
testFavorites();
