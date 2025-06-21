import { API_BASE_URL } from '@/config/serverApiConfig';

import axios from 'axios';
import errorHandler from '@/request/errorHandler';
import successHandler from '@/request/successHandler';

export const login = async ({ loginData }) => {
  try {    const response = await axios.post(
      API_BASE_URL + `auth/login?timestamp=${new Date().getTime()}`,
      loginData
    );const { status, data } = response;
    
    // For login, we expect a direct response with user data and token
    if (status === 200 && data) {
      // Format the response to match what the auth reducer expects
      const formattedResponse = {
        success: true,
        result: {
          name: data.name,
          email: data.email,
          role: data.role,
          permissions: {
            createItemMaster: data.createItemMaster,
            editItemMaster: data.editItemMaster,
            approveItemMaster: data.approveItemMaster,
            setInventoryLevels: data.setInventoryLevels,
            createReorderRequests: data.createReorderRequests,
            approveReorderRequests: data.approveReorderRequests,
            warehouseTransactions: data.warehouseTransactions
          },
          token: data.token
        }
      };
      
      successHandler(
        { data: formattedResponse, status },
        {
          notifyOnSuccess: false,
          notifyOnFailed: false,
        }
      );
      return formattedResponse;
    }

    // Handle unsuccessful login
    return errorHandler({
      response: {
        status,
        data: { message: data.message || 'Login failed' }
      }
    });
  } catch (error) {
    return errorHandler(error);
  }
};

export const register = async ({ registerData }) => {
  try {
    const response = await axios.post(API_BASE_URL + `register`, registerData);

    const { status, data } = response;

    successHandler(
      { data, status },
      {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      }
    );
    return data;
  } catch (error) {
    return errorHandler(error);
  }
};

export const verify = async ({ userId, emailToken }) => {
  try {
    const response = await axios.get(API_BASE_URL + `verify/${userId}/${emailToken}`);

    const { status, data } = response;

    successHandler(
      { data, status },
      {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      }
    );
    return data;
  } catch (error) {
    return errorHandler(error);
  }
};

export const resetPassword = async ({ resetPasswordData }) => {
  try {
    const response = await axios.post(API_BASE_URL + `resetpassword`, resetPasswordData);

    const { status, data } = response;

    successHandler(
      { data, status },
      {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      }
    );
    return data;
  } catch (error) {
    return errorHandler(error);
  }
};
export const logout = async () => {
  axios.defaults.withCredentials = true;
  try {
    // window.localStorage.clear();
    const response = await axios.post(API_BASE_URL + `logout?timestamp=${new Date().getTime()}`);
    const { status, data } = response;

    successHandler(
      { data, status },
      {
        notifyOnSuccess: false,
        notifyOnFailed: true,
      }
    );
    return data;
  } catch (error) {
    return errorHandler(error);
  }
};

//  console.log(
//    '🚀 Welcome to IDURAR ERP CRM! Did you know that we also offer commercial customization services? Contact us at hello@idurarapp.com for more information.'
//  );
