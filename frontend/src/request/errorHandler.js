import { App } from 'antd';
import codeMessage from './codeMessage';

// Create a notification function that can be safely used outside components
let notificationApi = null;

export const setNotificationApi = (api) => {
  notificationApi = api;
};

// Safe notification function that falls back to console.error if notification API isn't available
const safeNotify = (type, config) => {
  if (notificationApi) {
    notificationApi[type](config);
  } else {
    console.error('Notification would have shown:', type, config);
  }
};

const errorHandler = (error, options = { notifications: true }) => {
  console.error('API Error:', error);
  
  if (!error) {
    return {
      success: false,
      result: null,
      message: 'Unknown error occurred',
    };
  }

  // Handle different types of errors
  if (error.message === 'Network Error') {
    const message = 'Cannot connect to the server. Please check if the backend server is running.';
    if (options.notifications) {
      safeNotify('error', {
        message: 'Connection Error',
        description: message,
      });
    }
    
    return {
      success: false,
      result: null,
      message,
    };
  }
  
  // Handle CORS or connection refused errors
  if (error.code === 'ERR_CONNECTION_REFUSED') {
    const message = 'Unable to connect to the server. Please ensure the backend service is running.';
    if (options.notifications) {
      safeNotify('error', {
        message: 'Connection Error',
        description: message,
      });
    }
    
    return {
      success: false,
      result: null,
      message: 'Network Error - Cannot connect to the server',
    };
  }

  // Extract error response if available
  let errorResponse = {
    success: false,
    result: null,
    message: error.message || 'Unknown error occurred',
  };
  // Try to get more detailed error information from the response
  if (error.response) {
    const { status, data } = error.response;
    
    // Add status code to the error
    errorResponse.status = status;
    
    // If the server returned an error message, use it
    if (data) {
      if (data.message) {
        errorResponse.message = data.message;
      }
      
      // Add error details if available for debugging
      if (data.errorDetails) {
        errorResponse.errorDetails = data.errorDetails;
        console.log('Server error details:', data.errorDetails);
      }
      
      if (data.error) {
        errorResponse.error = data.error;
      }
      
      // If there's validation errors
      if (data.errors) {
        errorResponse.errors = data.errors;
      }
    }    // Show notification based on status code
    if (options.notifications) {
      let description = errorResponse.message;
      
      switch (status) {
        case 400:
          safeNotify('error', {
            message: 'Invalid Request',
            description: description || 'The request was invalid.',
          });
          break;
        case 401:
          safeNotify('error', {
            message: 'Unauthorized',
            description: description || 'You are not authorized to perform this action.',
          });
          break;
        case 403:
          safeNotify('error', {
            message: 'Forbidden',
            description: description || 'You do not have permission to access this resource.',
          });
          break;
        case 404:
          safeNotify('error', {
            message: 'Not Found',
            description: description || 'The requested resource was not found.',
          });
          break;
        case 500:
          safeNotify('error', {
            message: 'Server Error',
            description: description || 'An internal server error occurred.',
          });
          break;
        default:
          safeNotify('error', {
            message: `Error ${status}`,
            description: description || 'An error occurred during the request.',
          });
      }
    }  } else if (options.notifications) {
    // Generic error notification if no response
    safeNotify('error', {
      message: 'Error',
      description: errorResponse.message,
    });
  }

  return errorResponse;
};

export default errorHandler;
