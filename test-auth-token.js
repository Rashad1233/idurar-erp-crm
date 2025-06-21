// Test auth token persistence after login
// Run this in the browser console after logging in

console.log('🔍 Testing auth state after login...');

// Check localStorage directly
const authFromStorage = localStorage.getItem('auth');
console.log('Raw auth from localStorage:', authFromStorage);

if (authFromStorage) {
  try {
    const parsedAuth = JSON.parse(authFromStorage);
    console.log('Parsed auth object:', parsedAuth);
    console.log('Auth structure check:');
    console.log('  - has current:', !!parsedAuth.current);
    console.log('  - has token:', !!parsedAuth.current?.token);
    console.log('  - token value:', parsedAuth.current?.token);
    console.log('  - isLoggedIn:', parsedAuth.isLoggedIn);
  } catch (e) {
    console.error('Error parsing auth from localStorage:', e);
  }
} else {
  console.log('❌ No auth found in localStorage');
}

// Check if storePersist works
try {
  // Assuming storePersist is available globally or can be imported
  const authViaStorePersist = JSON.parse(localStorage.getItem('auth'));
  console.log('Auth via storePersist equivalent:', authViaStorePersist);
} catch (e) {
  console.error('Error getting auth via storePersist:', e);
}

// Test axios headers
console.log('Current axios default headers:');
console.log('  - Authorization:', axios.defaults.headers.common['Authorization']);
console.log('  - x-auth-token:', axios.defaults.headers.common['x-auth-token']);

export { }; // make this a module
