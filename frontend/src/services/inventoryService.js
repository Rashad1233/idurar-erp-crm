import axios from 'axios';
import { API_BASE_URL } from '@/config/serverApiConfig';
import errorHandler from '@/request/errorHandler';
import successHandler from '@/request/successHandler';
import storePersist from '@/redux/storePersist';

// Include auth token in requests
function includeToken() {
  axios.defaults.baseURL = API_BASE_URL;
  axios.defaults.withCredentials = true;
  const auth = storePersist.get('auth');

  if (auth && auth.current && auth.current.token) {
    // Ensure the token is included in both header formats for compatibility
    axios.defaults.headers.common['Authorization'] = `Bearer ${auth.current.token}`;
    axios.defaults.headers.common['x-auth-token'] = auth.current.token;
    console.log('Auth token included in request');
  } else {
    console.error('No authentication token found. User must be logged in to perform this action.');
    throw new Error('Authentication required');
  }
}

const inventoryService = {
  // Item Master API calls
  getItemMasters: async (options = {}) => {
    try {
      includeToken();
      let query = '?';
      for (var key in options) {
        query += key + '=' + options[key] + '&';
      }      query = query.slice(0, -1); // Remove trailing &
        console.log('🔍 Fetching item masters with URL:', '/item-master' + (Object.keys(options).length ? query : ''));
      
      // Using the correct API endpoint path
      const response = await axios.get('/item-master' + (Object.keys(options).length ? query : ''));
      
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching item masters:', error);
      return errorHandler(error);
    }
  },

  // Get only approved items eligible for inventory operations
  getApprovedItemsForInventory: async (options = {}) => {
    try {
      includeToken();
      let query = '?';
      for (var key in options) {
        query += key + '=' + options[key] + '&';
      }
      query = query.slice(0, -1); // Remove trailing &
      
      console.log('🔍 Fetching approved items for inventory with URL:', '/inventory-validation/approved-items' + (Object.keys(options).length ? query : ''));
      
      const response = await axios.get('/inventory-validation/approved-items' + (Object.keys(options).length ? query : ''));
      
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching approved items for inventory:', error);
      return errorHandler(error);
    }
  },
    getItemMaster: async (id) => {
    try {
      includeToken();
      console.log(`Fetching item master details for ID: ${id}`);
      const response = await axios.get(`/item-master/${id}`);
      
      // Add extra validation for the response
      if (!response.data || !response.data.success) {
        console.error('Item master API response indicates failure:', response.data);
        return {
          success: false,
          message: response.data?.message || 'Failed to retrieve item master data',
          data: null
        };
      }
      
      // Validate the item data is complete
      const itemData = response.data.data;
      if (!itemData || !itemData.id) {
        console.error('Item master data is incomplete:', itemData);
        return {
          success: false,
          message: 'Retrieved item master data is incomplete',
          data: null
        };
      }
      
      console.log('Successfully retrieved item master:', itemData.id);
      return response.data;
    } catch (error) {
      console.error('Error fetching item master:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      return errorHandler(error);
    }
  },
  
  createItemMaster: async (itemData) => {
    try {
      includeToken();
      const response = await axios.post('/item-master', itemData);
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },
  
  updateItemMaster: async (id, itemData) => {
    try {
      includeToken();
      const response = await axios.put(`/item-master/${id}`, itemData);
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },
  
  submitItemMaster: async (id) => {
    try {
      includeToken();
      const response = await axios.put(`/item-master/${id}/submit`);
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },
  
  reviewItemMaster: async (id, { status, comments }) => {
    try {
      includeToken();
      const response = await axios.put(`/item-master/${id}/review`, { status, comments });
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },
  
  deleteItemMaster: async (id) => {
    try {
      includeToken();
      const response = await axios.delete(`/item-master/${id}`);
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },
    // Inventory API calls with enhanced search
  getInventoryItems: async (options = {}) => {
    try {
      includeToken();
      
      // First try the simple inventory route which has better compatibility
      try {
        console.log('🔍 Trying simple inventory route first...');
        const simpleResponse = await axios.get('/simple-inventory');
        console.log('✅ Simple inventory route worked!');
        return simpleResponse.data;
      } catch (simpleError) {
        console.warn('⚠️ Simple inventory route failed, falling back to original route');
        console.error(simpleError);
        
        // Fall back to original route with query parameters
        let query = '?';
        
        // Support for advanced search parameters
        const searchParams = [
          'inventoryNumber', 'description', 'manufacturerName', 'unspscCode',
          'criticality', 'condition', 'warehouse', 'belowMinimum'
        ];
        
        // Build query string from allowed parameters
        for (const key of searchParams) {
          if (options[key]) {
            query += `${key}=${encodeURIComponent(options[key])}&`;
          }
        }
        
        // Special handling for stock level filters
        if (options.stockLevel) {
          query += `stockLevel=${options.stockLevel}&`;
        }
        
        // Add pagination params if provided
        if (options.page) query += `page=${options.page}&`;
        if (options.limit) query += `limit=${options.limit}&`;
        
        // Remove trailing &
        query = query.endsWith('&') ? query.slice(0, -1) : query;
        
        const response = await axios.get('/inventory' + (query !== '?' ? query : ''));
        return response.data;
      }
    } catch (error) {
      return errorHandler(error);
    }
  },
    getInventoryItem: async (id) => {
    try {
      includeToken();
      
      // First try the simple inventory detail route
      try {
        console.log(`🔍 Trying simple inventory detail route for ID: ${id}`);
        const simpleResponse = await axios.get(`/simple-inventory/${id}`);
        console.log('✅ Simple inventory detail route worked!');
        return simpleResponse.data;
      } catch (simpleError) {
        console.warn('⚠️ Simple inventory detail route failed, falling back to original route');
        console.error(simpleError);
        
        // Fall back to original route
        const response = await axios.get(`/inventory/${id}`);
        return response.data;
      }
    } catch (error) {
      return errorHandler(error);
    }
  },createInventory: async (inventoryData) => {
    try {
      includeToken();
      // Add some debugging to help with validation issues
      console.log('Creating inventory with data:', JSON.stringify(inventoryData, null, 2));
      
      // Validate required fields before submitting
      const requiredFields = ['itemMasterId', 'unitPrice'];
      const missingFields = requiredFields.filter(field => !inventoryData[field]);
      
      if (missingFields.length > 0) {
        console.error('Inventory data missing required fields:', missingFields);
        return {
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`
        };
      }
      
      // Add additional validation for auth
      const auth = storePersist.get('auth');
      if (!auth || !auth.current || !auth.current.token) {
        console.error('User authentication required');
        return {
          success: false,
          message: 'User must be authenticated to create inventory items'
        };
      }        // Filter out non-database fields to prevent validation errors
      // Keep only fields that match the Inventory model
      const dataToSend = {
        itemMasterId: inventoryData.itemMasterId,
        unitPrice: inventoryData.unitPrice,
        physicalBalance: inventoryData.physicalBalance || 0,
        condition: inventoryData.condition || 'A',
        minimumLevel: inventoryData.minimumLevel || 0,
        maximumLevel: inventoryData.maximumLevel || 0
      };
      
      // Add optional fields only if they have values
      if (inventoryData.storageLocationId) dataToSend.storageLocationId = inventoryData.storageLocationId;
      if (inventoryData.binLocationId) dataToSend.binLocationId = inventoryData.binLocationId;
      if (inventoryData.binLocationText) dataToSend.binLocationText = inventoryData.binLocationText;
      if (inventoryData.warehouse) dataToSend.warehouse = inventoryData.warehouse;
      if (inventoryData.serialNumber) dataToSend.serialNumber = inventoryData.serialNumber;
      
      // Note: We're NOT sending fields from ItemMaster that aren't in the Inventory model
      // (shortDescription, criticality, unspscCode, manufacturerName, etc.) as these are 
      // retrieved from the ItemMaster relationship on the backend
      
      console.log('Sending inventory data to server:', JSON.stringify(dataToSend, null, 2));
      const response = await axios.post('/inventory', dataToSend);
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      return response.data;    } catch (error) {      
      console.error('Error in createInventory:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        
        // Handle specific error cases
        if (error.response.data && error.response.data.errors) {
          const errorFields = error.response.data.errors.map(e => `${e.field}: ${e.message}`).join(', ');
          return {
            success: false,
            message: `Validation error: ${errorFields}`
          };
        }
        
        // Handle lastUpdatedById error
        if (error.response.data && error.response.data.message && 
            error.response.data.message.includes('lastUpdatedById cannot be null')) {
          console.error('lastUpdatedById error detected - this is a user authentication issue');
          return {
            success: false,
            message: 'Authentication error: User ID not properly recognized. Please log out and log in again, then try again.'
          };
        }
        
        // Show more detailed error message to the user
        if (error.response.data && error.response.data.message) {
          return {
            success: false,
            message: `Server error: ${error.response.data.message}`,
            details: error.response.data.errors || []
          };
        }
      }
      return errorHandler(error);
    }
  },
  updateInventory: async (id, inventoryData) => {
    try {
      includeToken();
      // Add debugging for update operation too
      console.log('Updating inventory with data:', JSON.stringify(inventoryData, null, 2));
      
      // Validate required fields before submitting
      const requiredFields = ['itemMasterId', 'unitPrice', 'shortDescription', 'criticality', 'unspscCode', 'uom'];
      const missingFields = requiredFields.filter(field => !inventoryData[field]);
      
      if (missingFields.length > 0) {
        console.error('Inventory update data missing required fields:', missingFields);
        return {
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`
        };
      }
      
      const response = await axios.put(`/inventory/${id}`, inventoryData);
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      return response.data;
    } catch (error) {
      console.error('Error in updateInventory:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        
        // Handle specific case of lastUpdatedById error
        if (error.response.data && error.response.data.message && 
            error.response.data.message.includes('lastUpdatedById cannot be null')) {
          console.error('lastUpdatedById error detected - this is handled on the server side and should not occur');
          return {
            success: false,
            message: 'Server error: User ID not properly applied to inventory record. Please try again or contact support.'
          };
        }
      }
      return errorHandler(error);
    }
  },
  deleteInventory: async (id) => {
    try {
      // Debug logging for delete attempt
      console.group(`🗑️ DELETE INVENTORY ITEM ${id}`);
      console.log('Starting delete operation for inventory item:', id);
      console.log('Timestamp:', new Date().toISOString());
      
      // Log to browser debugger if available
      if (window.erpDebugger) {
        window.erpDebugger.logDeleteAttempt(id);
        window.erpDebugger.logInventoryAction('DELETE_START', { itemId: id });
      }
      
      includeToken();      console.log('✅ Auth token included');
      console.log('API Base URL:', axios.defaults.baseURL);
      console.log('Request URL:', `${axios.defaults.baseURL}/inventory/${id}`);
      console.log('Request headers:', axios.defaults.headers.common);
      
      const startTime = performance.now();
      const response = await axios.delete(`/inventory/${id}`);
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.log('✅ DELETE REQUEST COMPLETED');
      console.log('Response status:', response.status);
      console.log('Response statusText:', response.statusText);
      console.log('Response headers:', response.headers);
      console.log('Response data:', response.data);
      console.log('Request duration:', `${duration.toFixed(2)}ms`);
      
      // Log success to debugger
      if (window.erpDebugger) {
        window.erpDebugger.logDeleteSuccess(id);
        window.erpDebugger.logInventoryAction('DELETE_SUCCESS', { 
          itemId: id, 
          duration: duration.toFixed(2),
          response: response.data 
        });
      }
      
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      
      console.log('✅ SUCCESS HANDLER COMPLETED');
      console.groupEnd();
      
      return response.data;
    } catch (error) {
      console.error('❌ DELETE OPERATION FAILED');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
        if (error.response) {
        console.error('HTTP Response Error Details:');
        console.error('- Status:', error.response.status);
        console.error('- Status Text:', error.response.statusText);
        console.error('- Headers:', error.response.headers);
        console.error('- Data:', error.response.data);
        console.error('- Config:', error.response.config);
        
        // Log to debugger
        if (window.erpDebugger) {
          window.erpDebugger.logDeleteError(id, {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
            message: error.message
          });
        }
        
        // Handle specific error cases
        if (error.response.status === 400 && error.response.data?.message?.includes('reorder requests')) {
          console.error('🚫 DELETE BLOCKED: Item has associated reorder requests');
          console.groupEnd();
          return {
            success: false,
            message: 'Cannot delete inventory item with associated reorder requests. Please handle related reorder requests first.'
          };
        }
        
        if (error.response.status === 404) {
          console.error('🚫 DELETE FAILED: Route not found (404)');
          console.error('This indicates the DELETE route is not properly registered on the server');
          console.groupEnd();
          
          if (window.erpDebugger) {
            window.erpDebugger.logInventoryAction('DELETE_ROUTE_404', {
              itemId: id,
              url: `${axios.defaults.baseURL}/inventory/${id}`,
              message: 'DELETE route not found - server route registration issue'
            });
          }
        }
        
        if (error.response.data && error.response.data.message) {
          console.groupEnd();
          return {
            success: false,
            message: error.response.data.message
          };
        }
      } else if (error.request) {
        console.error('Network Error Details:');
        console.error('- Request was made but no response received');
        console.error('- Request object:', error.request);
        
        if (window.erpDebugger) {
          window.erpDebugger.logDeleteError(id, {
            type: 'network',
            message: 'No response received from server',
            request: error.request
          });
        }
      } else {
        console.error('Request Setup Error:');
        console.error('- Error occurred setting up the request');
        console.error('- Error message:', error.message);
        
        if (window.erpDebugger) {
          window.erpDebugger.logDeleteError(id, {
            type: 'setup',
            message: error.message
          });
        }
      }
      
      console.groupEnd();
      return errorHandler(error);
    }
  },

  // Reorder Request API calls
  scanReorderItems: async (warehouseId) => {
    try {
      includeToken();
      const response = await axios.post('/inventory/reorder-request/scan', { warehouseId });
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },
  
  createReorderRequest: async (reorderData) => {
    try {
      includeToken();
      const response = await axios.post('/inventory/reorder-request', reorderData);
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },
  
  submitReorderRequest: async (id) => {
    try {
      includeToken();
      const response = await axios.put(`/inventory/reorder-request/${id}/submit`);
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },
  
  approveReorderRequest: async (id, { status, notes }) => {
    try {
      includeToken();
      const response = await axios.put(`/inventory/reorder-request/${id}/approve`, { status, notes });
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },
  
  // Warehouse API calls
  getStorageLocations: async () => {
    try {
      includeToken();
      const response = await axios.get('/warehouse/storage-location');
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },
  
  getStorageLocation: async (id) => {
    try {
      includeToken();
      const response = await axios.get(`/warehouse/storage-location/${id}`);
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },
  
  // Bin Location API calls
  getBinLocations: async (storageLocationId = null) => {
    try {
      includeToken();      const url = storageLocationId 
        ? `/warehouse/bin-location?storageLocationId=${storageLocationId}`
        : '/warehouse/bin-location';
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },
  
  getBinLocation: async (id) => {
    try {
      includeToken();
      const response = await axios.get(`/warehouse/bin-location/${id}`);
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },
  
  getBinsByStorageLocation: async (storageLocationId) => {
    try {
      includeToken();
      const response = await axios.get(`/warehouse/storage-location/${storageLocationId}/bins`);
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },
  
  // Transaction API calls
  getTransactions: async (options = {}) => {
    try {
      includeToken();
      let query = '?';
      for (var key in options) {
        query += key + '=' + options[key] + '&';
      }
      query = query.slice(0, -1); // Remove trailing &
      
      const response = await axios.get('/inventory/transaction' + (Object.keys(options).length ? query : ''));
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },
  
  createTransaction: async (transactionData) => {
    try {
      includeToken();
      const response = await axios.post('/inventory/transaction', transactionData);
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },
  
  completeTransaction: async (id) => {
    try {
      includeToken();
      const response = await axios.put(`/inventory/transaction/${id}/complete`);
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },
  // Inventory Reporting API Calls
  getInventoryReportData: async (reportType, startDate, endDate, options = {}) => {
    try {
      includeToken();
      let query = `?reportType=${reportType}`;
      
      // Add date range if provided
      if (startDate && endDate) {
        // Ensure dates are properly formatted
        const formattedStartDate = startDate.format ? startDate.format('YYYY-MM-DD') : startDate;
        const formattedEndDate = endDate.format ? endDate.format('YYYY-MM-DD') : endDate;
        query += `&startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
      }
      
      // Add any additional filter options
      for (const key in options) {
        if (options[key]) {
          query += `&${key}=${encodeURIComponent(options[key])}`;
        }
      }
      
      console.log('Fetching inventory report data with URL:', `/inventory/reports${query}`);
      
      try {
        // First attempt - try the API endpoint
        const response = await axios.get(`/inventory/reports${query}`);
        return response.data;
      } catch (apiError) {
        console.warn('API endpoint failed, falling back to direct inventory data');
        
        // If API fails, fetch inventory data directly and transform it
        const inventoryResponse = await axios.get('/inventory');
        
        if (!inventoryResponse.data.success) {
          throw new Error('Failed to fetch inventory data');
        }
        
        // Get the raw inventory items
        const rawItems = inventoryResponse.data.data || [];
        
        // Transform the data to match the reporting format
        const transformedData = {
          stockLevelData: rawItems.map((item, index) => {
            const currentStock = item.physicalBalance || 0;
            const minLevel = item.minimumLevel || 0;
            const maxLevel = item.maximumLevel || 0;          // Determine stock status - Fix the logic for low stock 
            // Low stock should be when current stock is LESS THAN minimum level
            let stockStatus = 'normal';
            
            // Convert values to explicit numbers to prevent string comparison
            const numCurrentStock = Number(currentStock);
            const numMinLevel = Number(minLevel);
            const numMaxLevel = Number(maxLevel);
            
            // Add debugging to see the exact values being compared
            console.log(`Stock comparison for item ${item.inventoryNumber || index}: currentStock=${numCurrentStock} (${typeof numCurrentStock}), minLevel=${numMinLevel} (${typeof numMinLevel}), maxLevel=${numMaxLevel} (${typeof numMaxLevel})`);
            
            if (numCurrentStock < numMinLevel) {
              console.log(`Item marked as LOW STOCK: ${numCurrentStock} < ${numMinLevel}`);
              stockStatus = 'low';
            }
            if (numCurrentStock >= numMaxLevel) {
              console.log(`Item marked as OVERSTOCK: ${numCurrentStock} >= ${numMaxLevel}`);
              stockStatus = 'over';
            }
            
            // Extract the item number part from inventoryNumber or use it directly
            let simpleItemNumber = item.inventoryNumber;
            if (item.itemMaster && item.itemMaster.itemNumber) {
              simpleItemNumber = item.itemMaster.itemNumber;
            }
            
            return {
              key: index.toString(),
              itemNumber: simpleItemNumber,
              description: item.itemMaster?.shortDescription || 'No Description',
              currentStock,
              minLevel,
              maxLevel,
              reorderPoint: minLevel,
              value: (currentStock * (item.unitPrice || 0)),
              lastCountDate: item.lastCountDate ? new Date(item.lastCountDate).toISOString().split('T')[0] : null,
              category: item.itemMaster?.equipmentCategory || 'UNCATEGORIZED',
              stockStatus
            };
          }),
          movementData: [],
          valuationData: []
        };
          // Calculate some basic metrics for valuation data (grouped by category)
        const categoryMap = {};
          // Count the actual number of low stock and over stock items based on the transformed data
        let actualLowStockCount = transformedData.stockLevelData.filter(item => item.stockStatus === 'low').length;
        let actualOverStockCount = transformedData.stockLevelData.filter(item => item.stockStatus === 'over').length;
        
        // Override the values directly for the KPI cards to ensure consistency
        transformedData.lowStockCount = actualLowStockCount;
        transformedData.overStockCount = actualOverStockCount;
        transformedData.totalItems = transformedData.stockLevelData.length;
        
        console.log(`Metrics based on transformed data: Low stock: ${actualLowStockCount}, Over stock: ${actualOverStockCount}`);
        
        transformedData.stockLevelData.forEach(item => {
          if (!categoryMap[item.category]) {
            categoryMap[item.category] = {
              itemCount: 0,
              totalValue: 0
            };
          }
          
          categoryMap[item.category].itemCount += 1;
          categoryMap[item.category].totalValue += item.value || 0;
        });
        
        // Convert to valuation data array
        const totalValue = Object.values(categoryMap).reduce((sum, cat) => sum + cat.totalValue, 0);
        
        transformedData.valuationData = Object.entries(categoryMap).map(([category, data], index) => ({
          key: index.toString(),
          category,
          itemCount: data.itemCount,
          totalValue: data.totalValue,
          avgValue: data.itemCount > 0 ? data.totalValue / data.itemCount : 0,
          percentOfTotal: totalValue > 0 ? (data.totalValue / totalValue) * 100 : 0
        }));
          // Return both the transformed data and the corrected metrics
        return {
          success: true,
          data: {
            ...transformedData,
            metricOverrides: {
              lowStockCount: actualLowStockCount,
              overStockCount: actualOverStockCount,
              totalItems: transformedData.stockLevelData.length
            }
          }
        };
      }
    } catch (error) {
      console.error('Error fetching inventory report data:', error);
      return errorHandler(error);
    }
  },
  getInventorySummaryMetrics: async () => {
    try {
      includeToken();
      console.log('Fetching inventory summary metrics');
      
      try {
        // First attempt - try the API endpoint
        const response = await axios.get('/inventory/reports/summary');
        return response.data;
      } catch (apiError) {
        console.warn('Summary API endpoint failed, calculating metrics from inventory data');
        
        // If API fails, fetch inventory data and calculate metrics
        const inventoryResponse = await axios.get('/inventory');
        
        if (!inventoryResponse.data.success) {
          throw new Error('Failed to fetch inventory data for metrics calculation');
        }
        
        // Get the inventory items
        const inventoryItems = inventoryResponse.data.data || [];
        
        // Calculate metrics
        let totalValue = 0;
        let totalItems = inventoryItems.length;
        let lowStockCount = 0;
        let overStockCount = 0;
          inventoryItems.forEach(item => {
          const currentStock = item.physicalBalance || 0;
          const minLevel = item.minimumLevel || 0;
          const maxLevel = item.maximumLevel || 0;
            // Convert values to explicit numbers to prevent string comparison
          const numCurrentStock = Number(currentStock);
          const numMinLevel = Number(minLevel);
          const numMaxLevel = Number(maxLevel);
          const numUnitPrice = Number(item.unitPrice || 0);
          
          // Calculate value
          const itemValue = numCurrentStock * numUnitPrice;
          totalValue += itemValue;
          
          // Debug each item's stock levels
          console.log(`Item ${item.inventoryNumber}: currentStock=${numCurrentStock} (${typeof numCurrentStock}), minLevel=${numMinLevel} (${typeof numMinLevel}), maxLevel=${numMaxLevel} (${typeof numMaxLevel})`);
          
          // Check stock status - Fix the logic for low stock
          // Low stock should be when current stock is LESS THAN minimum level
          if (numCurrentStock < numMinLevel) {
            console.log(`Item ${item.inventoryNumber} marked as LOW STOCK: ${numCurrentStock} < ${numMinLevel}`);
            lowStockCount++;
          }
          if (numCurrentStock >= numMaxLevel) {
            console.log(`Item ${item.inventoryNumber} marked as OVERSTOCK: ${numCurrentStock} >= ${numMaxLevel}`);
            overStockCount++;
          }
        });
          // Final check on the results being returned
        console.log(`Summary metrics being returned: Total Items: ${totalItems}, Low Stock: ${lowStockCount}, Over Stock: ${overStockCount}`);
        
        return {
          success: true,
          data: {
            totalValue,
            totalItems,
            lowStockCount,
            overStockCount
          }
        };
      }
    } catch (error) {
      console.error('Error fetching inventory summary metrics:', error);
      return errorHandler(error);
    }
  },
  
  getInventoryTrendData: async (reportType, months = 6) => {
    try {
      includeToken();
      console.log(`Fetching trend data for ${reportType} report`);
      const response = await axios.get(`/inventory/reports/trends?reportType=${reportType}&months=${months}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory trend data:', error);
      return errorHandler(error);
    }
  },
  
  exportInventoryReport: async (reportType, startDate, endDate, format = 'excel', options = {}) => {
    try {
      includeToken();
      let query = `?reportType=${reportType}&format=${format}`;
      
      // Add date range if provided
      if (startDate && endDate) {
        query += `&startDate=${startDate.format('YYYY-MM-DD')}&endDate=${endDate.format('YYYY-MM-DD')}`;
      }
      
      // Add any additional filter options
      for (const key in options) {
        if (options[key]) {
          query += `&${key}=${encodeURIComponent(options[key])}`;
        }
      }
      
      console.log('Exporting inventory report with query:', query);
      const response = await axios.get(`/inventory/reports/export${query}`, {
        responseType: 'blob' // Important for file downloads
      });
      
      // Create a download link for the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inventory-${reportType}-report.${format === 'excel' ? 'xlsx' : format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return { success: true, message: 'Report exported successfully' };
    } catch (error) {
      console.error('Error exporting inventory report:', error);
      return errorHandler(error);
    }
  },
  
  // New function to get inventory data grouped by UNSPSC categories for graphing
  getUnspscCategoryInventoryData: async () => {
    try {
      includeToken();
      console.log('Fetching inventory data grouped by UNSPSC categories');
      
      // First try to get the data from a dedicated endpoint
      try {
        const response = await axios.get('/inventory/reports/unspsc-categories');
        
        // Ensure every item has all required properties
        if (response.data.success && Array.isArray(response.data.data)) {
          const enhancedData = response.data.data.map(item => ({
            name: item.name || item.title || 'Unknown Category',
            code: item.code || 'unknown',
            value: Number(item.value || item.totalStock || 0),
            itemCount: Number(item.itemCount || item.items?.length || 1),
            description: item.description || null
          }));
          
          return {
            success: true,
            data: enhancedData
          };
        }
        
        return response.data;
      } catch (apiError) {
        console.warn('UNSPSC category API endpoint failed, generating data from inventory items');
        
        // If the API endpoint fails, fetch inventory and item master data to build the dataset
        const inventoryResponse = await axios.get('/inventory?include=itemMaster');
        
        if (!inventoryResponse.data.success) {
          throw new Error('Failed to fetch inventory data');
        }
        
        const inventoryItems = inventoryResponse.data.data || [];
        
        // Map to extract item numbers from inventory numbers
        const processedItems = inventoryItems.map(item => {
          // Extract the item number from inventoryNumber (before third dash, after first dash)
          let itemNumber = item.inventoryNumber || '';
          let extractedItemNumber = '';
          
          if (itemNumber.includes('-')) {
            const parts = itemNumber.split('-');
            if (parts.length >= 3) {
              extractedItemNumber = parts.slice(0, 3).join('-');
            }
          }
          
          // Get the UNSPSC code from the associated ItemMaster
          const unspscCode = item.itemMaster?.unspscCode || '';
          const unspscTitle = item.itemMaster?.unspsc?.title || 'Unknown Category';
          
          return {
            itemNumber: extractedItemNumber,
            fullInventoryNumber: item.inventoryNumber,
            description: item.itemMaster?.shortDescription || 'No Description',
            currentStock: Number(item.physicalBalance || 0),
            unspscCode,
            unspscTitle,
            category: item.itemMaster?.equipmentCategory || 'UNCATEGORIZED'
          };
        });
        
        // Group by UNSPSC code/title
        const groupedByUnspsc = {};
        
        processedItems.forEach(item => {
          const categoryKey = item.unspscCode || 'unknown';
          const categoryTitle = item.unspscTitle || 'Unknown Category';
          
          if (!groupedByUnspsc[categoryKey]) {
            groupedByUnspsc[categoryKey] = {
              code: categoryKey,
              title: categoryTitle,
              totalStock: 0,
              items: []
            };
          }
          
          groupedByUnspsc[categoryKey].totalStock += item.currentStock;
          groupedByUnspsc[categoryKey].items.push(item);
        });
        
        // Convert to array format suitable for charting
        const chartData = Object.values(groupedByUnspsc).map(group => ({
          name: group.title,
          code: group.code,
          value: group.totalStock,
          itemCount: group.items.length,
          // Add a description based on the items in this category
          description: group.items.length > 0 
            ? `Includes ${group.items.slice(0, 3).map(i => i.description).join(', ')}${group.items.length > 3 ? '...' : ''}`
            : null
        }));
        
        return {
          success: true,
          data: chartData
        };
      }
    } catch (error) {
      console.error('Error fetching UNSPSC category inventory data:', error);
      return errorHandler(error);
    }
  }
};

export default inventoryService;
