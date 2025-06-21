import axios from 'axios';
import { API_BASE_URL } from '@/config/serverApiConfig';
import errorHandler from '@/request/errorHandler';
import successHandler from '@/request/successHandler';
import storePersist from '@/redux/storePersist';

// Include auth token in requests
function includeToken() {
  const auth = storePersist.get('auth');
  if (auth?.current?.token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${auth.current.token}`;
    axios.defaults.headers.common['x-auth-token'] = auth.current.token;
  }
  axios.defaults.baseURL = API_BASE_URL;
  axios.defaults.withCredentials = true;
}

const settingsService = {
  getAllSettings: async () => {
    try {
      includeToken();
      const response = await axios.get('setting/listAll');
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },

  getSetting: async (key) => {
    try {
      includeToken();
      const response = await axios.get(`setting/${key}`);
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },

  // Add other settings-related API calls here
};

export default settingsService;
