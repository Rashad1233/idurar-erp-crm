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

const procurementService = {
  // ====== PURCHASE REQUISITION API CALLS ======
  getPurchaseRequisitions: async (options = {}) => {
    try {
      includeToken();
      let query = '?';
      for (var key in options) {
        query += key + '=' + options[key] + '&';
      }
      query = query.slice(0, -1); // Remove trailing &
        console.log('🔍 Fetching purchase requisitions with URL:', '/procurement/purchase-requisition' + (Object.keys(options).length ? query : ''));
      
      const response = await axios.get('/procurement/purchase-requisition' + (Object.keys(options).length ? query : ''));
      
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching purchase requisitions:', error);
      return errorHandler(error);
    }
  },
  
  getPurchaseRequisition: async (id) => {
    try {
      includeToken();      console.log(`🔍 Fetching purchase requisition details for ID: ${id}`);
      const response = await axios.get(`/procurement/purchase-requisition/${id}`);
      
      // Add extra validation for the response
      if (!response.data || !response.data.success) {
        console.error('❌ Purchase requisition API response indicates failure:', response.data);
        return {
          success: false,
          message: response.data?.message || 'Failed to retrieve purchase requisition data',
          data: null
        };
      }
      
      console.log('✅ Successfully retrieved purchase requisition:', response.data.data.id);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching purchase requisition:', error);
      return errorHandler(error);
    }
  },
  
  createPurchaseRequisition: async (prData) => {
    try {
      includeToken();
      console.log('🔍 Creating purchase requisition with data:', prData);
      const response = await axios.post('/procurement/purchase-requisition', prData);
      
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Error creating purchase requisition:', error);
      return errorHandler(error);
    }
  },
  
  updatePurchaseRequisition: async (id, prData) => {
    try {
      includeToken();
      console.log(`🔍 Updating purchase requisition ID: ${id}`);
      const response = await axios.put(`/procurement/purchase-requisition/${id}`, prData);
      
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Error updating purchase requisition:', error);
      return errorHandler(error);
    }
  },
  
  submitPurchaseRequisition: async (id) => {
    try {
      includeToken();
      console.log(`🔍 Submitting purchase requisition ID: ${id} for approval`);
      const response = await axios.put(`/procurement/purchase-requisition/${id}/submit`);
      
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Error submitting purchase requisition:', error);
      return errorHandler(error);
    }
  },
  
  approvePurchaseRequisition: async (id, { status, comments }) => {
    try {
      includeToken();
      console.log(`🔍 ${status === 'approved' ? 'Approving' : 'Rejecting'} purchase requisition ID: ${id}`);
      const response = await axios.put(`/procurement/purchase-requisition/${id}/approve`, { status, comments });
      
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      
      return response.data;
    } catch (error) {
      console.error(`❌ Error ${status === 'approved' ? 'approving' : 'rejecting'} purchase requisition:`, error);
      return errorHandler(error);
    }
  },
  
  deletePurchaseRequisition: async (id) => {
    try {
      includeToken();
      console.log(`🔍 Deleting purchase requisition ID: ${id}`);
      const response = await axios.delete(`/procurement/purchase-requisition/${id}`);
      
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting purchase requisition:', error);
      return errorHandler(error);
    }
  },
  
  getPendingApprovals: async () => {
    try {
      includeToken();
      console.log('🔍 Fetching pending approvals for current user');
      const response = await axios.get('/procurement/purchase-requisition/pending-approvals');
      
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching pending approvals:', error);
      return errorHandler(error);
    }
  },
  
  // ====== REQUEST FOR QUOTATION (RFQ) API CALLS ======
  getRFQs: async (options = {}) => {
    try {
      includeToken();
      let query = '?';
      for (var key in options) {
        query += key + '=' + options[key] + '&';
      }
      query = query.slice(0, -1); // Remove trailing &
        console.log('🔍 Fetching RFQs with URL:', '/procurement/rfq' + (Object.keys(options).length ? query : ''));
      
      const response = await axios.get('/procurement/rfq' + (Object.keys(options).length ? query : ''));
      
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching RFQs:', error);
      return errorHandler(error);
    }
  },
  
  getRFQ: async (id) => {
    try {
      includeToken();
      console.log(`🔍 Fetching RFQ details for ID: ${id}`);
      const response = await axios.get(`/procurement/rfq/${id}`);
      
      // Add extra validation for the response
      if (!response.data || !response.data.success) {
        console.error('❌ RFQ API response indicates failure:', response.data);
        return {
          success: false,
          message: response.data?.message || 'Failed to retrieve RFQ data',
          data: null
        };
      }
      
      console.log('✅ Successfully retrieved RFQ:', response.data.data.id);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching RFQ:', error);
      return errorHandler(error);
    }
  },
  
  createRFQ: async (rfqData) => {
    try {
      includeToken();
      console.log('🔍 Creating RFQ with data:', rfqData);
      const response = await axios.post('/procurement/rfq', rfqData);
      
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Error creating RFQ:', error);
      return errorHandler(error);
    }
  },
  
  updateRFQ: async (id, rfqData) => {
    try {
      includeToken();
      console.log(`🔍 Updating RFQ ID: ${id}`);
      const response = await axios.put(`/procurement/rfq/${id}`, rfqData);
      
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Error updating RFQ:', error);
      return errorHandler(error);
    }
  },
  
  sendRFQ: async (id) => {
    try {
      includeToken();
      console.log(`🔍 Sending RFQ ID: ${id} to suppliers`);
      const response = await axios.put(`/procurement/rfq/${id}/send`);
      
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Error sending RFQ:', error);
      return errorHandler(error);
    }
  },
  
  recordSupplierQuote: async (id, quoteData) => {
    try {
      includeToken();
      console.log(`🔍 Recording supplier quote for RFQ ID: ${id}`);
      const response = await axios.post(`/procurement/rfq/${id}/quote`, quoteData);
      
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Error recording supplier quote:', error);
      return errorHandler(error);
    }
  },
  
  selectQuotes: async (id, selectedQuotes) => {
    try {
      includeToken();
      console.log(`🔍 Selecting quotes for RFQ ID: ${id}`);
      const response = await axios.put(`/procurement/rfq/${id}/select-quotes`, { selectedQuotes });
      
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Error selecting quotes:', error);
      return errorHandler(error);
    }
  },
  
  cancelRFQ: async (id, reason) => {
    try {
      includeToken();
      console.log(`🔍 Cancelling RFQ ID: ${id}`);
      const response = await axios.put(`/procurement/rfq/${id}/cancel`, { reason });
      
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Error cancelling RFQ:', error);
      return errorHandler(error);
    }
  },
  
  getRFQsByPR: async (prId) => {
    try {
      includeToken();
      console.log(`🔍 Fetching RFQs for Purchase Requisition ID: ${prId}`);
      const response = await axios.get(`/procurement/rfq/by-pr/${prId}`);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching RFQs by PR:', error);
      return errorHandler(error);
    }
  },
  
  createRFQFromPR: async (prId, rfqData) => {
    try {
      includeToken();
      console.log(`🔍 Creating RFQ from Purchase Requisition ID: ${prId}`);
      const response = await axios.post(`/procurement/rfq/from-pr/${prId}`, rfqData);
      
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Error creating RFQ from PR:', error);
      return errorHandler(error);
    }
  },
  
  // ====== SUPPLIER API CALLS ======
  getSuppliers: async (options = {}) => {
    try {
      includeToken();
      let query = '?';
      for (var key in options) {
        query += key + '=' + options[key] + '&';
      }
      query = query.slice(0, -1); // Remove trailing &
        console.log('🔍 Fetching suppliers with URL:', '/procurement/supplier' + (Object.keys(options).length ? query : ''));
      
      const response = await axios.get('/procurement/supplier' + (Object.keys(options).length ? query : ''));
      
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching suppliers:', error);
      return errorHandler(error);
    }
  },
    getSupplier: async (id) => {
    try {
      includeToken();
      console.log(`🔍 Fetching supplier details for ID: ${id}`);
      const response = await axios.get(`/procurement/supplier/${id}`);
      
      // Add extra validation for the response
      if (!response.data || !response.data.success) {
        console.error('❌ Supplier API response indicates failure:', response.data);
        return {
          success: false,
          message: response.data?.message || 'Failed to retrieve supplier data',
          data: null
        };
      }
      
      console.log('✅ Successfully retrieved supplier:', response.data.data.id);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching supplier:', error);
      return errorHandler(error);
    }
  },
  
  createSupplier: async (supplierData) => {
    try {
      includeToken();
      console.log('🔍 Creating supplier with data:', supplierData);
      const response = await axios.post('/procurement/supplier', supplierData);
      
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Error creating supplier:', error);
      return errorHandler(error);
    }
  },
  
  updateSupplier: async (id, supplierData) => {
    try {
      includeToken();
      console.log(`🔍 Updating supplier ID: ${id}`);
      const response = await axios.put(`/procurement/supplier/${id}`, supplierData);
      
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Error updating supplier:', error);
      return errorHandler(error);
    }
  },
  
  deleteSupplier: async (id) => {
    try {
      includeToken();
      console.log(`🔍 Deleting supplier ID: ${id}`);
      const response = await axios.delete(`/procurement/supplier/${id}`);
      
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting supplier:', error);
      return errorHandler(error);
    }
  },
  
  // ====== PURCHASE ORDER API CALLS ======
  getPurchaseOrders: async (options = {}) => {
    try {
      includeToken();
      let query = '?';
      for (var key in options) {
        query += key + '=' + options[key] + '&';
      }
      query = query.slice(0, -1); // Remove trailing &
        console.log('🔍 Fetching purchase orders with URL:', '/procurement/purchase-order' + (Object.keys(options).length ? query : ''));
      
      const response = await axios.get('/procurement/purchase-order' + (Object.keys(options).length ? query : ''));
      
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching purchase orders:', error);
      return errorHandler(error);
    }
  },
  
  // ====== CONTRACT API CALLS ======
  getContracts: async (options = {}) => {
    try {
      includeToken();
      let query = '?';
      for (var key in options) {
        query += key + '=' + options[key] + '&';
      }
      query = query.slice(0, -1); // Remove trailing &
        console.log('🔍 Fetching contracts with URL:', '/procurement/contract' + (Object.keys(options).length ? query : ''));
      
      const response = await axios.get('/procurement/contract' + (Object.keys(options).length ? query : ''));
      
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching contracts:', error);
      return errorHandler(error);
    }
  },
  
  // ====== DELEGATION OF AUTHORITY (DOFA) API CALLS ======
  getDelegationOfAuthorities: async () => {
    try {
      includeToken();
      console.log('🔍 Fetching delegation of authorities');
      const response = await axios.get('/procurement/delegation-of-authority');
      
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching delegation of authorities:', error);
      return errorHandler(error);
    }
  },
};

export default procurementService;
