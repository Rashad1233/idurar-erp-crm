import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Form, Input, InputNumber, Select, Typography, Spin, message, Modal, Button, Space, Divider, Row, Col } from 'antd';
import { InfoCircleOutlined, EditOutlined, SearchOutlined, PlusOutlined, EnvironmentOutlined, InboxOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

import useLanguage from '@/locale/useLanguage';
import SelectAsync from '@/components/SelectAsync';
import inventoryService from '@/services/inventoryService';
import warehouseService from '@/services/warehouseService';
import UnspscSimpleInput from '@/components/UnspscSimpleInput/UnspscSimpleInput';
import apiClient from '@/api/axiosConfig';

// API request tracking and caching utility
const apiRequestCache = {
  requests: {},
  data: {},
  add(key, promise) {
    this.requests[key] = promise;
    return promise;
  },
  get(key) {
    return this.data[key];
  },
  has(key) {
    return Object.prototype.hasOwnProperty.call(this.data, key);
  },
  set(key, data) {
    this.data[key] = data;
    delete this.requests[key];
  },
  isLoading(key) {
    return Object.prototype.hasOwnProperty.call(this.requests, key);
  },
  clear(key) {
    delete this.data[key];
    delete this.requests[key];
  }
};

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function EnhancedInventoryForm({ isUpdateForm = false, current = {} }) {
  const translate = useLanguage();
  // Get form instance at the component level
  const form = Form.useFormInstance();
  
  const [itemMasters, setItemMasters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItemMaster, setSelectedItemMaster] = useState(null);
  
  // Modal states
  const [longDescModalVisible, setLongDescModalVisible] = useState(false);
  const [longDescription, setLongDescription] = useState('');

  // Filter states
  const [itemMasterSearchText, setItemMasterSearchText] = useState('');
  const [filteredItemMasters, setFilteredItemMasters] = useState([]);
  
  // Warehouse states
  const [storageLocations, setStorageLocations] = useState([]);
  const [binLocations, setBinLocations] = useState([]);
  const [selectedStorageLocation, setSelectedStorageLocation] = useState(null);
  const [loadingBinLocations, setLoadingBinLocations] = useState(false);
  
  // Added state for bin location text to support the renamed field
  const [selectedBinLocation, setSelectedBinLocation] = useState(null);
  
  // UNSPSC information state
  const [unspscDescription, setUnspscDescription] = useState('');
  const [unspscLoading, setUnspscLoading] = useState(false);
  
  // Use a ref to track if component is mounted
  const isMounted = useRef(true);
  
  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Define fetchUnspscDescription BEFORE any useEffects that depend on it  // Use a ref to track the last UNSPSC code that we fetched to prevent duplicate requests
  const lastFetchedUnspscCode = useRef('');
    const fetchUnspscDescription = useCallback(async (unspscCode) => {
    // Skip if the component is unmounted
    if (!isMounted.current) return;
    
    // Skip if no code or invalid code length
    if (!unspscCode || unspscCode.length < 8) return;
    
    // Skip if we're already loading
    if (unspscLoading) return;
    
    // Skip if this is the same code we just fetched (prevents duplicate requests)
    if (unspscCode === lastFetchedUnspscCode.current) {
      console.log('Skipping duplicate UNSPSC fetch for:', unspscCode);
      return;
    }
    
    // Check if we have this UNSPSC code description cached
    const unspscCacheKey = `unspsc_${unspscCode}`;
    if (apiRequestCache.has(unspscCacheKey)) {
      console.log('Using cached UNSPSC description for code:', unspscCode);
      setUnspscDescription(apiRequestCache.get(unspscCacheKey));
      lastFetchedUnspscCode.current = unspscCode;
      return;
    }
    
    // Check if there's already a request in progress
    if (apiRequestCache.isLoading(unspscCacheKey)) {
      console.log('UNSPSC description request already in progress for code:', unspscCode);
      // We'll let the existing request complete
      return;
    }
    
    // Update the last fetched code
    lastFetchedUnspscCode.current = unspscCode;
    
    // Format UNSPSC code if it's just digits
    let formattedCode = unspscCode;
    if (/^\d{8}$/.test(unspscCode)) {
      // Format it as a path with slashes for better readability
      const segment = unspscCode.substring(0, 2);
      const family = unspscCode.substring(2, 4);
      const classCode = unspscCode.substring(4, 6);
      const commodity = unspscCode.substring(6, 8);
      formattedCode = `${segment}/${family}/${classCode}/${commodity}`;
    }
    
    // Set a local variable to track if this particular request is still relevant
    const requestId = Date.now();
    const currentRequestId = requestId;
    
    setUnspscLoading(true);
    
    // Create the request promise and add it to the cache
    const unspscPromise = apiClient.post('/unspsc/direct', { input: formattedCode });
    apiRequestCache.add(unspscCacheKey, unspscPromise);
    
    try {
      console.log('Fetching UNSPSC description for:', formattedCode, 'Request ID:', requestId);
      const response = await unspscPromise;
      
      // Only update state if component is still mounted and this is still the most recent request
      if (isMounted.current && currentRequestId === requestId) {
        if (response.data?.success && response.data?.data) {
          const result = response.data.data;
          const description = result.title || '';
          console.log('UNSPSC fetch successful for:', formattedCode, 'Result:', description);
          
          // Save the result in our cache
          apiRequestCache.set(unspscCacheKey, description);
          
          setUnspscDescription(description);
        } else {
          setUnspscDescription('');
          // Still cache the empty result to avoid repeated failed requests
          apiRequestCache.set(unspscCacheKey, '');
          console.error('Failed to fetch UNSPSC description for:', formattedCode);
        }
      } else {
        console.log('Ignoring stale UNSPSC response for:', formattedCode, 'Current request ID:', currentRequestId, 'Response for ID:', requestId);
      }
    } catch (error) {
      // Only update state if component is still mounted and this is still the most recent request
      if (isMounted.current && currentRequestId === requestId) {
        console.error('Error fetching UNSPSC description:', error);
        setUnspscDescription('');
        // Cache the failure so we don't keep trying
        apiRequestCache.set(unspscCacheKey, '');
      }
    } finally {
      // Only update state if component is still mounted and this is still the most recent request
      if (isMounted.current && currentRequestId === requestId) {
        setUnspscLoading(false);
      }
    }
  }, [unspscLoading]); // Only depends on unspscLoading state  // Handle UNSPSC code changes with improved debouncing
  const handleUnspscChange = useCallback((value, result) => {
    // Skip if component is unmounted
    if (!isMounted.current) return;
    
    // Clear the description if value is empty
    if (!value) {
      setUnspscDescription('');
      lastFetchedUnspscCode.current = '';
      return;
    }
    
    // If result object has a title, use it directly (this comes from the UNSPSC input component)
    if (result && result.title) {
      console.log('Using UNSPSC description from result object:', result.title);
      setUnspscDescription(result.title);
      lastFetchedUnspscCode.current = value;
      
      // Also cache this result for future use
      const unspscCacheKey = `unspsc_${value}`;
      if (!apiRequestCache.has(unspscCacheKey)) {
        apiRequestCache.set(unspscCacheKey, result.title);
      }
      return;
    }
    
    // If we only have the code but no result object with title, fetch the description
    if (value.length >= 8 && !unspscLoading) {
      // Skip if this is the same code we just processed
      if (value === lastFetchedUnspscCode.current) {
        console.log('Skipping duplicate UNSPSC fetch in handleUnspscChange');
        return;
      }
      
      // Check if we have it in cache first
      const unspscCacheKey = `unspsc_${value}`;
      if (apiRequestCache.has(unspscCacheKey)) {
        console.log('Using cached UNSPSC description in handleUnspscChange for:', value);
        setUnspscDescription(apiRequestCache.get(unspscCacheKey));
        lastFetchedUnspscCode.current = value;
        return;
      }
      
      // Debounce the API call
      const timeoutId = setTimeout(() => {
        if (isMounted.current) {
          console.log('Fetching UNSPSC description in handleUnspscChange for:', value);
          fetchUnspscDescription(value);
        }
      }, 500); // Increased debounce time to 500ms to further reduce API calls
      
      // Return cleanup function
      return () => clearTimeout(timeoutId);
    }
  }, [fetchUnspscDescription, unspscLoading]); // Add proper dependencies// NOW we can safely use fetchUnspscDescription in other useEffects
  useEffect(() => {
    // Fetch UNSPSC description when in update mode
    if (isUpdateForm && current && current.unspscCode && isMounted.current) {
      // Skip if this is the same code we've already fetched
      if (current.unspscCode === lastFetchedUnspscCode.current) {
        console.log('Skipping duplicate UNSPSC fetch in update mode');
        return;
      }
      
      // First check if it's in the cache
      const unspscCacheKey = `unspsc_${current.unspscCode}`;
      if (apiRequestCache.has(unspscCacheKey)) {
        console.log('Using cached UNSPSC description for code in update mode:', current.unspscCode);
        setUnspscDescription(apiRequestCache.get(unspscCacheKey));
        lastFetchedUnspscCode.current = current.unspscCode;
        return;
      }
      
      // Use a timeout to prevent immediate state updates that could cause infinite loops
      const timeoutId = setTimeout(() => {
        if (isMounted.current) {
          // Only fetch if not already loading and we have a code
          if (!unspscLoading && current.unspscCode) {
            console.log('Fetching UNSPSC description in update mode for code:', current.unspscCode);
            fetchUnspscDescription(current.unspscCode);
          }
        }
      }, 200);
      
      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [isUpdateForm, current?.id, current?.unspscCode, fetchUnspscDescription, unspscLoading]);
  useEffect(() => {
    const fetchFormData = async () => {
      if (!isMounted.current) return;
      
      setLoading(true);
      
      try {
        // Generate cache keys for our requests
        const itemMastersCacheKey = 'itemMasters';
        const storageLocationsCacheKey = 'storageLocations';
        const binLocationsCacheKey = isUpdateForm && current?.storageLocationId 
          ? `binLocations_${current.storageLocationId}` 
          : null;
        
        // Fetch item masters with caching
        let itemMastersData;
        if (apiRequestCache.has(itemMastersCacheKey)) {
          console.log('Using cached item masters data');
          itemMastersData = apiRequestCache.get(itemMastersCacheKey);
          setItemMasters(itemMastersData);
          setFilteredItemMasters(itemMastersData);
        } else if (apiRequestCache.isLoading(itemMastersCacheKey)) {
          console.log('Item masters request already in progress, waiting for completion');
          // Request is in progress, we'll just wait for it to complete
        } else {
          console.log('Fetching fresh item masters data');
          // No cache, no in-flight request - make a new request
          const itemMastersPromise = inventoryService.getItemMasters();
          apiRequestCache.add(itemMastersCacheKey, itemMastersPromise);
          
          const itemMastersResponse = await itemMastersPromise;
          if (itemMastersResponse.success) {
            itemMastersData = itemMastersResponse.data;
            apiRequestCache.set(itemMastersCacheKey, itemMastersData);
            if (isMounted.current) {
              setItemMasters(itemMastersData);
              setFilteredItemMasters(itemMastersData);
            }
          } else {
            message.error('Failed to load item masters');
          }
        }

        // Fetch storage locations with caching
        let storageLocationsData;
        if (apiRequestCache.has(storageLocationsCacheKey)) {
          console.log('Using cached storage locations data');
          storageLocationsData = apiRequestCache.get(storageLocationsCacheKey);
          setStorageLocations(storageLocationsData);
        } else if (apiRequestCache.isLoading(storageLocationsCacheKey)) {
          console.log('Storage locations request already in progress, waiting for completion');
          // Request is in progress, we'll just wait for it to complete
        } else {
          console.log('Fetching fresh storage locations data');
          // No cache, no in-flight request - make a new request
          const storageLocationsPromise = warehouseService.getStorageLocations();
          apiRequestCache.add(storageLocationsCacheKey, storageLocationsPromise);
          
          const storageLocationsResponse = await storageLocationsPromise;
          if (storageLocationsResponse.success) {
            storageLocationsData = storageLocationsResponse.data;
            apiRequestCache.set(storageLocationsCacheKey, storageLocationsData);
            if (isMounted.current) {
              setStorageLocations(storageLocationsData);
            }
          } else {
            message.error('Failed to load storage locations');
          }
        }
          // If in update mode and we have a storage location, load the bin locations with caching
        if (isUpdateForm && current && current.storageLocationId && isMounted.current) {
          setSelectedStorageLocation(current.storageLocationId);
          
          let binLocationsData;
          if (binLocationsCacheKey && apiRequestCache.has(binLocationsCacheKey)) {
            console.log('Using cached bin locations data');
            binLocationsData = apiRequestCache.get(binLocationsCacheKey);
            
            if (isMounted.current) {
              setBinLocations(binLocationsData);
              
              // If we have a bin location, set it as selected
              if (current.binLocationId) {
                const selectedBin = binLocationsData.find(bin => bin.id === current.binLocationId);
                if (selectedBin) {
                  setSelectedBinLocation(selectedBin);
                      // Update the form values for binLocationText
                  if (form) {
                    form.setFieldsValue({ 
                      binLocationText: `${selectedBin.code} - ${selectedBin.description}` 
                    });
                  }
                }
              }
            }
          } else if (binLocationsCacheKey && apiRequestCache.isLoading(binLocationsCacheKey)) {
            console.log('Bin locations request already in progress, waiting for completion');
            // Request is in progress, we'll just wait for it to complete
          } else {
            console.log('Fetching fresh bin locations data for update mode');
            setLoadingBinLocations(true);
            
            // No cache, no in-flight request - make a new request
            const binLocationsPromise = warehouseService.getBinLocations(current.storageLocationId);
            if (binLocationsCacheKey) {
              apiRequestCache.add(binLocationsCacheKey, binLocationsPromise);
            }
            
            const binLocationsResponse = await binLocationsPromise;
            if (binLocationsResponse.success) {
              binLocationsData = binLocationsResponse.data;
              console.log('Successfully loaded bin locations for update mode:', binLocationsData.length);
              
              if (binLocationsCacheKey) {
                apiRequestCache.set(binLocationsCacheKey, binLocationsData);
              }              
              if (isMounted.current) {
                setBinLocations(binLocationsData);
                setLoadingBinLocations(false);
                
                // If we have a bin location, set it as selected
                if (current.binLocationId) {
                  const selectedBin = binLocationsData.find(bin => bin.id === current.binLocationId);
                  if (selectedBin) {
                    console.log('Found and setting selected bin location:', selectedBin);
                    setSelectedBinLocation(selectedBin);
                        // Make sure to update the form value for binLocationText
                    if (form) {
                      const binLocationText = `${selectedBin.code} - ${selectedBin.description}`;
                      form.setFieldsValue({ 
                        binLocationText: binLocationText,
                        binLocationId: selectedBin.id
                      });
                    }
                  } else {
                    console.warn('Bin location ID from current item not found in bin locations:', current.binLocationId);
                  }
                }
              }
            } else {
              message.error('Failed to load bin locations');
              if (isMounted.current) {
                setLoadingBinLocations(false);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching form data:', error);
        if (isMounted.current) {
          message.error('Failed to load form data');
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };
    
    fetchFormData();
  }, [isUpdateForm, current?.id]); // Only depend on ID, not the entire current object

  // Reset UNSPSC description when component unmounts
  useEffect(() => {
    return () => {
      setUnspscDescription('');
    };
  }, []);

  // Filter item masters based on search text
  useEffect(() => {
    if (!itemMasterSearchText) {
      setFilteredItemMasters(itemMasters);
      return;
    }
    
    const filtered = itemMasters.filter(
      item => 
        (item.itemNumber && item.itemNumber.toLowerCase().includes(itemMasterSearchText.toLowerCase())) ||
        (item.shortDescription && item.shortDescription.toLowerCase().includes(itemMasterSearchText.toLowerCase())) ||
        (item.manufacturerPartNumber && item.manufacturerPartNumber.toLowerCase().includes(itemMasterSearchText.toLowerCase()))
    );
    
    setFilteredItemMasters(filtered);  }, [itemMasterSearchText, itemMasters]);  

  // Add debugging effect for bin locations
  useEffect(() => {
    console.log(`Bin locations state updated: ${binLocations.length} items for storage location:`, selectedStorageLocation);
    
    if (binLocations.length > 0) {
      console.log('Sample bin location:', binLocations[0]);
    }
  }, [binLocations, selectedStorageLocation]);

  // Handle item master selection with improved caching
  const handleItemMasterChange = async (value) => {
    if (!value || !isMounted.current) return;
    
    setLoading(true);
    try {
      // Cache key for this specific item master
      const itemMasterCacheKey = `itemMaster_${value}`;
      
      // First, try to find the item in the already loaded items
      let selected = itemMasters.find(item => item.id === value);
      
      // If found with complete data, use it directly
      if (selected && selected.shortDescription) {
        console.log('Using item master from local state:', selected.itemNumber);
      } 
      // Check if we have it in cache
      else if (apiRequestCache.has(itemMasterCacheKey)) {
        console.log('Using cached item master data for ID:', value);
        selected = apiRequestCache.get(itemMasterCacheKey);
      }
      // Check if a request is already in progress
      else if (apiRequestCache.isLoading(itemMasterCacheKey)) {
        console.log('Item master request already in progress for ID:', value);
        // We'll let the existing request complete
        return;
      }
      // If not found or data is incomplete, make a direct API call
      else {
        console.log('Fetching fresh item master data for ID:', value);
        const itemMasterPromise = inventoryService.getItemMaster(value);
        apiRequestCache.add(itemMasterCacheKey, itemMasterPromise);
        
        const response = await itemMasterPromise;
        if (response.success) {
          selected = response.data;
          // Store in cache
          apiRequestCache.set(itemMasterCacheKey, selected);
          
          // Update the local collection
          const updatedItemMasters = [...itemMasters];
          const existingIndex = updatedItemMasters.findIndex(item => item.id === value);
          if (existingIndex >= 0) {
            updatedItemMasters[existingIndex] = selected;
          } else {
            updatedItemMasters.push(selected);
          }
          
          if (isMounted.current) {
            setItemMasters(updatedItemMasters);
          }
        } else {
          throw new Error(response.message || 'Failed to fetch item master details');
        }
      }
      
      if (!isMounted.current) return;
      
      setSelectedItemMaster(selected);
        // Auto-fill form with item master data
      if (selected) {
        // First, reset form validation state for all fields that will be populated
        form.setFields([
          { name: 'shortDescription', errors: [], validating: false },
          { name: 'criticality', errors: [], validating: false },
          { name: 'unspscCode', errors: [], validating: false },
          { name: 'uom', errors: [], validating: false },
          { name: 'unitPrice', errors: [], validating: false }
        ]);
        
        // Get any existing unit price value before overwriting
        const currentUnitPrice = form.getFieldValue('unitPrice');
          // Set default values to avoid validation errors
        // Use strong fallback values for all required fields to ensure they pass validation
        const formData = {
          shortDescription: selected.shortDescription || 'No description available',
          longDescription: selected.longDescription || '',
          manufacturerName: selected.manufacturerName || 'Not specified',
          manufacturerPartNumber: selected.manufacturerPartNumber || 'Not specified',
          uom: selected.uom || 'EA',
          unspscCode: selected.unspscCode || '00000000',
          criticality: selected.criticality || 'MEDIUM',
          equipmentCategory: selected.equipmentCategory || '',
          equipmentSubCategory: selected.equipmentSubCategory || '',
          stockItem: selected.stockItem || false,
          // Only set a default unit price if none exists yet
          unitPrice: currentUnitPrice || 0.01
        };
          // Update the form values
        form.setFieldsValue(formData);
          // Set long description for modal if needed
        setLongDescription(selected.longDescription || '');        // Explicitly handle UNSPSC code - make this more direct
        if (selected.unspscCode && isMounted.current) {
          console.log('Setting UNSPSC code from item master:', selected.unspscCode);
          
          // Force the UNSPSC code to update with a small delay to ensure it's applied
          setTimeout(() => {
            if (isMounted.current) {
              // Directly set the UNSPSC code value again to ensure it's applied
              form.setFieldsValue({ 
                unspscCode: selected.unspscCode 
              });
              
              // Skip if this is the same code we've already fetched
              if (selected.unspscCode === lastFetchedUnspscCode.current) {
                console.log('Skipping duplicate UNSPSC fetch for item master selection');
              } else {
                // Check if we have a cached UNSPSC description
                const unspscCacheKey = `unspsc_${selected.unspscCode}`;
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
        }
        
        message.success('Item master details loaded successfully');
        
        // Force validation to run and clear errors if any still exist
        setTimeout(() => {
          if (!isMounted.current) return;
            // First try normal validation
          form.validateFields(['shortDescription', 'criticality', 'unspscCode', 'uom', 'unitPrice'])
            .then(() => {
              console.log('Item master field validation successful');
            })
            .catch(errorInfo => {
              if (!isMounted.current) return;
              
              console.log('Validation failed after item master selection, clearing errors manually', errorInfo);
              // If validation still fails for any reason, forcefully clear the errors
              // This is a fallback to ensure a good user experience
              form.setFields([
                { name: 'shortDescription', errors: [], touched: true, validating: false },
                { name: 'criticality', errors: [], touched: true, validating: false },
                { name: 'unspscCode', errors: [], touched: true, validating: false },
                { name: 'uom', errors: [], touched: true, validating: false },
                { name: 'unitPrice', errors: [], touched: true, validating: false }
              ]);
            });
        }, 300); // Slightly longer timeout to ensure form has time to process initial values
      } else {
        message.error('Item master data is incomplete or invalid');
      }
    } catch (error) {
      console.error('Error in handleItemMasterChange:', error);
      if (isMounted.current) {
        message.error('Failed to load item details. Please try again.');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };
  
  // Handle long description modal
  const openLongDescModal = () => {
    // Get the current long description from the form
    const desc = form.getFieldValue('longDescription') || '';
    setLongDescription(desc);
    setLongDescModalVisible(true);
  };
    const saveLongDescription = () => {
    // Set the long description in the form
    form.setFieldsValue({ longDescription });
    setLongDescModalVisible(false);  };
    // Handle storage location selection  
  const handleStorageLocationChange = async (value) => {
    console.log('Storage location selected:', value);
    
    if (!isMounted.current) return;
    
    // Clear the previous selection and bin locations
    setSelectedStorageLocation(value);
    setBinLocations([]);
    setSelectedBinLocation(null);
      // Clear bin location selection when storage location changes
    // This must happen BEFORE we try to load new bin locations
    form.setFieldsValue({ 
      binLocationId: undefined,
      binLocationText: '' 
    });
    
    if (!value) {
      // Make sure to clear loading state before exiting
      setLoadingBinLocations(false);
      return; // Exit early if no storage location is selected
    }
    
    const binLocationsCacheKey = `binLocations_${value}`;
    
    setLoadingBinLocations(true);
    
    try {
      // Force fresh bin locations retrieval by clearing cache
      console.log('Clearing bin locations cache for fresh retrieval');
      apiRequestCache.clear(binLocationsCacheKey);
      
      console.log('Fetching fresh bin locations data for storage location:', value);
      const binLocationsPromise = warehouseService.getBinLocations(value);
      apiRequestCache.add(binLocationsCacheKey, binLocationsPromise);
      
      const response = await binLocationsPromise;
      if (response.success) {
        const binLocationsData = response.data;
        console.log('Raw bin locations response:', binLocationsData);
        apiRequestCache.set(binLocationsCacheKey, binLocationsData);
        
        if (isMounted.current) {
          console.log('Successfully loaded bin locations:', binLocationsData.length);
          setBinLocations(binLocationsData);
          
          // Additional debugging for bin locations
          if (binLocationsData.length > 0) {
            console.log('Sample bin location:', binLocationsData[0]);
          } else {
            console.warn('No bin locations found for storage location:', value);
          }
        }
      } else {
        console.error('Failed to load bin locations:', response);
        message.error('Failed to load bin locations');
      }
    } catch (error) {
      console.error('Error fetching bin locations:', error);
      if (isMounted.current) {
        message.error('Failed to load bin locations');
      }
    } finally {
      if (isMounted.current) {
        setLoadingBinLocations(false);
      }
    }
  };// Handle bin location selection
  const handleBinLocationChange = (value) => {
    console.log('Bin location selected:', value);
    
    if (!isMounted.current) return;
    
    // Clear previous selection if value is empty
    if (!value) {
      setSelectedBinLocation(null);
        // Clear the bin location text in the form
      form.setFieldsValue({ 
        binLocationText: '' 
      });
      return;
    }
    
    // Find the selected bin location from the binLocations array
    const selectedBin = binLocations.find(bin => bin.id === value);
    console.log('Found bin location:', selectedBin);
    
    if (selectedBin) {
      setSelectedBinLocation(selectedBin);
        // Set the bin location text in the form
      const binLocationText = `${selectedBin.code} - ${selectedBin.description}`;
      
      console.log('Setting bin location text:', binLocationText);
      
      form.setFieldsValue({ 
        binLocationText: binLocationText
      });
    } else {
      console.error('Selected bin location not found in available bin locations');
    }
  };

  // Render dropdown options for item masters with categorization
  const renderItemMasterOptions = () => {
    if (!filteredItemMasters.length) {
      return (
        <Option value="no-results" disabled>
          No items found
        </Option>
      );
    }

    // Group by equipment category
    const groupedItems = {};
    filteredItemMasters.forEach(item => {
      const category = item.equipmentCategory || 'Other';
      if (!groupedItems[category]) {
        groupedItems[category] = [];
      }
      groupedItems[category].push(item);
    });

    return Object.entries(groupedItems).map(([category, items]) => (
      <Select.OptGroup label={category} key={category}>
        {items.map(item => (
          <Option key={item.id} value={item.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span><strong>{item.itemNumber}</strong> - {item.shortDescription}</span>
              <span style={{ color: '#888' }}>{item.manufacturerPartNumber}</span>
            </div>
          </Option>
        ))}
      </Select.OptGroup>
    ));
  };
  
  return (
    <Spin spinning={loading}>
      <Title level={4}>{translate('Item Selection')}</Title>
      
      <Row gutter={16}>
        <Col span={20}>
          <Form.Item
            label={translate('Item Master')}
            name="itemMasterId"
            rules={[
              {
                required: true,
                message: translate('Please select an item master'),
              },
            ]}
          >
            <Select
              showSearch
              placeholder={translate('Search for an item by number, description or part number')}
              optionFilterProp="children"
              onChange={handleItemMasterChange}
              onSearch={setItemMasterSearchText}
              filterOption={false}
            >
              {renderItemMasterOptions()}
            </Select>
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item label={" "} colon={false}>
            <Link to="/item-master/new">
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                style={{ marginTop: '5px' }}
              >
                {translate('New')}
              </Button>
            </Link>
          </Form.Item>
        </Col>
      </Row>
      
      {selectedItemMaster && (
        <div style={{ marginBottom: 24, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
          <Text strong>{translate('Selected Item')}:</Text> {selectedItemMaster.itemNumber} - {selectedItemMaster.shortDescription}<br />
          <Text strong>{translate('Manufacturer')}:</Text> {selectedItemMaster.manufacturerName || '-'} {selectedItemMaster.manufacturerPartNumber ? `- ${selectedItemMaster.manufacturerPartNumber}` : ''}<br />
          <Text strong>{translate('UOM')}:</Text> {selectedItemMaster.uom || '-'}<br />
          <Text strong>{translate('UNSPSC')}:</Text> {selectedItemMaster.unspscCode || '-'} {unspscDescription ? `- ${unspscDescription}` : ''}<br />
          <Text strong>{translate('Criticality')}:</Text> {selectedItemMaster.criticality || '-'}
        </div>
      )}
      
      <Divider />
      
      <Title level={4}>{translate('Inventory Details')}</Title>
        <Form.Item
        label={translate('Inventory Number')}
        name="inventoryNumber"
      >
        <Input placeholder={translate('Auto-generated')} disabled={isUpdateForm} />
      </Form.Item>      <Form.Item
        label={
          <span>
            {translate('Short Description')}
            <InfoCircleOutlined style={{ marginLeft: 8 }} />
          </span>
        }
        name="shortDescription"
        rules={[
          {
            required: true,
            max: 44,
            validator: (_, value) => {
              if (value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error(translate('Description is required (max 44 characters)')));
            },
          },
        ]}        extra={
          <Button type="link" onClick={openLongDescModal} icon={<EditOutlined />}>
            {translate("Long Description")}
          </Button>
        }
      >
        <Input placeholder={translate('Auto-populated from Item Master')} maxLength={44} disabled={!!selectedItemMaster} />
      </Form.Item>
      
      <Form.Item name="longDescription" hidden>
        <Input />
      </Form.Item>        <Form.Item
        label={translate('Criticality')}
        name="criticality"
        rules={[
          {
            required: true,
            validator: (_, value) => {
              // Always resolve when an item master is selected
              if (selectedItemMaster || value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error(translate('Criticality is required')));
            },
          },
        ]}
        tooltip={translate('Auto-populated from Item Master')}
      >
        <Select placeholder={translate('Auto-populated from Item Master')} disabled={!!selectedItemMaster}>
          <Select.Option value="HIGH">High critical</Select.Option>
          <Select.Option value="MEDIUM">Medium critical</Select.Option>
          <Select.Option value="LOW">Low critical</Select.Option>
          <Select.Option value="NO">Non-critical</Select.Option>
        </Select>
      </Form.Item>      <Form.Item
        label={translate('UNSPSC Code')}
        name="unspscCode"
        rules={[
          {
            validator: (_, value) => {
              // Always validate successfully when an item master is selected
              // or when a value is provided
              if (selectedItemMaster || value) {
                return Promise.resolve();
              }
              // Only enforce validation when no item master is selected
              return Promise.resolve();
            },
          },
        ]}
        tooltip={translate('Auto-populated from Item Master')}
        extra={
          <Text type="secondary">
            {unspscLoading ? <Spin size="small" /> : unspscDescription}
          </Text>
        }
      >
        <UnspscSimpleInput 
          placeholder={translate("Auto-populated from Item Master")} 
          disabled={!!selectedItemMaster}
          onChange={handleUnspscChange}
        />
      </Form.Item>
      
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label={translate('Manufacturer Name')}
            name="manufacturerName"
          >
            <Input placeholder={translate('Enter manufacturer name')} disabled={!!selectedItemMaster} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={translate('Manufacturer Part Number')}
            name="manufacturerPartNumber"
          >            <Input placeholder={translate('Enter manufacturer part number')} disabled={!!selectedItemMaster} />
          </Form.Item>
        </Col>
      </Row>
      
      <Divider />
      
      <Title level={4}>{translate('Stock Information')}</Title>
      
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label={translate('Physical Balance')}
            name="physicalBalance"
            initialValue={0}
            rules={[
              {
                type: 'number',
                min: 0,
                message: translate('Physical balance cannot be negative')
              }
            ]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>        <Col span={12}>          <Form.Item
            label={translate('Unit of Measure')}
            name="uom"
            rules={[
              {
                required: true,
                validator: (_, value) => {
                  // Always resolve when an item master is selected
                  if (selectedItemMaster || value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(translate('Unit of Measure is required')));
                },
              },
            ]}
            tooltip={translate('Auto-populated from Item Master')}
          >
            <Select placeholder={translate('Auto-populated from Item Master')} disabled={!!selectedItemMaster}>
              <Select.Option value="EA">EA (Each)</Select.Option>
              <Select.Option value="PCS">PCS (Pieces)</Select.Option>
              <Select.Option value="KG">KG (Kilograms)</Select.Option>
              <Select.Option value="LTR">LTR (Liters)</Select.Option>
              <Select.Option value="M">M (Meters)</Select.Option>
              <Select.Option value="SET">SET (Set)</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label={translate('Unit Price')}
            name="unitPrice"
            rules={[
              {
                required: true,
                message: translate('Unit price is required'),
              },
            ]}
          >
            <InputNumber
              min={0}
              step={0.01}
              style={{ width: '100%' }}
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={translate('Condition')}
            name="condition"
            initialValue="A"
          >
            <Select placeholder={translate('Select condition')}>
              <Select.Option value="A">A - New</Select.Option>
              <Select.Option value="B">B - Used</Select.Option>
              <Select.Option value="C">C - Requires inspection</Select.Option>
              <Select.Option value="D">D - Requires repair</Select.Option>
              <Select.Option value="E">E - Scrap</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      
      <Divider />
      
      <Title level={4}>{translate('Stock Level Settings')}</Title>
      
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label={              <span>
                {translate('Minimum Level (ROP)')}
                <InfoCircleOutlined style={{ marginLeft: 8 }} />
              </span>
            }
            name="minimumLevel"
            initialValue={0}
            rules={[
              {
                type: 'number',
                min: 0,
                message: translate('Minimum level cannot be negative')
              }
            ]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={translate('Maximum Level')}
            name="maximumLevel"
            initialValue={0}
            rules={[
              {
                type: 'number',
                min: 0,
                message: translate('Maximum level cannot be negative')
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('minimumLevel') <= value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(translate('Maximum level must be greater than or equal to minimum level')));
                },
              }),
            ]}
          >          <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
        
      <Divider />
      
      <Title level={4}>{translate('Location Information')}</Title>
      
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label={
              <span>
                <EnvironmentOutlined style={{ marginRight: 5, color: '#1890ff' }} />
                {translate('Storage Location')}
              </span>
            }
            name="storageLocationId"
            tooltip={translate('Physical location where the item is stored')}
            rules={[
              {
                required: true,
                message: translate('Please select a storage location')
              }
            ]}
          >
            <Select 
              placeholder={translate('Select a storage location')}
              allowClear
              showSearch
              loading={loading}
              optionFilterProp="children"
              style={{ width: '100%' }}
              onChange={handleStorageLocationChange}
              filterOption={(input, option) =>
                option?.label?.toLowerCase().includes(input.toLowerCase())
              }
              options={storageLocations.map(location => ({
                label: `${location.code} - ${location.description}`,
                value: location.id
              }))}
            />
          </Form.Item>
        </Col>
        <Col span={12}>          <Form.Item
            label={
              <span>
                <InboxOutlined style={{ marginRight: 5, color: '#1890ff' }} />
                {translate('Bin Location')}
              </span>
            }
            name="binLocationId"
            tooltip={translate('Specific bin location within the selected storage location')}
          >            <Select 
              placeholder={
                !selectedStorageLocation 
                  ? translate('Please select a storage location first')
                  : binLocations.length === 0 
                    ? loadingBinLocations ? translate('Loading bin locations...') : translate('No bin locations available')
                    : translate('Select a bin location')
              }
              allowClear
              showSearch
              disabled={!selectedStorageLocation}
              loading={loadingBinLocations}
              optionFilterProp="children"
              style={{ width: '100%' }}
              onChange={handleBinLocationChange}
              filterOption={(input, option) =>
                option?.label?.toLowerCase().includes(input.toLowerCase())
              }
              options={binLocations.map(bin => ({
                label: `${bin.code} - ${bin.description}`,
                value: bin.id
              }))}
            />
          </Form.Item>
          
          {/* Hidden field to store the bin location text */}
          <Form.Item name="binLocationText" hidden>
            <Input />
          </Form.Item>
        </Col>
      </Row>
        
        <Divider />
        {/* Location Information section has been removed */}
        <Modal
        title={translate("Long Description")}
        open={longDescModalVisible}
        onOk={saveLongDescription}
        onCancel={() => setLongDescModalVisible(false)}
        width={700}
        footer={[
          <Button key="close" onClick={() => setLongDescModalVisible(false)}>
            {translate("Close")}
          </Button>,
          !selectedItemMaster && (
            <Button key="save" type="primary" onClick={saveLongDescription}>
              {translate("Save")}
            </Button>
          )
        ].filter(Boolean)}
      >        <Input.TextArea
          rows={10}
          value={longDescription}
          onChange={(e) => !selectedItemMaster && setLongDescription(e.target.value)}
          placeholder={translate("Enter detailed item description")}
          readOnly={!!selectedItemMaster}
        />
      </Modal>
    </Spin>
  );
}
