// Direct fix script for UNSPSC and bin locations issues
const fs = require('fs');
const path = require('path');
const readline = require('readline');

console.log('Starting direct fix for EnhancedInventoryForm.jsx');

// File path
const filePath = path.join(__dirname, 'frontend', 'src', 'components', 'Inventory', 'EnhancedInventoryForm.jsx');
const backupPath = path.join(__dirname, 'frontend', 'src', 'components', 'Inventory', 'EnhancedInventoryForm.backup.jsx');

// Create backup
console.log('Creating backup...');
fs.copyFileSync(filePath, backupPath);
console.log(`Backup created at ${backupPath}`);

// Read the file
const fileContent = fs.readFileSync(filePath, 'utf8');

// Fix 1: Missing return statements
console.log('Fixing missing return statements...');
let fixedContent = fileContent
  .replace(/if \(!isMounted\.current\)\s+\n\s+\/\/ Clear the previous selection/g, 'if (!isMounted.current) return;\n    \n    // Clear the previous selection')
  .replace(/if \(!isMounted\.current\)\s+\n\s+\/\/ Clear previous selection/g, 'if (!isMounted.current) return;\n    \n    // Clear previous selection');

// Fix 2: UNSPSC code handling in handleItemMasterChange
console.log('Enhancing UNSPSC code handling...');
const unspscRegex = /\/\/ Explicitly handle UNSPSC code.*?if \(selected\.unspscCode && isMounted\.current\) {.*?console\.log\('Setting UNSPSC code from item master:.*?}/s;
const enhancedUnspscCode = `// Explicitly handle UNSPSC code - make this more direct
        if (selected.unspscCode && isMounted.current) {
          console.log('Setting UNSPSC code from item master:', selected.unspscCode);
          
          // Force the UNSPSC code to update
          setTimeout(() => {
            if (isMounted.current) {
              // Directly set the UNSPSC code value again to ensure it's applied
              formInstance.setFieldsValue({ 
                unspscCode: selected.unspscCode 
              });
              
              // Skip if this is the same code we've already fetched
              if (selected.unspscCode === lastFetchedUnspscCode.current) {
                console.log('Skipping duplicate UNSPSC fetch for item master selection');
              } else {
                // Check if we have a cached UNSPSC description
                const unspscCacheKey = \`unspsc_\${selected.unspscCode}\`;
                if (apiRequestCache.has(unspscCacheKey)) {
                  console.log('Using cached UNSPSC description for code:', selected.unspscCode);
                  setUnspscDescription(apiRequestCache.get(unspscCacheKey));
                  lastFetchedUnspscCode.current = selected.unspscCode;
                } else {
                  // Only fetch if not already loading
                  console.log('Fetching fresh UNSPSC description for code:', selected.unspscCode);
                  fetchUnspscDescription(selected.unspscCode);
                }
              }
            }
          }, 100);
        }`;

fixedContent = fixedContent.replace(unspscRegex, enhancedUnspscCode);

// Fix 3: Improve bin locations retrieval
console.log('Enhancing bin locations retrieval...');
const binLocationsRegex = /const handleStorageLocationChange = async \(value\) => {.*?if \(!isMounted\.current\) return;.*?setLoadingBinLocations\(true\);.*?try {.*?} catch \(error\) {.*?} finally {.*?}/s;
const enhancedBinLocationsCode = `const handleStorageLocationChange = async (value) => {
    console.log('Storage location selected:', value);
    
    if (!isMounted.current) return;
    
    // Clear the previous selection and bin locations
    setSelectedStorageLocation(value);
    setBinLocations([]);
    setSelectedBinLocation(null);
    
    // Clear bin location selection when storage location changes
    const formInstance = Form.useFormInstance();
    formInstance.setFieldsValue({ 
      binLocationId: undefined,
      binLocationText: '' 
    });
    
    if (!value) {
      setLoadingBinLocations(false);
      return; // Exit early if no storage location is selected
    }
    
    const binLocationsCacheKey = \`binLocations_\${value}\`;
    
    setLoadingBinLocations(true);
    console.log('Loading bin locations for storage location ID:', value);
    
    try {
      // Make direct API call to ensure we get fresh data
      console.log('Making direct API call to get bin locations');
      const binLocationsResponse = await warehouseService.getBinLocations(value);
      
      if (binLocationsResponse.success) {
        const binLocationsData = binLocationsResponse.data || [];
        console.log('Bin locations API call successful, received:', binLocationsData.length, 'items');
        
        // Store in cache for future use
        apiRequestCache.set(binLocationsCacheKey, binLocationsData);
        
        if (isMounted.current) {
          console.log('Setting bin locations state with', binLocationsData.length, 'items');
          setBinLocations(binLocationsData);
        }
      } else {
        console.error('Failed to load bin locations:', binLocationsResponse.message);
        message.error('Failed to load bin locations: ' + (binLocationsResponse.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error fetching bin locations:', error);
      if (isMounted.current) {
        message.error('Failed to load bin locations: ' + (error.message || 'Unknown error'));
      }
    } finally {
      if (isMounted.current) {
        setLoadingBinLocations(false);
      }
    }
  };`;

// Write the fixed content
console.log('Writing fixed content...');
fs.writeFileSync(filePath, fixedContent, 'utf8');

console.log('Fix completed. Please restart your development server to apply changes.');
